import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';

//register the mock before importing modules that depend on db.js
//This is to avoid importing the actual database
jest.unstable_mockModule('../config/db.js', () => ({
	default: {
		query: jest.fn(),
	},
}));

//import pool and router so they use the registered mock
const { default: pool } = await import('../config/db.js');
const { default: propertiesRouter } = await import('../routes/properties.js');

//setup isolated express app
const app = express();
app.use(express.json());
app.use('/api/properties', propertiesRouter);

describe('GET /api/properites (search and Filtering)', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	//Test the succssess of /api/properties	
	it('should return default paginated properties when no filters are provided', async () =>{
		const mockCount = [{ total: 30 }];
		const mockProperties = Array(24).fill({ id: 1, L_City: 'Orlando' });

		pool.query.mockResolvedValueOnce([mockCount]).mockResolvedValueOnce([mockProperties]);

		const response = await request(app).get('/api/properties');

		expect(response.status).toBe(200);
		expect(response.body.pagination).toEqual({
			totalItems: 30,
			totalPages: 2,
			currentPage: 1,
			itemsPerPage: 24,
			hasNextPage: true,
			hasPrevPage: false,
		});
		expect(response.body.property).toHaveLength(24);
	});

	//Test the pagination results of /api/properties
	it('Should handle custom limit and offset query params', async () => {
		pool.query.mockResolvedValueOnce([[{ total: 50 }]]).mockResolvedValueOnce([[{id: 21}, {id: 22}]]);

		const response = await request(app).get('/api/properties').query({limit: '10', offset: '20'});

		expect(response.status).toBe(200);
		expect(response.body.pagination).toEqual({
			totalItems: 50,
			totalPages: 5,
			currentPage: 3,
			itemsPerPage: 10,
			hasNextPage: true,
			hasPrevPage: true,
		});
	});

	//Test each filter type of /api/properties
	//Test filter by city
	it('Should filter by city, trimmed and lowercased', async () => {
		const mockProperties = [{id: 1, L_City: 'orlando'}, {id: 2, L_City: 'tampa'}];

		pool.query.mockResolvedValueOnce([[{ total: 1 }]]).mockResolvedValueOnce([mockProperties]);

		const response = await request(app).get('/api/properties').query({ city: ' Tampa ' });

		expect(response.status).toBe(200);
		const countCall = pool.query.mock.calls[0];
		expect(countCall[0]).toContain('WHERE TRIM(L_City) = ?');
		expect(countCall[1]).toEqual(['tampa']);

	});

	//Test filter by zipcode
	it('Should filter by zipcode', async () => {
		const mockProperties = [{id: 1, L_zip: 32801}, {id: 2, L_zip: 32765}];

		pool.query.mockResolvedValueOnce([[{ total: 1 }]]).mockResolvedValueOnce([mockProperties]);

		const response = await request(app).get('/api/properties').query({ zipcode: '32801' });

		expect(response.status).toBe(200);
		const countCall = pool.query.mock.calls[0];
		expect(countCall[0]).toContain('WHERE L_zip = ?');
		expect(countCall[1]).toEqual([32801]);

	});
	
	//Test filter by price range
	it('Should filter by price range using BETWEEN when both minPrice and maxPrice are present', async () => {
		const mockProperties = [{id: 1, L_SystemPrice: 300000}, {id: 2, L_SystemPrice: 500000}, {id: 3, L_SystemPrice: 1000000}];

		pool.query.mockResolvedValueOnce([[{ total: 1 }]]).mockResolvedValueOnce([mockProperties]);

		const response = await request(app).get('/api/properties').query({ minPrice: '400000', maxPrice: '600000' });

		expect(response.status).toBe(200);
		const countCall = pool.query.mock.calls[0];
		expect(countCall[0]).toContain('WHERE L_SystemPrice BETWEEN ? AND ?');
		expect(countCall[1]).toEqual([400000, 600000]);
	});

	//Test filter by minPrice only
	it('Should filter by minPrice only', async () => {
		const mockProperties = [{id: 1, L_SystemPrice: 300000}, {id: 2, L_SystemPrice: 500000}, {id: 3, L_SystemPrice: 1000000}];

		pool.query.mockResolvedValueOnce([[{ total: 2 }]]).mockResolvedValueOnce([mockProperties]);

		const response = await request(app).get('/api/properties').query({ minPrice: '400000'});

		expect(response.status).toBe(200);
		const countCall = pool.query.mock.calls[0];
		expect(countCall[0]).toContain('WHERE L_SystemPrice >= ?');
		expect(countCall[1]).toEqual([400000]);
	});

	//Test filter by maxPrice only
	it('Should filter by maxPrice only', async () => {
		const mockProperties = [{id: 1, L_SystemPrice: 300000}, {id: 2, L_SystemPrice: 500000}, {id: 3, L_SystemPrice: 1000000}];

		pool.query.mockResolvedValueOnce([[{ total: 2 }]]).mockResolvedValueOnce([mockProperties]);

		const response = await request(app).get('/api/properties').query({ maxPrice: '600000'});

		expect(response.status).toBe(200);
		const countCall = pool.query.mock.calls[0];
		expect(countCall[0]).toContain('WHERE L_SystemPrice <= ?');
		expect(countCall[1]).toEqual([600000]);
	});

	//Test filter by beds and baths
	it('Should filter by beds and baths', async () => {
		const mockProperties = [{id: 1, L_Keyword2: 2, LM_Dec_3: 1}, {id: 2, L_Keyword2: 3, LM_Dec_3: 2}];

		pool.query.mockResolvedValueOnce([[{ total: 1 }]]).mockResolvedValueOnce([mockProperties]);

		const response = await request(app).get('/api/properties').query({ beds: '3', baths: '2'});

		expect(response.status).toBe(200);
		const countCall = pool.query.mock.calls[0];
		expect(countCall[0]).toContain('WHERE L_Keyword2 >= ? AND LM_Dec_3 >= ?');
		expect(countCall[1]).toEqual([3, 2]);
	});

	//Test filter should filter by beds
	it('Should filter by beds only', async () => {
		const mockProperties = [{id: 1, L_Keyword2: 2}, {id: 2, L_Keyword2: 3}];

		pool.query.mockResolvedValueOnce([[{ total: 1 }]]).mockResolvedValueOnce([mockProperties]);

		const response = await request(app).get('/api/properties').query({ beds: '3'});

		expect(response.status).toBe(200);
		const countCall = pool.query.mock.calls[0];
		expect(countCall[0]).toContain('WHERE L_Keyword2 >= ?');
		expect(countCall[1]).toEqual([3]);
	});

	//Test filter by baths
	it('Should filter by baths only', async () => {
		const mockProperties = [{id: 1, LM_Dec_3: 1}, {id: 2, LM_Dec_3: 2}];

		pool.query.mockResolvedValueOnce([[{ total: 1 }]]).mockResolvedValueOnce([mockProperties]);

		const response = await request(app).get('/api/properties').query({ baths: '2'});

		expect(response.status).toBe(200);
		const countCall = pool.query.mock.calls[0];
		expect(countCall[0]).toContain('WHERE LM_Dec_3 >= ?');
		expect(countCall[1]).toEqual([2]);
	});

	//Test invalid filter inputs of /api/properties
	it('Should return 400 Bad Request with validation messages for invalid inputs', async () => {
		const response = await request(app).get('/api/properties').query({zipcode: 'invalid', minPrice: '-100', beds: 'nonNumber', baths: 'nonNumber'});

		expect(response.status).toBe(400);
		expect(response.body).toEqual({
			error: 'Bad Request',
			messages: [
				'zipcode not a valid number.',
				'minPrice not a valid number.',
				'beds not a valid number.',
				'baths not a valid number.',
			],
		});
		expect(pool.query).not.toHaveBeenCalled();
	});

});

