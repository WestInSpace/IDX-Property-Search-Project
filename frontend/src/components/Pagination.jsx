import React from 'react';
import styles from '../css_modules/Pagination.module.css'

function Pagination({ pagination, page, setPage }) {
	const {
		totalPages = 1,
		hasNextPage = false,
		hasPrevPage = false
	} = pagination || {};
	
	//Handler for the previouse page button
	const handlePrev = () => {
		if(hasPrevPage) {
			setPage(prev => prev - 1);
			window.scrollTo(0, 0);
		}
	};
	
	//handler a page button in the list
	const handlePage = (targetPage) => {
		setPage(targetPage);
		window.scrollTo(0, 0);
	};

	//Handler for the next page button
	const handleNext = () => {
		if(hasNextPage) {
			setPage(prev => prev + 1);
			window.scrollTo(0, 0);
		}
	};
	
	//Generate page numbers with ellipses
	const getPageNumbers = () => {
		const pages = [];
		const boundaryPages = 1; //number of pages to display at the start and end
		const siblingPages = 1; //number of pages to show on each side of current page
		
		//build the array of pages to show
		for(let i=1; i<= totalPages; i++){

			//always show the first and last pages
			if(i <= boundaryPages || i > totalPages - boundaryPages){
				pages.push(i);
				continue;
			}
		
			//add the siblings around the current page
			if(i >= page - siblingPages && i<= page + siblingPages) {
				pages.push(i);
				continue;
			}

			//add an ellipsis to display if there is a gap and an elipsis has not already been added
			if(pages[pages.length - 1] !== '...'){
				pages.push('...')
			}

		}

		return pages;

	};
	
	const pageNumbers = getPageNumbers();

	return (
		<div className={styles.paginationContainer}>
			{/* previouse page button */}
			<button
				onClick={handlePrev}
				disabled={!hasPrevPage}
				className={styles.navButton}
			>
				&larr; Previous
			</button>
			
			{/* display the page numbers */}
			<div className={styles.pageNumbersContainer}>
				{pageNumbers.map((item, index) => {
					if(item === '...'){
						return (
							<span key={`ellipsis-${index}`} className={styles.ellipsis}>
								...
							</span>
						);
					}
					
					return (
						<button
							key={item}
							onClick={() => handlePage(item)}
							className={`${styles.pageButton} ${page == item ? styles.activePage : ''}`}
						>
							{item}
						</button>
					);

				})}
			</div>

			{/* next page button */}
			<button
				onClick={handleNext}
				disabled={!hasNextPage}
				className={styles.navButton}
			>
				Next &rarr;
			</button>
		</div>
	);
}

export default Pagination;
