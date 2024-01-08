#!/opt/homebrew/bin/bash
if [ "$1" = "start" ]; then
    read -p "enter environment (development, testing, production): " environment
    environment=$(echo "$environment")
    if ["$environment" = ""]; then
        environment="development"
    fi
    export ENV=$environment
    echo "Chosen ENV: $environment"
    node config.js
    docker-compose -f docker-compose.yml up -d
fi

if [ "$1" = "stop" ]; then
    docker-compose -f docker-compose.yml down
fi
