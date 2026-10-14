import styles from './css_modules/PropertyMap.module.css'

function PropertyMap({ latitude, longitude, address = 'Property Location' }){
	const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
	
	const lat = parseFloat(latitude);
	const lng = parseFloat(longitude);

	const isValidCoordinates = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
	
	//console.log("Loaded API Key:", apiKey ? "Key Loaded Successfully" : "API Key is UNDEFINED");

	//fallback if missing coordnates
	if(!isValidCoordinates || !apiKey){
		return(
			<div className={styles.mapContainer}>
				<div className={styles.mapFallback}>
					{!apiKey ? (
						<span>[Google Map API Key Missing]</span>
					) : (
						<span>[Map Unavailable - Invalid Location Coordinates]</span>
					)}
				</div>
			</div>
		);
	}

	//Google maps Embed API URL using place mode centered on lat, lng coordinates
	const mapSrc = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&zoom=15`;
	
	// Construct Google Maps directions URL
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

	return (
		<div className={styles.mapContainer}>
			{/* The map */}
			<div className={styles.iframeWrapper}>
				<iframe
					title={`Google Map for ${address}`}
					width="100%"
					height="100%"
					style={{ border: 0 }}
					loading="lazy"
					allowFullScreen
					referrerPolicy="no-referrer-when-downgrade"
					src={mapSrc}
				/>
			</div>

			{/* Get directions button */}			
			<div className={styles.actionsRow}>
				<a
					href={directionsUrl}
					target="_blank"
					rel="noopener noreferrer"
					className={styles.directionsBtn}
				>
					Get Directions
				</a>
			</div>

		</div>
	);

}

export default PropertyMap;
