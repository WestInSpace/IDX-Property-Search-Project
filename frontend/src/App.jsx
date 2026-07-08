import { useEffect, useState } from 'react'
import ListingsPage from './components/ListingsPage';

function App() {
	return (
		<div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', fontFamily: 'sans-serif'}}>
			{/* Navigation header */}
			<header style={{ backgroundColor: '#fff', padding: '15px 20px', borderBottom: '1px solid #eaeaea' }}>
				<h1 style={{ margin: 0, fontSize: '1.5rem', color: '#0056b3' }}>IDX Real Estate Platform</h1>
			</header>

			<main>
				<ListingsPage />
			</main>
		</div>
	);
}

export default App
