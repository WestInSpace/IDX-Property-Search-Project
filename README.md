# IDX-Property-Search-Project

A Zillow/Redfin-style property search experience backed by real MLS data.

---

## Week 1 (6/15/2026)

Set up local MySQL database containing open house and property information using Docker.

### 1. Install Docker Engine
Open the terminal (Ctrl + Alt + T) and run the following commands to download and run the official script:

`curl -fsSL https://get.docker.com -o get-docker.sh`  
`sudo sh get-docker.sh`

Confirm the installation (if this outputs the version, it's installed successfully):  
`docker --version`

### 2. Configure Non-Sudo Group
Add yourself to the docker group so you don't have to type sudo before every command:

`sudo groupadd docker`  
`sudo usermod -aG docker $USER`  
`newgrp docker`  

### 3. Create the Database Container
Rename the sample-compose.yml file to compose.yml:  
`mv sample-compose.yml compose.yml`

Navigate to /backend/ and open the compose.yml file in your preferred text editor (like vim):  
`vim compose.yml`

Update the MYSQL_ROOT_PASSWORD field inside the .yml file to be the password you want for your database container.  
MYSQL_ROOT_PASSWORD: [enter_your_password]  
*If using Vim, press Esc, type :wq, and hit Enter to save and exit.*

### 4. Get SQL Files
Download the sql files you will turn into tables in your database.  
Place the files in a directory called sql-files inside the /backend directory  
The files should be named: rets_openhouse.sql and rets_property.sql

### 5. Start the Container
Run the following command to build and launch the database container in detached mode:

`docker compose up -d`

### 6. Import SQL Datasets
Import the data files into the database. This will create a new table for each SQL file. 
> Note: This step may take up to an hour depending on your computer's hardware specs. We use the -vv flag and grep to show a minimal progress log.

Import the properties data:  
`docker exec -i idx-mysql-local mysql -u root -p'your_password' -vv rets < ./sql-files/rets_property.sql | grep affected`

Import the open house data:  
`docker exec -i idx-mysql-local mysql -u root -p'your_password' -vv rets < ./sql-files/rets_openhouse.sql | grep affected`

### 7. Confirm Database Status
Access the interactive MySQL shell inside the container:

`docker exec -it idx-mysql-local mysql -u root -p`  
*Enter your root password when prompted*

Your terminal prompt should now display: mysql>  
Verify your tables by executing the following queries:

`SHOW DATABASES;`  
`USE rets;`  
`SHOW TABLES;`

Ensure both tables contain data (the counts should return non-zero numbers):  
`SELECT COUNT(*) FROM rets_property;`  
`SELECT COUNT(*) FROM rets_openhouse;`

> Troubleshooting: If either table returns 0, drop the failed table and re-run the import step:  
`DROP TABLE rets.[tableName];`

Verify you can query table layouts and structures successfully:

`DESCRIBE rets_property;`  
`DESCRIBE rets_openhouse;`  
`SELECT id FROM rets_property LIMIT 10;`  
`SELECT id FROM rets_openhouse LIMIT 10;`  

Once confirmed, exit the MySQL prompt:  
`exit;`

### 8. Verify Volume Persistence
Test stopping and restarting your environment to ensure data persists properly:

`docker compose down`  
`docker compose up -d`

---

## Week 2 (6/22/2026)

**Dependencies:** node, express, mysql2, dotenv, cors  
**Dev Dependencies:** nodemon

Started a Node.js project utilizing a MySQL connection pool module. The server seamlessly connects to the database environment and passes all health status verification checks.

### 1. Install Project Dependencies
Navigate to the backend codebase and install the required modules specified in your package.json:

`cd /backend/`  
`npm install`

### 2. Configure Environment Variables
Create and open a .env file within your /backend directory:

`touch .env`  
`vim .env`

Populate the configuration values using your custom credentials:

```
PORT=[port to run server on]
DB_HOST=[database location]
DB_USER=[database username]
DB_PASSWORD=[yourDatabasePassword]
DB_NAME=[databasename]
```

* **PORT**: The network port for your backend server (Common defaults: 5000, 8000, 8080).
* **DB_HOST**: Host ip address. Use localhost if running Node locally outside of the Docker network.
* **DB_USER**: Database administrative user (default: root).

### 3. Launch Development Server
Ensure your Docker container from Week 1 is up and running, then start the Node service backend:

`npm run dev`

Upon a successful configuration, you will receive a database connection success message. Open your web browser and hit the health check route to verify everything works:

`http://localhost:[portYourServerIsRunnignOn']/api/health`  
*make sure to fill in the placeholder with the port you specified in your .env file*

* **Expected Output:** An "OK" "CONNECTED" JSON or text response.
* **Troubleshooting:** If you see a Down: 500 "DISCONNECTED" status code, verify that your Docker container is actively mapping to port 3306 on localhost and check your .env credentials.
