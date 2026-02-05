from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from src.routers import route_player, route_pokemon, route_items, route_trades
from src.assets.compile import Composer


app = FastAPI(title="PokeMastersAPI", version="0.1.0")

app.state.composer = Composer()

# Include all API routes BEFORE static files mount
app.include_router(route_pokemon.router)
app.include_router(route_items.router)
app.include_router(route_player.router)
app.include_router(route_trades.router)

# Mount static files LAST so API routes take precedence
app.mount("/", StaticFiles(directory="dist", html=True), name="index")

# Add CORS middleware LAST (reversed execution order in FastAPI)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)