import express from 'express';
import pool from '../config/db.js';

const router = express.Router(); //modular express router to allow relative pathing

//search endpoint to filter all the properties by: city, zipcode, minPrice, maxPrice, beds, or baths
router.get('/', async(req, res) => {
    try{
        //Get all the query params
        const {city, zipcode, minPrice, maxPrice, beds, baths} = req.query;
        
        //Parse and sanitize limit and offset query parameters
        const limit = parseInt(req.query.limit, 10) || 20;
        const offset = parseInt(req.query.offset, 10) || 0;
        //Varify / sanitize the data
        const sanLimit = limit < 1 ? 1 : limit;
        const sanOffset = offset < 0 ? 0 : offset;
        
        //Array to build list of query and values
        let conditions = [];
        let queryVals = [];
        let inputErrors = []; //Will hold any errors in the paramaters

        //Add the filters if they were provided
        if(city){
            conditions.push('TRIM(L_City) = ?'); //could user LOWER(TRIM()) here to remove whitespace and make case insensitive, but when this is done the benifite of the indexes is lost.
            queryVals.push(city.trim().toLowerCase()); //Make sure the input city is all lowercase with no whitespace
        }
        if(zipcode){
            const parsed = parseInt(zipcode)
            if(isNaN(parsed) || parsed < 0){
                inputErrors.push("zipcode not a valid number");
            }else{
                conditions.push('L_zip = ?');
                queryVals.push(parsed);
            }
        }
        if(minPrice){
            const parsed = parseFloat(minPrice)
            if(isNaN(parsed) || parsed < 0){
                inputErrors.push("minPrice not a valid number.");
            }else{
                conditions.push('L_SystemPrice >= ?');
                queryVals.push(parsed);
            }
        }
        if(maxPrice){
            const parsed = parseFloat(maxPrice)
            if(isNaN(parsed) || parsed < 0){
                inputErrors.push("maxPrice not a valid number.");
            }else{
                conditions.push('L_SystemPrice <= ?');
                queryVals.push(parsed);
            }
        }
        if(beds){
            const parsed = parseFloat(beds)
            if(isNaN(parsed) || parsed < 0){
                inputErrors.push("beds not a valid number.");
            }else{
                conditions.push('L_Keyword2 >= ?'); //total number of beds according to rets_property.sql
                queryVals.push(parsed);
            }
        }
        if(baths){
            const parsed = parseFloat(baths)
            if(isNaN(parsed) || parsed < 0){
                inputErrors.push("baths not a valid number.");
            }else{
                conditions.push('LM_Dec_3 >= ?'); //total number of baths according to rets_property.sql
                queryVals.push(parsed);
            }
        }

        //if any of the input are invald send a 400 code
        if(inputErrors.length > 0){
            return res.status(400).json({
                error: "Bad Request",
                messages: inputErrors
            });
        }
        
        //Build the WHERE clause. If there are conditions join them with AND if not keep them empty
        const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        //Get the total count for filtered pagination
        const countQuery = `SELECT COUNT(*) AS total FROM rets_property ${where}`;
        const [countRows] = await pool.query(countQuery, queryVals);
        const totalItems = countRows[0].total;
        const totalPages = Math.ceil(totalItems / sanLimit);

        //get the paginated data
        const dataQuery = `SELECT * FROM rets_property ${where} ORDER BY id DESC LIMIT ? OFFSET ?`;
        //Combine filter params with pagination params
        const finalVals = [...queryVals, sanLimit, sanOffset];
        
        //print values to make sure the querry and value line up 
        //console.log("SQL Structure:", dataQuery);
        //console.log("SQL Values in Order:", finalVals);
        
        const [properties] = await pool.query(dataQuery, finalVals);

        //caluate the current page number
        const currPage = Math.floor(sanOffset / sanLimit) + 1;
        
        //return the data and pagination metadata
        res.json({
            pagination: {
                totalItems,
                totalPages,
                currentPage: currPage,
                itemsPerPage: sanLimit,
                hasNextPage: sanOffset + sanLimit < totalItems,
                hasPrevPage: sanOffset > 0
            },
			property: properties
        });
    }catch (error){
        console.error('Error in GET /api/properites:', error); //print the error to the terminal
        res.status(500).json({error: 'Internal Server Error'}); //message displayed to user on fail
    }
});

//search endpoint to get open house events for a property by its id
router.get('/:id/openhouses', async (req, res) => {

    try{
        //get the id of the property we are getting the open houses for
        const propertyId = Number(req.params.id);
        
        //get the property
        const [property] = await pool.query('SELECT L_ListingID FROM rets_property WHERE id = ?', propertyId);
        
        //make sure the property exists
        if(property.length == 0){
            console.log("The property does not exist");
            return res.status(404).json({ message: 'Property not found' });
        }
        
        //get the L_ListingID
        const listingid = property[0].L_ListingID;

        //querry the database rets_openhous table for the openhouses with the corrosponding property id
        const [openHouses] = await pool.query('SELECT * FROM rets_openhouse WHERE L_ListingID = ?', [listingid]);

        //return to the openhouses if there are any
        if(openHouses.length > 0){
            //res.json(openhouses);
            res.type('json'); //tell the browser that this is already valid json

            return res.send(openHouses[0].all_data); //send the raw string directly from the openHouse
        }else
            res.status(404).json({ message: "No open house data found" });

    }catch(err){
        console.log("Error fetching open houses.");
        res.status(500).json({ error: err.message});
    }

});


//search endpoint to get a single property by id
router.get('/:id', async (req, res) => {
    try{
        //get the id from the URL param and convert it to a javascript number
        const propertyId = Number(req.params.id);
    
        //querry the database
        //use await to pause execution until the database responds
        const [property] = await pool.query('SELECT * FROM rets_property WHERE id = ?', [propertyId]);
    
        //account for an error / incorrect id
        if(property.length == 0)
            return res.status(404).json({ message: 'Property not found, check that the id is valid' });
    
        //send back the property object
        res.json(property[0]);
    
    }catch(err){
        //catch any connection or syntax errors
        console.error("Database error occurred:", err);
        res.status(500).json({ error: err.message });
    }
});

//Export the router
export default router;
