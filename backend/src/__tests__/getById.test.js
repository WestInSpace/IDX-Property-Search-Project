import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';

jest.unstable_mockModule('../config/db.js', () => ({
  default: {
    query: jest.fn(),
  },
}));

const { default: pool } = await import('../config/db.js');
const { default: propertiesRouter } = await import('../routes/properties.js');

const app = express();
app.use(express.json());
app.use('/api/properties', propertiesRouter);

describe('GET /api/properties/:id (get a single property by id)', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	//Test get property by id
	it('should return a property object when a valid ID matches', async () => {
		const mockProperty = { id: 101, L_ListingID: 'LID101', L_City: 'orlando'};

		pool.query.mockResolvedValueOnce([[mockProperty]]);

		const response = await request(app).get('/api/properties/101');

		expect(response.status).toBe(200);
		expect(response.body).toEqual({id: 101, L_ListingID: 'LID101', L_City: 'orlando'});
		expect(pool.query).toHaveBeenCalledWith(
			'SELECT * FROM rets_property WHERE id = ? OR L_ListingID = ?', ['101', '101']
		);
	});

	//Test get property by L_ListingID fallback
	it('should return a property object when lookup by L_ListingID', async () => {
		const mockProperty = { id: 101, L_ListingID: 'LID101', L_City: 'orlando'};

		pool.query.mockResolvedValueOnce([[mockProperty]]);

		const response = await request(app).get('/api/properties/LID101');

		expect(response.status).toBe(200);
		expect(response.body).toEqual({id: 101, L_ListingID: 'LID101', L_City: 'orlando'});
		expect(pool.query).toHaveBeenCalledWith(
			'SELECT * FROM rets_property WHERE id = ? OR L_ListingID = ?', ['LID101', 'LID101']
		);
	});

	//Test when requested property doesn't exist
	it('should return 404 when property is not found', async () => {

		pool.query.mockResolvedValueOnce([[]]); //mock returning nothing

		const response = await request(app).get('/api/properties/13')

		expect(response.status).toBe(404);
		expect(response.body).toEqual({
			message: 'Property not found, check that the id is valid',
		});
	});

	//Test database error
	it('should return 500 when database error occures', async () => {
		pool.query.mockRejectedValueOnce(new Error('Database error'));

		const response = await request(app).get('/api/properties/101');

		expect(response.status).toBe(500);
		expect(response.body).toEqual({ error: 'Database error'});
	});

});
