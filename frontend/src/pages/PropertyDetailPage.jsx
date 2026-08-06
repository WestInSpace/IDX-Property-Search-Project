/* Property detail page to display details, description, openhouses, and location of a property */

import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import OpenHouseCard from '../components/OpenHouseCard';
import PropertyImageGallery from '../components/PropertyImageGallery';
import PropertyMap from '../components/PropertyMap';
import ErrorBoundary from '../utils/ErrorBoundary';
import { useFavorites } from '../hooks/useFavorites';
import errStyles from '../utils/ErrorBoundary.module.css';
import styles from './css_modules/PropertyDetailPage.module.css';

//import svg icons
import { 
  Bed, 
  Bath, 
  Maximize2, 
  Calendar, 
  MapPin, 
  Heart, 
  Share2, 
  Clock, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';

function PropertyDetailPage() {
	//get the id from the url
	const { id } = useParams();
	const location = useLocation();

	//retrive the property object, instant retrival if it exists
	const [property, setProperty] = useState(null);
	const [openHouses, setOpenHouses] = useState([]);
	const [loading, setLoading] = useState(!location.state?.property);
	const[error, setError] = useState(null);
	
	//State hooks for component interactivity
	//state hooks for favorites
	const {isFavorite, toggleFavorite} = useFavorites();
	const isSaved = isFavorite(id);

	const [isCopied, setIsCopied] = useState(false);
	const [showFullDescription, setShowFullDescription] = useState(false);

	let photos = [];

	//get the property and openhouses
	useEffect(() => {
		async function loadPropertyAndOpenHouses(){
			try{
				setLoading(true);
				setError(null);	

				let currentProperty = location.state?.property;
				
				//If the user did not navigate to the page by id, they came by direct link
				//then fetch the property from the backend / database
				if(!currentProperty){
					const data = await fetch(`/api/properties/${id}`);
					if(!data.ok){
						throw new Error('Property not found.');
					}
					currentProperty = await data.json();
				}

				setProperty(currentProperty);

				//fetch open houses
				try{
					const openHouseRes = await fetch(`/api/properties/${id}/openhouses`);
					if(!openHouseRes.ok){
						throw new Error('Failed to fetch open houses for this property.');
					}

					const openHouseData = await openHouseRes.json();

					setOpenHouses(openHouseData);
				}catch(ohErr){
					console.warn("Could not load open houses:", ohErr);
					setOpenHouses([]);
				}

			}catch(err){
				setError(err.message);
			}finally{
				setLoading(false);
			}
		}

		if(id || location.state?.property){
			loadPropertyAndOpenHouses();
		}

	}, [id, location.state]);
	
	//Get the photos
	if(property?.L_Photos){
		try{
			photos = JSON.parse(property.L_Photos);
		}catch (err){
			console.error("Error parsing photos: ", err);
		}
	}

	//Declare variables to hold property data
	const price = property?.L_SystemPrice || 0;
	const address = property?.L_Address || 'Not provided';
	const city = property?.L_City || 'Not provided';
	const state = property?.L_State || 'Not provided';
	const zipcode = property?.L_Zip || 'Not provided';
	const beds = property?.L_Keyword2 || 0; //Number of bedrooms
	const baths = property?.LM_Dec_3 || 0; //number of bathroms
	const sqft = property?.LM_Int2_3 || 0; //square feet
	const yearBuilt = property?.YearBuilt || 0;
	const description = property?.L_Remarks || 'No Description Provided';

	//Property details
	const type = property?.L_Class || 'Not provided';
	const subType = property?.L_Type_ || 'Not provided';
	const lotSize = property?.L_Keyword1 || 'Not provided';
	const garageSpace = property?.L_Keyword5 || 'Not provided';
	const attachedGarage = property?.AttachedGarageYN || 'Not provided';
	const levels = property?.L_Keyword7 || 'Not provided';
	const flooring = property?.Flooring || 'Not provided';
	const pool = property?.PoolPrivateYN || 'Not provided';
	const assocFeeFrq = property?.AssociationFeeFrequency || 'Not provided';
	const assocFee = property?.AssociationFee || 'Not provided';
	const subDivName = property?.SubdivisionName || 'Not provided';
	const fireplace = property?.FireplaceYN || 'Not provided';
	const highSchoolDist = property?.HighSchoolDistrict || 'Not provided';
	const fencing = property?.Fencing || 'Not provided';
	const listingAgentFirstName = property?.LA1_UserFirstName || 'Unknown first name';
	const listingAgentLastName = property?.LA1_UserLastName || 'Unknown last name'
	const listOfficeName = property?.LO1_OrganizationName || 'Not provided';

	//Property location
	const long = property?.LMD_MP_Longitude || '';
	const lat = property?.LMD_MP_Latitude || '';

	//UI states

	//loading state
	if(loading){
		return(
			<div className={styles.loadingState} >
				Loading property details. . .
			</div>
		);
	}

	//fail state, no route state and API fetch failed or returned nothing
	if(error || !property){
		return(
			<div className={styles.errorState}>
				<h2 className={styles.header2}>Property Not Found</h2>
				<p className={styles.messageText}>
					We couldn't load details for property ID: <strong>{id}</strong>.
				</p>
			<Link to="/">Back to All Listings</Link>
			</div>
		);
	}

	// Format currency
	const formattedPrice = price ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price) : 'N/A';
	
	const handleShare = async () => {
		try{
			await navigator.clipboard.writeText(window.location.href);
			setIsCopied(true);
			setTimeout(() => setIsCopied(false), 2000);
		}catch (err){
			console.error('Failed to copy link: ', err);
		}
	};
	
	const handleSave = async () => {
		toggleFavorite(id);
	};

	//success state
	return (
		<div className={styles.container}>

			{/* Header section: price, address, and action buttons */}
			<div className={styles.headerSection}>
				<div className={styles.addressText}>
					<MapPin className={styles.mapIcon} />
					{address}, {city}, {state} {zipcode}
				</div>

				<div className={styles.priceText}>
					{formattedPrice}
				</div>
			
				<div className={styles.actionsGroup}>
					{/* Save button */}
					<button
						onClick={handleSave}
						className={`${styles.actionButton} ${isSaved ? styles.savedButton : ''}`}
					>
						<Heart className={`${styles.btnIcon} ${isSaved ? styles.savedIcon : ''}`} />
						{isSaved ? 'Saved' : 'Save'}
					</button>
					
					{/* Share button */}
					<button
						onClick={handleShare}
						className={styles.actionButton}
						type="button"
					>
						<Share2 className={styles.btnIcon} />
						{isCopied ? 'Link Copied!' : 'Share'}
					</button>
				</div>
			</div>

			{/* Key stats Bar */}
			<div className={styles.statsBar}>
				{/* display num bedrooms */}
				<div className={styles.statCard}>
					<div className={styles.statIconWrapper}><Bed size={22} /></div>
					<div>
						<div className={styles.statValue}>{beds ?? '-'}</div>
						<div className={styles.statLabel}>Bedrooms</div>
					</div>
				</div>
				
				{/* display num bathrooms */}
				<div className={styles.statCard}>
					<div className={styles.statIconWrapper}><Bath size={22} /></div>
					<div>
						<div className={styles.statValue}>{baths ?? '-'}</div>
						<div className={styles.statLabel}>Bathrooms</div>
					</div>
				</div>

				{/* display square feet */}
				<div className={styles.statCard}>
					<div className={styles.statIconWrapper}><Maximize2 size={22} /></div>
					<div>
						<div className={styles.statValue}>{sqft ?? '-'}</div>
						<div className={styles.statLabel}>Sq Ft</div>
					</div>
				</div>

				{/* display year built */}
				<div className={styles.statCard}>
					<div className={styles.statIconWrapper}><Calendar size={22} /></div>
					<div>
						<div className={styles.statValue}>{yearBuilt ?? '-'}</div>
						<div className={styles.statLabel}>Year Built</div>
					</div>
				</div>
			</div>

			{/* Main content */}

			{/* Property description */}
			<section className={styles.section}>
				<h2 className={styles.sectionTitle}>About this Property</h2>
				<div className={`${styles.descriptionText} ${!showFullDescription ? styles.lineClamp : ''}`}>
					{description}
				</div>
				<button
					onClick={() => setShowFullDescription(!showFullDescription)}
					className={styles.toggleDescButton}
				>
					{showFullDescription ? (
						<>Read Less <ChevronUp size={16} /></>
					) : (
						<>Read Full Description <ChevronDown size={16}/></>
					)}
				</button>
			</section>

			<hr className={styles.divider} />

			{/* Other Property Details */}
			<section>
				<h2 className={styles.sectionTitle}>Property Features & Details</h2>

				<div className={styles.detailsGrid}>
					{/* Category: Overview */}
					<div className={styles.detailCategory}>
						<h3 className={styles.categoryTitle}>Overview</h3>
						<div className={styles.detailItem}>
							<span className={styles.detailLabel}>Property Type: </span>
							<span className={styles.detailValue}>{type}</span>
						</div>
						<div className={styles.detailItem}>
							<span className={styles.detailLabel}>Sub-Type: </span>
							<span className={styles.detailValue}>{subType}</span>
						</div>
						<div className={styles.detailItem}>
							<span className={styles.detailLabel}>Levels: </span>
							<span className={styles.detailValue}>{levels}</span>
						</div>
					</div>

					{/* Category: Interior & Exterior */}
					<div className={styles.detailCategory}>
						<h3 className={styles.categoryTitle}>Interior & Exterior</h3>
						<div className={styles.detailItem}>
							<span className={styles.detailLabel}>Flooring: </span>
							<span className={styles.detailValue}>{flooring}</span>
						</div>
						<div className={styles.detailItem}>
							<span className={styles.detailLabel}>Fireplace: </span>
							<span className={styles.detailValue}>{fireplace}</span>
						</div>
						<div className={styles.detailItem}>
							<span className={styles.detailLabel}>Pool: </span>
							<span className={styles.detailValue}>{pool}</span>
						</div>
						<div className={styles.detailItem}>
							<span className={styles.detailLabel}>Fencing: </span>
							<span className={styles.detailValue}>{fencing}</span>
						</div>
					</div>

					{/* Category: Parking & Lot */}
					<div className={styles.detailCategory}>
						<h3 className={styles.categoryTitle}>Parking & Lot</h3>
						<div className={styles.detailItem}>
							<span className={styles.detailLabel}>Lot Size: </span>
							<span className={styles.detailValue}>{lotSize} Sq Ft</span>
						</div>
						<div className={styles.detailItem}>
							<span className={styles.detailLabel}>Garage Spaces: </span>
							<span className={styles.detailValue}>{garageSpace}</span>
						</div>
						<div className={styles.detailItem}>
							<span className={styles.detailLabel}>Attached Garage: </span>
							<span className={styles.detailValue}>{attachedGarage}</span>
						</div>
					</div>

					{/* Category: Community & Agent Info */}
					<div className={styles.detailCategory}>
						<h3 className={styles.categoryTitle}>Community & Listing</h3>
						<div className={styles.detailItem}>
							<span className={styles.detailLabel}>Subdivision: </span>
							<span className={styles.detailValue}>{subDivName}</span>
						</div>
						<div className={styles.detailItem}>
							<span className={styles.detailLabel}>HOA Fee: </span>
							<span className={styles.detailValue}>
								{assocFee !== 'Not provided' ? `$${assocFee} ${assocFeeFrq}` : assocFee}
							</span>
						</div>
						<div className={styles.detailItem}>
							<span className={styles.detailLabel}>High School District: </span>
							<span className={styles.detailValue}>{highSchoolDist}</span>
						</div>
						<div className={styles.detailItem}>
							<span className={styles.detailLabel}>Listing Agent: </span>
							<span className={styles.detailValue}>
								{listingAgentFirstName} {listingAgentLastName} ({listOfficeName})
							</span>
						</div>
					</div>
				</div>
			</section>

			<hr className={styles.divider} />
			
			{/* Error Boundary for image gallery */}
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

				{/* Image gallery */}
				<section>
					<h2 className={styles.sectionTitle}>Property Images</h2>
					<PropertyImageGallery photos={photos} address={property?.L_Address} />
				</section>

			</ErrorBoundary>

			<hr className={styles.divider} />

			{/* Open house(s) details */}
			<section>
				<h2 className={styles.sectionTitle}>Upcoming Open Houses</h2>
				{openHouses.length > 0 ? (
					<div className={styles.openHouseGrid}>
						{openHouses.map((oh, index) => (
							<OpenHouseCard key={oh.id} openHouse={oh} />
						))}
					</div>
				) : (
					<div className={styles.noOpenHouses}>
						<p>There are currently no upcoming open houses for this property.</p>
					</div>
				)}
			</section>
			
			<hr className={styles.divider} />
			
			{/* Error Boundary for map */}
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

				{/* Display property locaton on map */}
				<section>
					<h2 className={styles.sectionTitle}>Property Location</h2>
					<PropertyMap
						latitude={lat}
						longitude={long}
						address={property?.L_Address}
					/>
				</section>

			</ErrorBoundary>
			
			<hr className={styles.divider} />

			{/* Link back to Listings page */}
			<Link to="/" className={styles.backLink}>
				Back to Listings
			</Link>
		</div>
	);
}

export default PropertyDetailPage;
