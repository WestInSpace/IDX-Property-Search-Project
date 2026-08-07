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

	//test return a property object when id matches
	it('should return a property object when a valid ID matches', async () => {
		const mockProperty = [{ id: 101, L_ListingID: '101', L_City: 'orlando'}, { id: 111, L_ListingID: '111', L_City: 'tampa'}];

		pool.query.mockResolvedValueOnce([mockProperty]);

		const response = await request(app).get('/api/properties/101');

		expect(response.status).toBe(200);
		expect(response.body).toEqual({id: 101, L_ListingID: '101', L_City: 'orlando'});
		expect(pool.query).toHaveBeenCalledWith(
			'SELECT * FROM rets_property WHERE id = ? OR L_ListingID = ?', ['101', '101']
		);
	});

});
