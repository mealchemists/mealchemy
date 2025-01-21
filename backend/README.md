# Running the backend Django server in Docker 

First of all, configure Docker to be able to run in your environment.

Start the server under the container using:

```
docker-compose up
```

- If you encounter errors saying that the system cannot find the file specified,
open a new instance of Docker Desktop.

If you need to rebuild the image:

```
docker-compose build
```

## Apply database migrations

After the server is up and running, open a new terminal, and paste the following commands to perform the database migration to create the required tables for the project.

```
# docker-compose exec backend sh
# python manage.py makemigrations
# python manage.py migrate
```

pgAdmin is a web client that can be used to access and manipulate schema, and data of the current database. You can login into pgadmin using `localhost:5050' *(login info to pgAdmin can be found in dockercompose.yaml)*.

- NOTE: You can use a local install of pgAdmin to perform the same functionalities. You will need to provide a connection string (this might need some more looking into).

In pgAdmin, add a new server and connection to be able to view the tables and query the DB.

1. Click 'Add New Server'.
2. Under the 'General' tab, add a name to the server.
3. Under the 'Connection' tab, in the 'Host name/address' field, type in 'backend-db-1'.
4. In the same tab, under the 'Password' field, put in the same password that you would use to log into pgAdmin.
5. Click 'Save'.

## Using endpoints

Add some test data into one of tables and you will be able to use postman to put patch, or delete the value through the existing API endpoints.

For example, in postman using GET with 

```
http://localhost:8001/api/recipe
```

will return all recipes in the database (no auth yet)
