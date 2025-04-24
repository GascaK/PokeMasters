# PokeMasters
A comprehensive Pokemon game tracking and storage platform.

## Project Structure
- `ui/`: Frontend application
- `fast_server/`: FastAPI backend server
- `db_server/`: Database server
- `docker/`: Docker configuration files
- `cache/`: Cache storage
- `init_databases.py`: Database initialization script

## Prerequisites
Before getting started, ensure you have the following installed:
- [Visual Studio Code](https://code.visualstudio.com/)
- [Git](https://git-scm.com/download/win)
- [Node.js](https://nodejs.org/en/) (LTS version recommended)
- [Python 3.8+](https://www.python.org/downloads/)
- [Docker](https://www.docker.com/products/docker-desktop) (optional, for containerized deployment)

## Development Setup

### Frontend (UI)
1. Navigate to the UI directory:
   ```bash
   cd ui
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run start
   ```
   The UI will be available at `http://localhost:4200`

### Backend (FastAPI)
1. Navigate to the FastAPI server directory:
   ```bash
   cd fast_server
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### Database Server
1. Navigate to the database server directory:
   ```bash
   cd db_server
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the database server:
   ```bash
   python main.py
   ```

## Docker Deployment
To run the application using Docker:

1. Build the server image:
   ```bash
   docker build . -t poke-server:latest --no-cache -f docker/server.Dockerfile
   ```

2. Build the database image:
   ```bash
   docker build . -t poke-db:latest -f docker/database.Dockerfile
   ```

3. Create a network for the containers:
   ```bash
   docker network create pokeNetwork
   ```

4. Run the server container:
   ```bash
   docker run --rm -p 8010:8010 --network pokeNetwork --name poke-server poke-server:latest
   ```

5. Run the database container:
   ```bash
   docker run --rm -p 5000:5000 -v $(pwd)/db_server/database:/app/database --network pokeNetwork --name=poke-db poke-db:latest
   ```

6. Compose:
   ```bash
   docker compose -f docker/compose.yaml up
   ```

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.