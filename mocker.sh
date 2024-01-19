#!/opt/homebrew/bin/bash
if [ "$1" = "start" ]; then
    read -p "enter environment (development, testing, production): " environment
    environment=$(echo "$environment")
    if ["$environment" = ""]; then
        environment="development"
    fi
    export ENV=$environment
    echo "Chosen ENV: $environment"

    read -p "Enter a value to generate superuser: " superuser
    export SUPERUSER="$superuser"

    read -p "Enter a value to generate superuser password: " superpwd
    export SUPERPWD="$superpwd"

    docker-compose -f docker-compose.yml up
fi

if [ "$1" = "local" ] && [ "$2" = "start" ]; then
    export ENV=development
    echo "Chosen ENV: $environment"

    read -p "Enter a value to generate superuser: " superuser
    export SUPERUSER="$superuser"

    read -p "Enter a value to generate superuser password: " superpwd
    export SUPERPWD="$superpwd"
    docker-compose -f docker-compose-local.yml up -d
    # npm run local
    # start debugging using launch.json
fi

if [ "$1" = "local" ] && [ "$2" = "rebuild" ]; then
    docker-compose -f docker-compose-local.yml up  -d --build --force-recreate
fi

if [ "$1" = "local" ] && [ "$2" = "stop" ]; then
    docker-compose -f docker-compose-local.yml down
fi

if [ "$1" = "stop" ]; then
    docker-compose -f docker-compose.yml down
fi

if [ "$1" = "rebuild" ]; then
    docker-compose -f docker-compose.yml up --build --force-recreate
fi
