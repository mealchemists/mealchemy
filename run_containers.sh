#!/bin/bash

docker-compose \
    -f backend/docker-compose.yml \
    -f frontend/docker-compose.yml \
    --env-file .env \
    up
