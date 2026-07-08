//This is the ListingsPage component. This will be used to display the grid that holds PropertyCard components

import React, { useEffect, useState } from 'react';
import { propertyService } from '../api/propertyService';
import PropertyCard from './PropertyCard';
import styles from './css_modules/ListingsPage.module.css';

function ListingsPage(){
	const[properties, setProperties] = useState([]); //store the properties returned from the backend
	const [pagination, setPagination] = useState({}); //store the pagination metadata from the backend
	const [page, setPage] = useState(1); //track the currentPage number
	const limit = 24; //set the limit for how many listings will be on a page
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchListings = async () => {
			try {
				setLoading(true);
				
				//Calculate the row offset based on page selection
				const currentOffset = (page-1) * limit;

				//define filters
				const paginationParams = {
					//city: 'Solana Beach',
					//zipcode: 1234
					//minPrice: 300000,
					//maxPrice: 4395000,
					//beds: 3,
					//baths: 2,
					limit: limit,
					offset: currentOffset
				}

				const backendObj = await propertyService.getProperties(paginationParams);

				//Extract data from the backend response object
				setProperties(backendObj.property); //set the properties array
				setPagination(backendObj.pagination); //Saves page count, totalItems . . .

			}catch (err){
				setError(err.message);
			}finally {
				setLoading(false);
			}
		};
		fetchListings();
	}, [page]);

	//get the page information
	const {
		totalItems = 0,
		totalPages = 1,
		currentPage = 1,
		itemsPerPage = 24,
		hasNextPage = false,
		hasPrevPage = false
	} = pagination || {};
	
	//get the number of items that are currently being displayed
	const fromIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
	const toIndex = Math.min(currentPage * itemsPerPage, totalItems);
	
	//Handle navigation between pages
	const handleNext = () => {
		if(hasNextPage){
			setPage(prev => prev + 1);
			window.scrollTo({top: 0, behavior: 'smooth' })
		}
	};
	
	const handlePrev = () => {
		if(hasPrevPage){
			setPage(prev => prev - 1);
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};

	if (loading) return <div style={{ padding: '20px' }}>Loading real estate listings. . .</div>;
	if (error) return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;

	return (
		<div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
			<h2 style={{ marginBottom: '20px', color: '#221'}}>Current MLS Listings</h2>
			<h3 style={{ textAlign: 'left', margin: '0', color: '#666665', fontSize: '1.1rem' }}>Showing properties {fromIndex}-{toIndex} of {totalItems} properties</h3>
			{properties.length === 0 ? (
				<p>No properties found matching your filters.</p>
			) : (
				/* CSS Grid Container */
				<div style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
					gap: '20px'
				}}>
					{properties.map(property => (
						<PropertyCard key={property.id} property={property} />
			
					))}
				</div>
			)}

			{/* Navigation controls */}
			<div className={styles.paginationContainer}>
				<button
					onClick={handlePrev}
					disabled={!hasPrevPage}
					className={styles.navButton}
				>
					&larr; Previouse
				</button>
				<h3 className={styles.pageIndicator}>
					Page {currentPage} or {totalPages}
				</h3>

				<button
					onClick={handleNext}
					disabled={!hasNextPage}
					className={styles.navButton}
				>
					Next &rarr;
				</button>
			</div>
		</div>
	);
}

export default ListingsPage;










