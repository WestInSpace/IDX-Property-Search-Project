import { useEffect, useState } from 'react'
import ListingsPage from './components/ListingsPage';
import styles from './App.module.css';

function App() {
	return (
		<div className={styles.mainStyle}>
			{/* Navigation header */}
			<header className={styles.headerBackground}>
				<h1 className={styles.header}>IDX - Exchange Real Estate Platform</h1>
			</header>

			<main>
				<ListingsPage />
			</main>
		</div>
	);
}

export default App
