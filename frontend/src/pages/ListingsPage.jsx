//This is the ListingsPage component. This will be used to display the grid that holds PropertyCard components

import React, { useEffect, useState } from 'react';
import { propertyService } from '../api/propertyService';
import PropertyCard from '../components/PropertyCard';
import PropertyFilters from '../components/PropertyFilters';
import Pagination from '../components/Pagination';
import ErrorBoundary from '../utils/ErrorBoundary';
import { useFavorites } from '../hooks/useFavorites';
import errStyles from '../utils/ErrorBoundary.module.css';
import styles from './css_modules/ListingsPage.module.css'; //import styles for the ListingsPage

function ListingsPage(){
	//const[properties, setProperties] = useState([]); //store the properties returned from the backend
	const [pagination, setPagination] = useState({}); //store the pagination metadata from the backend
	const [page, setPage] = useState(1); //track the currentPage number
	const limit = 24; //set the limit for how many listings will be on a page
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);	
	
	const { savedIds } = useFavorites();
	
	//Keep track of the filters
	const [activeFilters, setActiveFilters] = useState({
		city: '',
		zipcode: '',
		minPrice: '',
		maxPrice: '',
		beds: '',
		baths: ''
	});

	useEffect(() => {
		const fetchListings = async () => {
			try {
				setLoading(true);
				setError(null);

				if(showOnlyFavorites){
					// If favorites are empty avoid making an api call
                    if (!savedIds || savedIds.length === 0) {
                        setProperties([]);
                        setPagination({ totalItems: 0, totalPages: 1, currentPage: 1 });
                        setLoading(false);
                        return;
                    }

					const data = await propertyService.getPropertiesByIds(savedIds);
					setProperties(data.property || []);
					setPagination({ totalItems: data.totalItems, totalPages: 1, currentPage: 1 });
				}else{
					const currentOffset = (page - 1) * limit;
					const paginationParams = {
						...activeFilters,
						limit,
						offset: currentOffset
					};
					const backendObj = await propertyService.getProperties(paginationParams);
					setProperties(backendObj.property || []);
					setPagination(backendObj.pagination || {});
				}

			}catch (err){
				setError(err.message);
			}finally {
				setLoading(false);
			}
		};
		fetchListings();
	}, [page, activeFilters, showOnlyFavorites]);

	//Fires when child submit updates properties layout context, update the filters
	const handleApplyFilters = (newFilters) => {
		setShowOnlyFavorites(false);
		setActiveFilters(newFilters);
		setPage(1);
	};
	
	const handleFavoriteToggle = (toggledId, isNowSaved) => {

		if(showOnlyFavorites && !isNowSaved){
			//Update the shown properties, remove the one that was unfvorited
			setProperties(prevProperties => {
				const updated = prevProperties.filter(item => {
					const itemId = item.L_ListingID || item.id;
					return String(itemId) !== String(toggledId);
				});

				//update the count of displayed properties
				setPagination(prev => ({
					...prev,
					totalItems: updated.length
				}));

				return updated;
			});

		}
	};

	const handleShowFavorites = (newFilters) => {
		setShowOnlyFavorites(prev => !prev);
		setPage(1);
	};

	//get the page information
	const {
		totalItems = 0,
		totalPages = 1,
		currentPage = 1,
		itemsPerPage = 24,
	} = pagination || {};
	
	//get the number of items that are currently being displayed
	const fromIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
	const toIndex = Math.min(currentPage * itemsPerPage, totalItems);
	
	if (loading) return <div style={{ padding: '20px' }}>Loading real estate listings. . .</div>;
	if (error) return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;

	return (
		<div className={styles.background}>

			{/* Header */}
			<header className={styles.headerBackground}>
				<h1 className={styles.header}>IDX - Exchange Real Estate Platform</h1>
			</header>
			
			{/* mount the component that allows the user to enter filters */}
			{/* keep the filter persistant until the user changes them */}
			<PropertyFilters
				onApplyFilters={handleApplyFilters}
				onShowFavorites={handleShowFavorites}
				activeFilters={activeFilters}
			/>

			<h2 className={styles.header2}>Current MLS Listings</h2>

			<h3 className={styles.header3}>Showing properties {fromIndex}-{toIndex} of {totalItems} properties</h3>
			
			{/* Error Boundary around property grid */}
			<ErrorBoundary
				onReset={() => setPage(1)}
				fallback={
					<div className={errStyles.errorContainer}>
						<h3 className={errStyles.errorTitle}>Unable to render this section.</h3>
						<p className={errStyles.errorMessage}>One of the returned property listings contained invalid data.</p>
						<button 
							onClick={() => setPage(1)}
							className={errStyles.errorButton}
						>
							Reset Grid
						</button>
					</div>
				}
			>
				{properties.length === 0 ? (
					<p>
						{showOnlyFavorites ? 'No saved favorites found.' : 'No properties found matching chosen filters.'}
					</p>
				) : (
					/* CSS Grid Container */
					<div className={styles.grid}>
						{properties.map(property => (
							<PropertyCard
								key={property.id}
								property={property}
								onFavoriteToggle={handleFavoriteToggle}
							/>
			
						))}
					</div>
				)}
			</ErrorBoundary>

			{/* Navigation controls component, only shows when more than one page is present*/}
			{totalPages > 1 && (
				<Pagination
					pagination={pagination}
					page={page}
					setPage={setPage}
				/>
			)}			
		</div>
	);
}

export default ListingsPage;










