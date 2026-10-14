import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ListingsPage from './pages/ListingsPage';
import PropertyDetailPage from './pages/PropertyDetailPage';

function App() {
	return (
		<BrowserRouter>
			<Routes>

				{/* Listing page view */}
				<Route path="/" element={<ListingsPage />} />

				{/* Route to display individual property details */}
				<Route path="/property/:id" element={<PropertyDetailPage />} />
				
			</Routes>
		</BrowserRouter>
	);
}

export default App
