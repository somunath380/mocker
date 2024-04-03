#!/usr/bin/bash

if [ "$1" = "start" ]; then
    echo Building images for production...
    docker-compose -f docker-compose.yml up --build
fi

if [ "$1" = "shared" ]; then
    echo Building mongodb and redis images for local development... you need to explicitely run npm start to start the backend!
    docker-compose -f docker-compose-shared.yml up -d
    cd web
    npm run dev
fi

if [ "$1" = "shared-stop" ]; then
echo Stopping mongodb and redis images. please stop the backend server as well explicitely!
    docker-compose -f docker-compose-shared.yml down --remove-orphans
fi

if [ "$1" = "stop" ]; then
    echo Stopping all images of production...
    docker-compose -f docker-compose.yml down --remove-orphans
fi

if [ "$1" = "clear" ]; then
    echo This will clear all dangling images, volumes and non used networks...
    docker system prune
fi

