import { describe, test, expect, vi, afterEach} from 'vitest';
import { propertyService } from '../api/propertyService';

global.fetch = vi.fn();

describe('propertyService - API Client Module', () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	//API tests

	//testing a successful fetch
	test('getProperties returns a valid property array and pagination metadata on success', async () => {
		const mockResponseData = {
			property: [{ id: 1, L_Address: '123 Main St', L_SystemPrice: 500000}],
			pagination: { totalItems: 1, totalPages: 1, currentPage: 1, itemsPerPage: 24, hasNextPage: false, hasPrevPage: false }
		};

		//simulate a successful response
		fetch.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => Promise.resolve(mockResponseData), //mockResponseData,
		});

		const result = await propertyService.getProperties({});

		//ensure the data is correctly parsed
		expect(result.property).toHaveLength(1);
		expect(result.property[0].L_Address).toBe('123 Main St');
		expect(result.pagination.totalItems).toBe(1);
	});
	
	//Test the filter strings
	test('getProperties appends query parameters to the request URL', async () => {
		fetch.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => ({ property: [], pagination: {} }),
		});
		
		const mockFilters = { city: 'Solana Beach', beds: 3};
		await propertyService.getProperties(mockFilters);
		
		//inspect the url config that fetch was called with
		const firstCallArgs = fetch.mock.calls[0][0];
		
		expect(firstCallArgs).toContain('city=Solana+Beach');
		expect(firstCallArgs).toContain('beds=3');
	});

	//Tests with a failed call to test error handling
	test('getProperties throws an error message when the network request fails', async () => {
		//simulate a server crash
		fetch.mockResolvedValueOnce({
			ok: false,
			status: 500,
			statusText: 'Internal Server Error'
		});

		await expect(propertyService.getProperties({})).rejects.toThrow();
	});
});
