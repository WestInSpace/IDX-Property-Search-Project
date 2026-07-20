import React from 'react';
import styles from '../css_modules/Pagination.module.css'

function Pagination({ pagination, page, setPage }) {
	const {
		totalPages = 1,
		hasNextPage = false,
		hasPrevPage = false
	} = pagination || {};

	const handlePrev = () => {
		if(hasPrevPage) {
			setPage(prev => prev - 1);
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};

	const handleNext = () => {
		if(hasNextPage) {
			setPage(prev => prev + 1);
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};

	return (
		<div className={styles.paginationContainer}>
			<button
				onClick={handlePrev}
				disabled={!hasPrevPage}
				className={styles.navButton}
			>
				&larr; Previous
			</button>
			<span className={styles.pageIndicator}>
				Page {page} of {totalPages}
			</span>
			<button
				onClick={handleNext}
				disabled={!hasNextPage}
				className={styles.navButton}
			>
				Next &rarr
			</button>
		</div>
	);
}

export default Pagination;
