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
		const mockProperties = Array(24).fill({ id:1, L_City: 'Orlando' });

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

	//Test each filter type of /api/properties

	//Test invalid filter inputs of /api/properties

});

