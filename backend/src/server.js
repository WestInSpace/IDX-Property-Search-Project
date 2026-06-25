//imports using, type: module, in package.json
import express from 'express';
import cors from 'cors';
import dbPool from './config/db.js'; // Imports the MySQL pool
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

// 2. Base Test Route
app.get('/', (req, res) => {
    res.json({ message: "REST API is running!" });
});

//Verify backend and database connectivity, visit: http://localhost:5000/api/health
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
