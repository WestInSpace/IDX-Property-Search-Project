import { Component } from 'react';
import styles from './ErrorBoundary.module.css';

class ErrorBoundary extends Component{
	constructor(props){
		super(props);
		this.state = {
			hasError: false,
			error: null
		};
	}

	static getDerivedStateFromError(error){
		return{
			hasError: true,
			error
		};
	}

	componentDidCatch(error, errorInfo){
		console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
	}

	handleReset = () => {
		this.setState({ hasError: false, error: null });
		if(this.props.onReset){
			this.props.onReset();
		}
	};

	render() {
		if(this.state.hasError){
			if(this.props.fallback){
				return this.props.fallback;
			}

			return(
				<div className={styles.container}>
					<h2 className={styles.title}>Something went wrong.</h2>
					<p className={styles.message}>
						{this.state.error?.message || 'An unexpected rendering error occurred while loading this section'}
					</p>
					<div className={styles.buttonGroup}>
						<button
							onClick={this.handleReset}
							className={styles.primaryButton}
						>
							Try Again
						</button>
						<button
							onClick={() => window.location.reload()}
							className={styles.secondaryButton}
						>
							Reload Page
						</button>
					</div>
				</div>
			);
		}
		return this.props.children;
	}
}

export default ErrorBoundary;
