//PropertyCard component, This is the object that will be used to display property cards in the grid inside the ListingsPage component

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PropertyImageCarousel from './PropertyImageCarousel';
import { useFavorites } from '../hooks/useFavorites';
import styles from './css_modules/PropertyCard.module.css'; //Import styles for the propertyCard

//import svg icons
import { Heart } from 'lucide-react';

function PropertyCard({ property, onFavoriteToggle }){

	//get the id of the property to be able to load it's detials when the user clicks it.
	const propertyId = property?.L_ListingID || -1;
	const { isFavorite, toggleFavorite } = useFavorites();

	const isSaved = isFavorite(propertyId);

	//Declare variables to hold property data
	const price = property?.L_SystemPrice || 0;
	const address = property?.L_Address || 'No address provided';
	const city = property?.L_City || 'No city provided';
	const state = property?.L_State || 'No state provided';
	const beds = property?.L_Keyword2 || 0;
	const baths = property?.LM_Dec_3 || 0;
	const sqft = property?.LM_Int2_3 || 0;
	
	//get the first photo in the photos to set as the cover image
	let photoArray = [];
	if(property?.L_Photos){
		try{
			photoArray = JSON.parse(property.L_Photos);
		}catch (err){
			console.error("Error parsing photos JSON")
		}
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
	
	const handleFav = (e) => {
		e.preventDefault();
		e.stopPropagation();
		
		//preform the toggle via the useFavorites hook
		const newlySaved = toggleFavorite(propertyId);
		
		//notify the parent component that a change was made
		onFavoriteToggle(propertyId, newlySaved);

	};

	return (
		<Link
			to={`/property/${propertyId}`}
			state={{ property }}
			className={styles.cardLink}
		>
			<div className={styles.propertyCard}>
				{/* property image carousel*/}
				<PropertyImageCarousel photos={photoArray} address={address} />
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
				
				<div className={styles.buttonFooter}>
					{/* Save button */}
					<button
						onClick={handleFav}
						className={`${styles.favButton} ${isSaved ? styles.favButton : ''}`}
					>
						<Heart className={`${styles.btnIcon} ${isSaved ? styles.savedIcon : ''}`} />
						{isSaved ? 'Saved' : 'Favorite'}
					</button>
				</div>

			</div>
		</Link>	
	);
}

export default PropertyCard;








