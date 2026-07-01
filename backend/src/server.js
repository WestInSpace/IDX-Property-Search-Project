//imports using, type: module, in package.json
import express from 'express';
import cors from 'cors';
import dbPool from './config/db.js'; // Imports the MySQL pool
import propertyRouter from './routes/properties.js'; //Import the properties router
import 'dotenv/config';

//Imports using, type: commonjs, in package.json
//const express = require('express')
//const cors = require('cors')
//const dbPool = require('./config/db') //imports the MySQL pool from db.js
//require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Middleware
app.use(cors());
app.use(express.json()); // Allows the API to parse incoming JSON request bodies

//log requests to the console
app.use((req, res, next) => {

    const startTime = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        console.log(`${startTime}: [${req.method}] ${req.originalUrl} - status: ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// 2. Base Test Route
app.get('/', (req, res) => {
    res.json({ message: "REST API is running!" });
});

//Verify backend and database connectivity, visit: http://localhost:<PORT>/api/health
//make sure to replace <PORT> with the port in your .env file that you are running the server on, usually port 5000 for local hosting
//This is also done in app.listen and returned in immediately the terminal upon connection
app.get('/api/health', async (req, res) => {
    try {
        // Query the database to ensure the connection pool is responsive
        const [rows] = await dbPool.query('SELECT 1');
        
        // If the query succeeds, return a 200 OK status with details
        res.status(200).json({
            status: "OK",
            database: "CONNECTED",
            timestamp: new Date()
        });
    } catch (error) {
        // If the database is down, catch the error and return a 500 Internal Server Error
        res.status(500).json({
            status: "Down: 500",
            database: "DISCONNECTED",
            error: error.message,
            timestamp: new Date()
        });
    }
});

//Mount the properties Router
app.use('/api/properties', propertyRouter);

// 3. Start the Server & Test DB Connection
app.listen(PORT, async () => {
    console.log(`Server is listening on port ${PORT}`);

    // Execute a quick dummy query to test the database pool connection
    try {
        const [rows] = await dbPool.query('SELECT 1');
        console.log('Database connection pool established successfully.');
    } catch (error) {
        console.error('Database connection failed! Check your .env credentials.');
        console.error('Error Details:', error.message);
    }
});
