#!/opt/homebrew/bin/bash

if [ "$1" = "start" ]; then
    read -p "Enter super user name: " superuser
    export SUPERUSER="$superuser"
    read -p "Enter a password for superuser: " superpwd
    export SUPERPWD="$superpwd"
    docker-compose up --build
fi

if [ "$2" = "stop" ]; then
    docker-compose down --remove-orphans
    docker system prune
fi

