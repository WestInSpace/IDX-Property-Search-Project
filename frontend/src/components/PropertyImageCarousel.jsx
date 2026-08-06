import {useState} from 'react';
import styles from './css_modules/PropertyImageCarousel.module.css'

function PropertyImageCarousel({ photos = [], address = 'Property' }){
	const [currentIndex, setCurrentIndex] = useState(0);

	if(!photos || photos.length === 0){
		return(
			<div className={styles.carouselContainer}>
				<div className={styles.noImagePlaceholder}>
					<span>[No Photos Available]</span>
				</div>
			</div>
		);
	}

	const handlePrev = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
	};

	const handleNext = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
	};
	
	return(
		<div className={styles.carouselContainer}>
			<img
				src={photos[currentIndex]}
				alt={`${address} - Photo ${currentIndex + 1}`}
				className={styles.imgStyle}
			/>

			{photos.length > 1 && (
				<>
					<button
						type="button"
						onClick={handlePrev}
						className={`${styles.carouselBtn} ${styles.prevBtn}`}
						aria-label="Previouse Image"
					>
						‹
					</button>
					<button
						type="button"
						onClick={handleNext}
						className={`${styles.carouselBtn} ${styles.nextBtn}`}
						aria-label="Next Image"
					>
						›
					</button>
					
					<div className={styles.imageBadge}>
						{currentIndex + 1} / {photos.length}
					</div>

				</>
			)}

		</div>
	);

}

export default PropertyImageCarousel;
