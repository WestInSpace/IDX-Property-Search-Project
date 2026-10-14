//imports using, type: module, in package.json
import mysql from 'mysql2/promise';
import 'dotenv/config'; //Import the .env file using, type: module, in package.json

//Imports using, type: commonjs, in package.json
//const mysql = require('mysql12/promise')
//require('dotenv').config();

// Create the connection pool using environment variables
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10, //Maximum number of connections
    queueLimit: 0
});

// Export the pool to use in other files
//exports using, type: module, in package.json
export default pool;

//exports using, type: commonjs, in package.json
//module.exports = pool;
