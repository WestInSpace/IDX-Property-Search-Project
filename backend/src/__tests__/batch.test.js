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

describe('POST /api/properties/batch', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	//Test fetching multiple properties for an array of ida
	it('should fetch matching properties for an array of valid IDs', async () => {
		const mockProperties = [
			{id: 101, L_ListingID: '101'},
			{id: 111, L_ListingID: '111'},
		];

		pool.query.mockResolvedValueOnce([mockProperties]);

		const response = await request(app).post('/api/properties/batch').send({ ids: [101, 111] });

		expect(response.status).toBe(200);
		expect(response.body).toEqual({
			property: mockProperties,
			totalItems: 2,
		});
		expect(pool.query).toHaveBeenCalledWith(
			'SELECT * FROM rets_property WHERE id IN (?, ?) OR L_ListingID IN (?, ?)',
			[101, 111, 101, 111]
		);
	});

	//Test if ids array is missing or empty

	//Test all invalid ids

	//Test Some ids invalid

	//Test database error


});
