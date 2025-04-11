# PokeMasters
Website for pokemon game related tracking and storage.


### Getting-Started

Before getting started coding, verify you have these apps installed:
* Visual Studio Code - [here](https://code.visualstudio.com/)
* git - [here](https://git-scm.com/download/win)

### Launching Pokemaster Locally.
1. Clone Pokemaster Repo @ https://github.com/GascaK/PokeMasters/ using your ide.
2. Open terminal in VScode [Ctrl] + ['].
3. Setup angular environment.
        - Install Node.js - [here](https://nodejs.org/en/)
        - Restart VScode
        - run `node -v` to make sure it's installed.
        - run `npm -v` to make sure package manager is installed.
4. Run `npm install -g @angular/cli`
5. Run `Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force`
6. `cd web`
7. `npm install`
8. `npm run start`
9. Browser should be open at localhost:4200.

### Running the UI locally for development
1. fastapi dev ./fast_server/main.py
2. python3 ./db_server/main.py
3. cd ui && npm run start

### Running the game for testing
1. uvicorn --port 8010 --host 0.0.0.0 fast_server.main:subapp
2. uvicorn --port 8000 --host 0.0.0.0 fast_server.main:app
3. python3 db_server/main.py

### Docker
cd ui && npm run build && cd ..
docker build . -t poke-server:latest --no-cache -f docker/server.Dockerfile
docker run --rm -p 8010:8010 --network pokeNetwork --name poke-server docker.io/library/poke-server:latest

docker build . -t poke-db:latest -f docker/database.Dockerfile
docker run --rm -p 5000:5000 -v '//d/Projects/PokeMasters/db_server/database:/app/database' --network pokeNetwork --name=poke-db docker.io/library/poke-db:latest