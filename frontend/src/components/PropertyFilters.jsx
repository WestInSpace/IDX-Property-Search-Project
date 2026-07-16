/* The componenet allowing the user to enter filters to search for properties */
import React, { useState, useEffect } from 'react';
import styles from '../css_modules/PropertyFilters.module.css'; //import styles for PropertyFilters

function PropertyFilters({ onApplyFilters, activeFilters }){
	//track the state of the toggle to display the filter menu
	const [isOpen, setIsOpen] = useState(false);
	
	//store the filters that the user is typing
	const [draftFilters, setDraftFilters] = useState({
		city: '',
		zipcode: '',
		minPrice: '',
		maxPrice: '',
		beds: '',
		baths: ''
	});
	
	//Udate the draft when parrent value are updated to avoid sending a new api call on every char typed
	useEffect(() => {
		if(activeFilters){
			setDraftFilters({
				city: activeFilters.city || '',
				zipcode: activeFilters.zipcode || '',
		        minPrice: activeFilters.minPrice || '',
        		maxPrice: activeFilters.maxPrice || '',
		        beds: activeFilters.beds || '',
        		baths: activeFilters.baths || ''
			});
		}
	}, [activeFilters]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setDraftFilters(prev => ({
			...prev,
			[name]: value
		}));
	};
	
	//only push data to the parent when apply is pressed
	const handleSubmit = (e) => {
		e.preventDefault();
		onApplyFilters(draftFilters)
	};

	const handleClear = () => {
		const clearedFilters = {city: '', zipcode: '', minPrice: '', maxPrice: '', beds: '', baths: ''};
		onApplyFilters(clearedFilters)
	};

	return(
		<div className={styles.filterContainer}>
			{/* Action panel header to trigger visibility toggle */}
			<div className={styles.toggleHeader}>
				<button
					type="button"
					onClick={() => setIsOpen(!isOpen)}
					className={styles.toggleButton}
				>
					{isOpen ? '^ Hide Filters' : '-- Show Filters'}
				</button>
			</div>
			
			{/* Conditional content wrapper */}
			<form
				onSubmit={handleSubmit}
				className={`${styles.collapsibleContent} ${isOpen ? styles.open : '' }`}
			>

				<div className={styles.filterGrid}>

					{/* city */}
					<div className={styles.inputGroup}>
						<label htmlFor="city">city</label>
						<input
							type="text"
							id="city"
							name="city"
							placeholder="Any city"
							value={draftFilters.city || ''} //Fill the box to preserve user input
							onChange={handleChange}
							className={styles.filterInput}
						/>
					</div>
		
					{/* zipcode */}
					<div className={styles.inputGroup}>
						<label htmlFor="zipcode">zip-code</label>
						<input
							type="text"
							id="zipcode"
							name="zipcode"
							placeholder="Any zipcode"
							value={draftFilters.zipcode || ''} //Fill the box to preserve user input
							onChange={handleChange}
							className={styles.filterInput}
						/>
					</div>

					{/* minPrice */}
					<div className={styles.inputGroup}>
						<label htmlFor="minPrice">min-price</label>
						<input
							type="text"
							id="minPrice"
							name="minPrice"
							placeholder="No min-price"
							value={draftFilters.minPrice || ''} //Fill the box to preserve user input
							onChange={handleChange}
							className={styles.filterInput}
						/>
					</div>

					{/* maxPrice */}
					<div className={styles.inputGroup}>
						<label htmlFor="maxPrice">max-price</label>
						<input
							type="text"
							id="maxPrice"
							name="maxPrice"
							placeholder="No max-price"
							value={draftFilters.maxPrice || ''} //Fill the box to preserve user input
							onChange={handleChange}
							className={styles.filterInput}
						/>
					</div>

					{/* beds drop down */}
					<div className={styles.inputGroup}>
						<label htmlFor="beds">Beds</label>
						<select
							id="beds"
							name="beds"
							value={draftFilters.beds || ''} //Fill the box to preserve user input
							onChange={handleChange}
							className={styles.filterSelect}
						>
							<option value="">Any</option>
							<option value="1">1+ Beds</option>
							<option value="2">2+ Beds</option>
							<option value="3">3+ Beds</option>
							<option value="4">4+ Beds</option>
							<option value="5">5+ Beds</option>
						</select>
					</div>
	
					{/* baths drop down */}
					<div className={styles.inputGroup}>
						<label htmlFor="baths">Baths</label>
						<select
							id="baths"
							name="baths"
							value={draftFilters.baths || ''} //Fill the box to preserve user input
							onChange={handleChange}
							className={styles.filterSelect}
						>
							<option value="">Any</option>
							<option value="1">1+ Baths</option>
							<option value="2">2+ Baths</option>
							<option value="3">3+ Baths</option>
							<option value="4">4+ Baths</option>
							<option value="5">5+ Baths</option>
						</select>
					</div>

					{/* action Controls */}
					<div className={styles.buttonGroup}>
						<button type="submit" className={styles.applyButton}>Apply</button>
						<button type="button" onClick={handleClear} className={styles.clearButton}>Clear</button>
					</div>

				</div>
			</form>
		</div>
	);
}

export default PropertyFilters;



































