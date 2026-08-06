import {useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'savedPropertyIds';

//helper to read and parse IDs from localStorage
const getSavedIds = () => {
	const existingData = localStorage.getItem(STORAGE_KEY);

	if(!existingData || !existingData.trim()) return [];

	return existingData.split('|').map(id => id.trim()).filter(Boolean);
};

function useFavorites() {
	const [savedIds, setSavedIds] = useState(getSavedIds);
	
	//keep all hook instances in sync accross different components	
	useEffect(() =>{
		const syncFavorites = () => {
			setSavedIds(getSavedIds());
		};

		window.addEventListener('favoritesUpdated', syncFavorites);
		window.addEventListener('storage', syncFavorites);
		
		return () => {
			window.removeEventListener('favoritesUpdated', syncFavorites);
			window.removeEventListener('storage', syncFavorites);
		};

	}, []);

	//toggle a property id in or out of favorites
	const toggleFavorite = useCallback((propertyId) =>{
		const idStr = String(propertyId);
		const currentIds = getSavedIds();
		const idSet = new Set(currentIds);

		let isNowSaved = false;
		if(idSet.has(idStr)){
			idSet.delete(idStr);
			isNowSaved = false;
		}else{
			idSet.add(idStr);
			isNowSaved = true;
		}

		const updatedArray = Array.from(idSet);
		const updatedString = updatedArray.join('|');
		localStorage.setItem(STORAGE_KEY, updatedString);

		setSavedIds(updatedArray);

		//notify other components using this hook
		window.dispatchEvent(new Event('favoritesUpdated'));

		return isNowSaved;

	}, []);

	//check if a specific id is favorited
	const isFavorite = useCallback((propertyId) => {
		const idStr = String(propertyId);
		return savedIds.includes(idStr);
	}, [savedIds]);

	return{
		savedIds,
		toggleFavorite,
		isFavorite
	};

}

export { useFavorites };
