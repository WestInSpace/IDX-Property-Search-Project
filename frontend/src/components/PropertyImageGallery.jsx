import React, {useState, useEffect, useCallback } from 'react';
import styles from './css_modules/PropertyImageGallery.module.css';

function PropertyImageGallery({photos = [], address = "Property"}){

	const [selectedIndex, setSelectedIndex] = useState(0);
	const [isLightboxOpen, setIsLightboxOpen] = useState(false);
	const [imageErrors, setImageErrors] = useState({});

	const validPhotos = photos.filter((url) => typeof url === 'string' && url.trim().length > 0);

	const handleNext = useCallback((e) => {
		e?.stopPropagation();
		setSelectedIndex((prev) => (prev === validPhotos.length - 1 ? 0 : prev + 1));
	}, [validPhotos.length]);

	const handlePrev = useCallback((e) => {
		e?.stopPropagation();
		setSelectedIndex((prev) => (prev === 0 ? validPhotos.length - 1 : prev - 1));
	}, [validPhotos.length]);

	const handleImageError = (index) => {
		setImageErrors((prev) => ({ ...prev, [index]: true}));
	};

	//lightbox keyboard controls
	useEffect(() => {
		if(!isLightboxOpen) return;

		const handleKeyDown = (e) => {
			if (e.key === 'Escape') setIsLightboxOpen(false);
			if(e.key === 'ArrowRight') handleNext();
			if(e.key === 'ArrowLeft') handlePrev();
		};

		window.addEventListener('keydown', handleKeyDown);
		document.body.style.overflow = 'hidden'; //prevent scrolling while lightbox is open

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			document.body.style.overflow = 'unset';
		};
		
	}, [isLightboxOpen, handleNext, handlePrev]);
	
	if(validPhotos.length === 0){
		return(
			<div className={styles.noPhotosContainer}>
				<span>[No Photos Available for this Property]</span>
			</div>
		);
	}

	const currentHeroPhoto = validPhotos[selectedIndex];

	return(
		<div className={styles.galleryContainer}>
			{/* Main Image */}
			<div
				className={styles.heroContainer}
				onClick={() => setIsLightboxOpen(true)}
				title="Click to view full screen"
			>
				{imageErrors[selectedIndex] ? (
					<div className={styles.heroFallBack}>
						<span>[Image Unavailable]</span>
					</div>
				) : (
					<img
						src={currentHeroPhoto}
						alt={`${address} - Photo ${selectedIndex + 1}`}
						className={styles.heroImage}
						onError={() => handleImageError(selectedIndex)}
					/>
				)}
			</div>

			{/* Thumbnail strip */}
			{validPhotos.length > 1 && (
				<div className={styles.thumbnailStrip}>
					{validPhotos.map((photoUrl, index) => (
						<button
							key={index}
							type="button"
							className={`${styles.thumbButton} ${index === selectedIndex ? styles.activeThumb : ''}`}
							onClick={() => setSelectedIndex(index)}
						>
							{imageErrors[index] ? (
								<div className={styles.thumbFallback}>Unavailable</div>
							) : (
								<img
									src={photoUrl}
									alt={`${address} thumbnail ${index + 1}`}
									className={styles.thumbImage}
									onError={() => handleImageError(index)}
								/>
							)}
						</button>
					))}
				</div>
			)}

			{/* Lightbox modal */}
			{isLightboxOpen && (
				<div className={styles.lightboxOverlay} onClick={() => setIsLightboxOpen(false)}>
					<div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
						{/* close button */}
						<button
							type="button"
							className={styles.closeBtn}
							onClick={() => setIsLightboxOpen(false)}
							aria-label="Close modal"
						>
							x
						</button>

						{/* Lightbox image display */}
						<div className={styles.lightboxStage}>
							{imageErrors[selectedIndex] ? (
								<div className={styles.lightboxFallback}>
									<span>[Image Unavailable]</span>
								</div>
							) : (
								<img
									src={currentHeroPhoto}
									alt={`${address} - Fullscreen photo ${selectedIndex + 1}`}
									className={styles.lightboxImage}
								/>
							)}
						</div>

						{/* Prev/next arrows in lightbox */}
						{validPhotos.length > 1 && (
							<>
								<button
									type="button"
									className={`${styles.lightboxArrow} ${styles.prevArrow}`}
									onClick={handlePrev}
									aria-label="Previous image"
								>
									‹
								</button>
								<button
									type="button"
									className={`${styles.lightboxArrow} ${styles.nextArrow}`}
									onClick={handleNext}
									aria-label="Next image"
								>
									›
								</button>
							</>
						)}
						
						{/* Counter footer */}
						<div className={styles.lightboxCounter}>
							{selectedIndex + 1} / {validPhotos.length}
						</div>

					</div>
				</div>
			)}
		</div>
	);
}

export default PropertyImageGallery;




















