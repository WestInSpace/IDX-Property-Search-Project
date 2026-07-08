import { useEffect, useState } from 'react'
import { propertyService } from './api/propertyService'

function App() {
	const [healthStatus, setHealthStatus] = useState('Checking connection . . .')
	const [isOnline, setIsOnline] = useState(false)

	useEffect(() => {
		const healthCheck = async () => {
			try{
				const data = await propertyService.checkHealth()
				
				setHealthStatus(data.status);
				
				setIsOnline(true);
				
			}catch (err){
				setHealthStatus(`Connection failed: ${err.message}`)
				setIsOnline(false);
			}
		}

		healthCheck()
	}, [])

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif' }}>
      <h1>Property Search App — Initialization</h1>
      
      <div style={{
        marginTop: '20px',
        padding: '15px',
        borderRadius: '5px',
        backgroundColor: isOnline ? '#e6f4ea' : '#fce8e6',
        color: isOnline ? '#137333' : '#c5221f',
        border: `1px solid ${isOnline ? '#a3cfbb' : '#f5c2c7'}`,
        display: 'inline-block'
      }}>
        <strong>System Status:</strong> {healthStatus}
      </div>
    </div>
  )
}

export default App
