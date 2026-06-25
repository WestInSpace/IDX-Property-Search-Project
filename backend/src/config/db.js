import mysql from 'mysql2/promise';
import 'dotenv/config';

// Create the connection pool using environment variables
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 5, //Maximum number of connections, adjust based on needs
    queueLimit: 0
});

// Export the pool to use in your route files
export default pool;
