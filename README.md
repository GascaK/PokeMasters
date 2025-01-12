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
docker build . -t pokemasters-server:server -f docker/server.Dockerfile
docker run -it --name pkm-server --rm -p 8010:8010 --network host pokemasters-server:server

docker build . -t pokemasters-server:api -f docker/api.Dockerfile
docker run -it --name pkm-api --rm -p 8000:8000 --network host pokemasters-server:api

docker build . -t pokemasters-db:latest -f docker/database.Dockerfile
docker run -it --name db-server  --rm -p 5000:5000 --network host -v $pwd/db_server/database:/app/database pokemasters-db:latest