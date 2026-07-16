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
> Note: This step may take around three hours depending on your computer's hardware specs.  

Use the -vv flag and grep to show a minimal progress log.

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

---

## Week 3 (6/29/2026)

start the database as shown in week 1 by navigaing to the folder that contains the compose.yml file and running:  
`docker compose up -d`

Start the server as shown in week 2 by navigating to the folder that contains server.js and running  
`npm run dev`

Varify that the table indexes exit by logging into mysql (showsn in week 1) and runnging:  
`SHOW INDEX FROM [your_table_name];`

If you get no output or you don't have indexes for city and zip then add them by running:  
`ALTER TABLE [your_table_name] ADD INDEX idx_city (L_City);`  
`ALTER TABLE [your_table_name] ADD INDEX idx_zipcode (L_zipcode);`  
`CREATE INDEX idx_bed_bath ON [your_table_name] (L_Keyword2, LM_Dec_3);`  
`CREATE INDEX idx_city_price ON [your_table_name] (L_City, L_SystemPrice);`

If you get an error about an invalid default value:   
Change the data checking of your mysql to be less strict then try adding the indexes again:  
`SET GLOBAL sql_mode = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';`  
`SET SESSION sql_mode = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';`

You can then start making filtered querries by typing the following into your browser:  
http://localhost:<your port number, usually 5000>/api/properties?<Your filters>

There is support to filter by: city, zipcode, minPrice, maxPrice, beds, and baths.  
You can also set the number of listings shown using limit and an offset to show the listings between offset and limit.

Structure the filter as such:  
[filterType]=[vilterValue]

Seperate each filter with the character: '&'

This is for an example, the default values for limit is already 20 and the default values for offset is already 0.  
For example a filter that filters for 20 properties with an offset of 0 in the city of orlando with 2 baths and 3 beds between $300000 and $500000 would look like this:  
city=orlando&baths=2&beds=3&minPrice=300000&maxPrice=500000&limit=20&offset=0

So the total api call would look something like this:  
http://localhost:<your port number, ussually 5000>/api/properties?city=orlando&baths=2&beds=3&minPrice=300000&maxPrice=500000&limit=20&offset=0

---

## Week 4 (7/3/2026)

start the database as shown in week 1 by navigaing to the directory that contains the compose.yml file for the container and running:  
`docker compose up -d`  
*Note: this should run on the local port 3306*

Start the server as shown in week 2: You can start it from inside the same directory as the compose.yml file, run:  
`npm run dev`  
*Note: this should run on the local port 5000*

You can then visit the follwoing to see a single property:  
http://localhost:<your port number, ussually 5000>/api/properties/<PropertyID>

You can then get the open houses for a property by visiting the following:  
http://localhost:<your port number, ussually 5000>/api/properties/<PropertyID>/openhouses

Also, look in the terminal, where you ran npm run dev and you will see logs for requests that show the start time, method, url, status and time the request took.

---

## Week 5 (7/13/2026)

Start the database as shown in week 1 by navigaing to the directory that contains the compose.yml file for the container and running:  
`docker compose up`  
*Note: this should run on the local port 3306*

Start the sever as shown in week 2 by navigating to the folder that contains server.js
`npm run dev`  
*Note: this should run on the local port 5000*

Before starting the frontend server install needed dependencies for the frontend by navigating to the /frontend/ folder and running:  
`npm install`

Start the frontend server by navigating to the frontend directory and running:
`npm run dev`  
*Note: this should run on the local port 3000*

You can then visit this url (if the front end is on port 3000) to see the week 5 progress:  
http://localhost:3000/

It should display a grid of 24 properties and at the bottom you can navigate to other pages.  
Right now it just displays all the properties, but in future updates the user will be able to filter the properties to only display certain ones.  

If you see an error make sure the database continaer is running correctly, the backedn server is running correctly and has connected to the continaer, and make sure the frontend server has been started.  

---

## Week 6 (7/20/2026)

Added the ability to filter properties from the front end.

Start the database container, backend server, and frontend server as shown in week 5

visit this url:  
http://localhost:3000/

You will now see a bar at the top. If you click the "-- Show Filters" button the filter options will be displayed  
Type in the desired filters and click the "Apply" button, or click the "Clear" button to reset your filter choices.

You might also notice that I have updated the theme, giving it a more aesthetically pleasing dark theme.

Unit tests have also been added.

There are three unit tests for the API client module:  
1. Tests that property and pagination data is returned correctly.  
2. Tests that the url that is built to support filters is built properly.  
3. Test how errors are handeled.  

And there are also three unit tests for the propertyFilters component:  
1. Tests that the PropertyFilters are rendering on the screen.  
2. Tests that the user is able to type in the boxes.  
3. Tests that when the apply button is pressed the draft is sent off.

To run these tests navigate to the folder: /frontend/ in your terminal and first install dependencies:  
`npm install`  
Next, you can run the unit tests by running:  
`npm test`

You should see:  
Test Files 2 passed  
Tests 6 passed



