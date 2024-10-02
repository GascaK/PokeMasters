from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

import answers
from src.routers import route_player, route_pokemon, route_items
from src.services.base_loader import BaseLoader
from src.routers import index



app = FastAPI(title="PokeMasters", version="0.1.0")

origins = [
    "http://localhost:4200",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_ = BaseLoader(generations=answers.POKEMON_GENERATIONS)

app.include_router(route_pokemon.router)
app.include_router(route_items.router)
app.include_router(route_player.router)

# Mount routes last.
app.mount("/", StaticFiles(directory="dist"), name="static")