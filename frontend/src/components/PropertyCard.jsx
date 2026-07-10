//PropertyCard component, This is the object that will be used to display property cards in the grid inside the ListingsPage component

import React from 'react';
import styles from '../css_modules/PropertyCard.module.css'; //Import styles for the propertyCard

function PropertyCard({ property }){
	//Declare database variables
	const price = property?.L_SystemPrice || 0;
	const address = property?.L_Address || 'No address provided';
	const city = property?.L_City || 'No city provided';
	const state = property?.L_State || 'No state provided';
	const beds = property?.L_Keyword2 || 0;
	const baths = property?.LM_Dec_3 || 0;
	const sqft = property?.LM_Int2_3 || 0;
	//const imgUrl = property?.L_Photos || '';
	//get the first photo in the photos to set as the cover image
	let photoArray = [];
	try{
		photoArray = JSON.parse(property.L_Photos);
	}catch (err){
		console.error("Error parsing photos JSON", err);
	}
	const imgUrl = Array.isArray(photoArray) && photoArray.length > 0 ? photoArray[0] : '';

	//Helper function to format the price
	const formatPrice = (val) => {
		if(val === null || val === undefined)
			return 'Price Upon Request';

		let cleanVal = val
		if (typeof val === 'string'){
			cleanVal = val.replace(/[^0-9.]/g, '');
		}

		const num = Number(cleanVal);
		return isNaN(num) ? 'Price Upon Request' : `${num.toLocaleString()}`;
	};

	return (
		<div className={styles.propertyCard}>
		{/* property image */}
		<img
			src={imgUrl}
			//alt={address} //If there are no photos just display the address
			alt={"[No Photos Available]"} //If there are no photos just display [No Photos Available]
			className={styles.imgStyle}
		/>
		{/* Property Details */}
		<div className={styles.cardDetails}>
			<h3 className={styles.priceStyle}> ${formatPrice(price)} </h3>
			<p className={styles.addressStyle}>{address}</p>
			<p className={styles.cityStateStyle}>{city}, {state}</p>

			{/* Specs bar */}
			<div className={styles.specsBar}>
				<span><strong>{beds}</strong> Beds</span>
				<span><strong>{baths}</strong> Baths</span>
				<span><strong>{sqft}</strong> Square Feet</span>
			</div>
		</div>
	</div>
		
	);
}

export default PropertyCard;








