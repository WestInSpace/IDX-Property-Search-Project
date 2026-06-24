# IDX-Property-Search-Project
A Zillow/Redfin-style property search experience backed by real MLS data.

Set up local mysql database containing open house and property information using docker.

1. Install docker engine:  
Open the terminal (Ctrl + Alt + T)  
  Type the commands:  
  &nbsp;&nbsp;&nbsp;&nbsp;curl -fsSL https://get.docker.com -o get-docker.sh  
  &nbsp;&nbsp;&nbsp;&nbsp;sudo sh get-docker.sh  
  Confirm the installation:  
  &nbsp;&nbsp;&nbsp;&nbsp;docker --version #If this outputs the docker version, it's installed

2. Add youself to the docker group so you don't have to type sudo before every command  
   type in the terminal:  
   &nbsp;&nbsp;&nbsp;&nbsp;sudo groupadd docker  
   &nbsp;&nbsp;&nbsp;&nbsp;sudo usermod -aG docker $USER  
   &nbsp;&nbsp;&nbsp;&nbsp;newgrp docker

4. Create the container for your mysql database:  
   create a directory for your container:  
   &nbsp;&nbsp;&nbsp;&nbsp;mkdir idx-mysql-local  
   navigate to the folder you want to be the container using:  
   &nbsp;&nbsp;&nbsp;&nbsp;cd ./idx-mysql-local  
   create the compose YAML file:  
   &nbsp;&nbsp;&nbsp;&nbsp;touch compose.yml  
   open the YAML file in your choice of editor  
   To open it in vim: (my preference)  
   &nbsp;&nbsp;&nbsp;&nbsp;vim compose.yml  
   Type the following into the YAML file:  
   
     &nbsp;&nbsp;&nbsp;&nbsp;mysql-latest  
       &nbsp;&nbsp;&nbsp;&nbsp;image: mysql:8.0  
       &nbsp;&nbsp;&nbsp;&nbsp;container_name: idx-mysql-local #A unique name for your container  
       &nbsp;&nbsp;&nbsp;&nbsp;command: --socket/tmp/mysql.sock #put the sock file in a non-persistant directory  
       &nbsp;&nbsp;&nbsp;&nbsp;restart: unless-stopped #On fail to start, try again  
       &nbsp;&nbsp;&nbsp;&nbsp;environment:  
         &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MYSQL_ROOT_PASSWORD: [enter your password]  
         &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MYSQL_DATABASE: rets  
     &nbsp;&nbsp;&nbsp;&nbsp;startup  
       &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ports:  
         &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- "3306:3306"  
       &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;volumes:  
         &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- ./init-scripts:/docker-entrypoint-initdb.d  
         &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- db_data:/var/lib/mysql  
    &nbsp;&nbsp;&nbsp;&nbsp;volumes:  
       &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;db_data:  
   
   Click esc then type :wq and hit enter  

5. Start the container to set up the database:  
  docker compose up -d #builds the container from the yml file  

6. Copy the sql files into the container (This is so they will import faster later)  
  &nbsp;&nbsp;&nbsp;&nbsp;mkdir mysql-files #create a directory inside the container to hold the sql files  
  #Copy the sql files into that directory  
  &nbsp;&nbsp;&nbsp;&nbsp;cp [pathTo:rets_property.sql] ./mysql-files  
  &nbsp;&nbsp;&nbsp;&nbsp;cp [pathTo:rets_openhouse.sql] ./mysql-files  

7. import the sql files into the database, this will create a new table for each sql file (This step may take a long time, around an hour, depending on the resources available on your computer)  
&nbsp;&nbsp;&nbsp;&nbsp;I like to use the -vv flag and grep to get a minimilst output so I can see that is is still working to import.
   
   #Import the rets_property.sql file:  
   &nbsp;&nbsp;&nbsp;&nbsp;docker exec -i idx-mysql-local mysql --socket=/tmp/mysql.sock -u root -p'your_password' -vv rets < ./mysql-files/rets_property.sql | grep affected 

  #import the rets_openhouse.sql file:  
  &nbsp;&nbsp;&nbsp;&nbsp;docker exec -i idx-mysql-local mysql --socket=/tmp/mysql.sock -u root -p'your_password' -vv rets < ./mysql-files/rets_openhouse.sql | grep affected

7. Confirm that the database is working correctly:  
  #Enter the mysql database:  
  &nbsp;&nbsp;&nbsp;&nbsp;docker exec -it idx-mysql-local mysql --socket=/tmp/mysql.sock -u root -p
  &nbsp;&nbsp;&nbsp;&nbsp;[Enter your password]

  Your prompt should now look somehting like this:  
  &nbsp;&nbsp;&nbsp;&nbsp;mysql>  
  Navigate to your database:  
  &nbsp;&nbsp;&nbsp;&nbsp;SHOW DATABASES;  
  &nbsp;&nbsp;&nbsp;&nbsp;USE rets;  
  &nbsp;&nbsp;&nbsp;&nbsp;SHOW TABLES;
    
  Check if there is data in each table:  
  Both of these should return a non-zero number. If the number is 0, there is no data in the tables.  
  &nbsp;&nbsp;&nbsp;&nbsp;SELECT COUNT(*) FROM rets_property;  
  &nbsp;&nbsp;&nbsp;&nbsp;SELECT COUNT(*) FROM rets_openhouse;  

  If you get 0 for either of the tables enter:  
  This will delete the table that has no data so you can try again.  
  &nbsp;&nbsp;&nbsp;&nbsp;DROP TABLE rets.[tableName]

  Then, exit mysql and try importing the data again as described in step 6

  Once this check passes try to querry the database  
  try the following simple querries:  
  &nbsp;&nbsp;&nbsp;&nbsp;DESCRIBE rets_property; #Should output the collumn names for the rets_property table  
  &nbsp;&nbsp;&nbsp;&nbsp;DESCRIBE rets_openhouse; #Should output the collumn names for the rets_openhouse table

  try this simple querry for each table it should return the id for each row in the table:  
  &nbsp;&nbsp;&nbsp;&nbsp;SELECT id FROM rets_property;  
  &nbsp;&nbsp;&nbsp;&nbsp;SELECT id FROM rets_openhouse;

  Once you have varified that the tables have data in them and are able to be queried exit mysql by:  
  &nbsp;&nbsp;&nbsp;&nbsp;exit;

8. Restart the container to make sure it stops and starts correctly  
  Enter the following to stop the container:  
  &nbsp;&nbsp;&nbsp;&nbsp;docker compose down  
   Next, enter the folowing to start the container:  
   &nbsp;&nbsp;&nbsp;&nbsp;docker compose up

   The container should stop and start with no errors.

   
