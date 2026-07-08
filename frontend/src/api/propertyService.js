
// function to handle fetch responses and errors
async function handleResponse(response){
	if(!response.ok){
		//get the error message from the backend json
		const errorData = await response.json().catch(() => ({}));
		const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
		throw new Error(errorMessage);
	}
	return response.json();
}

//requests to backend server
export const propertyService = {

	//get properties based on filters
	async getProperties(filters = {}){
		const queryParams = new URLSearchParams(filters).toString(); //get the querry paramaters
		const url = `/api/properties${queryParams ? `?${queryParams}` : ''}`; //build the url
		
		const response = await fetch(url);
		return handleResponse(response); //process and return the reponse
	},
	
	//get a property by it's id
	async getPropertyById(id){
		const response = await fetch(`/api/properties/${id}`); //fetch from the express server
		return handleResponse(response); //process and return the response
	},

	//get openhouses for a property by it's id
	async getOpenhouseById(id){
		const response = await fetch(`/api/properties/${id}/openhouses`); //fetch from the express server
		return handleResponse(response); //process and return the response
	},

	//health check
	async checkHealth(){
		// Hits http://localhost:5000/api/health
		const response = await fetch('/api/health');
		return handleResponse(response);
	}

}
