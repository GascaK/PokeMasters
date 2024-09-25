from fastapi import FastAPI

import answers
from fast_server.src.routers import route_player, route_pokemon, route_items
from fast_server.src.services.base_loader import BaseLoader
from src.routers import index



app = FastAPI(title="PokeMasters", version="0.1.0")

_ = BaseLoader(generations=answers.POKEMON_GENERATIONS)

app.include_router(index.router)
app.include_router(route_pokemon.router)
app.include_router(route_items.router)
app.include_router(route_player.router)