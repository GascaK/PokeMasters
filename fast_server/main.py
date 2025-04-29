from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from src.routers import route_player, route_pokemon, route_items
from src.assets.compile import Composer


app = FastAPI(title="PokeMasters", version="0.1.0")

origins = ['*']
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.state.composer = Composer()

app.include_router(route_pokemon.router)
app.include_router(route_items.router)
app.include_router(route_player.router)

# Mount routes last.
app.mount("/", StaticFiles(directory="dist", html=True), name="index")