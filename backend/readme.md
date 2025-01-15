# Running the backend django server in docker 

First configure docker to be able to run in your envronment

start the server using:
```
docker-compose up
```

if you need to rebuild the image or 
```
docker-compose build
```

## Apply database migrations

after the docker-compose command is ran and the server is running you can perform the database migration to create the required tables for the project.

```
docker-compose exec backend sh
python manage.py makemigrations
python manage.py migrate
```

you can login into pgadmin using `localhost:5050' (login info can be found in dockercompose.yml). You can use a local install of pgadmin aswell

add a new server and connection to be able to view tables and query

## Using endpoints

add some test data into one the tables and you will be able to use postman to put patch, or delete the value through the api endpoints

for example in postman using GET with 
'''
http://localhost:8001/api/recipe
```
will return all recipes in the database (no auth yet)
