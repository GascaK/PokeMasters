from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

import answers
from src.routers import route_player, route_pokemon, route_items
from src.services.base_loader import BaseLoader
from src.routers import index



app = FastAPI(title="PokeMasters", version="0.1.0")

app.mount("/", StaticFiles(directory="dist"), name="static")

_ = BaseLoader(generations=answers.POKEMON_GENERATIONS)

#app.include_router(index.router)
app.include_router(route_pokemon.router)
app.include_router(route_items.router)
app.include_router(route_player.router)