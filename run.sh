#!/bin/bash
set -e

if [ -z "$1" ]; then
    echo "Usage: ./run.sh <ip>"
    exit 1
fi

git pull

sed -i -e "s/127.0.0.1/${1}/g" dist/main.*.js

docker build . -t poke-server:latest --no-cache -f docker/server.Dockerfile

docker compose up -f docker-compose.yml
