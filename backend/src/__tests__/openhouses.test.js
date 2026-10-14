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

describe('GET /api/properties/:id/openhouses', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});
	
	//Test retriving openhouses from a valid property
	it('should return open house records for a valid property', async () => {
		const mockProperty = [{ L_ListingID: '101' }];
		const mockOpenHouses = [
			{id: 1, L_ListingID: '101', L_DisplayId: 'oh101'},
			{id: 2, L_ListingID: '101', L_DisplayId: 'oh101'},
		];

		pool.query.mockResolvedValueOnce([mockProperty]).mockResolvedValueOnce([mockOpenHouses]);

		const response = await request(app).get('/api/properties/101/openhouses');

		expect(response.status).toBe(200);
		expect(response.body).toEqual(mockOpenHouses);
		expect(pool.query).toHaveBeenNthCalledWith(
			1,
			'SELECT L_ListingID FROM rets_property WHERE id = ? OR L_ListingID = ?',
			[101, 101]
		);
		expect(pool.query).toHaveBeenNthCalledWith(
			2,
			'SELECT * FROM rets_openhouse WHERE L_ListingID = ?',
			['101']
		);
	});

	//Test property with no openhouses
	it('should return empty array if property has no open houses', async () => {
		const mockProperty = [{ L_ListingID: '101'}];

		pool.query.mockResolvedValueOnce([mockProperty]).mockResolvedValueOnce([[]]);

		const response = await request(app).get('/api/properties/101/openhouses');

		expect(response.status).toBe(200);
		expect(response.body).toEqual([]);
	});

	//Test openHouses if property does not exist
	it('should return 404 if property does not exist', async () => {
		pool.query.mockResolvedValueOnce([[]]);

		const response = await request(app).get('/api/properties/101/openhouses');

		expect(response.status).toBe(404);
		expect(response.body).toEqual({ message: 'Property not found' });
		expect(pool.query).toHaveBeenCalledTimes(1);
	});

	//Test database error
	it('should return 500 when database fails', async () => {
		pool.query.mockRejectedValueOnce(new Error('Database error'));

		const response = await request(app).get('/api/properties/101/openhouses');

		expect(response.status).toBe(500);
		expect(response.body).toEqual({ error: 'Database error' });
	});

});

















