#!/opt/homebrew/bin/bash
source .env
if [ "$1" = "start" ]; then
    read -p "Enter super user name: " superuser
    export SUPERUSER="$superuser"
    read -p "Enter a password for superuser: " superpwd
    export SUPERPWD="$superpwd"
    export SECRET=$(openssl rand -hex 32)
    docker-compose -f docker-compose.yml up -d
    docker build -t mocker .
    docker run -d -p 3000:3000 --name mocker mocker
fi

if [ "$2" = "rebuild" ]; then
    docker-compose -f docker-compose.yml up --build --force-recreate
fi

if [ "$2" = "stop" ]; then
    docker-compose -f docker-compose.yml down
fi

