import express from 'express';
import pool from '../config/db.js';

const router = express.Router(); //modular express router to allow relative pathing

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
                conditions.push('L_Keyword2 = ?'); //total number of beds according to rets_property.sql
                queryVals.push(parsed);
            }
        }
        if(baths){
            const parsed = parseFloat(baths)
            if(isNaN(parsed) || parsed < 0){
                inputErrors.push("baths not a valid number.");
            }else{
                conditions.push('LM_Dec_3 = ?'); //total number of baths according to rets_property.sql
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
            data: properties,
            pagination: {
                totalItems,
                totalPages,
                currentPage: currPage,
                itemsPerPage: sanLimit,
                hasNextPage: sanOffset + sanLimit < totalItems,
                hasPrevPage: sanOffset > 0
            }
        });
    }catch (error){
        console.error('Error in GET /api/properites:', error); //print the error to the terminal
        res.status(500).json({error: 'Internal Server Error'}); //message displayed to user on fail
    }
});

//Export the router
export default router;
