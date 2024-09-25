import json
import requests

from fastapi import APIRouter

from fast_server.src.services.poke_builder import PokemonBuilder
from src.services.base_loader import BaseLoader


router = APIRouter(
    prefix="/api/v1/{username}",
    tags=["index"],
    responses={404: {"description": "Not found"}}
)

p_loader: PokemonBuilder = PokemonBuilder(BaseLoader())


@router.get("/", tags=["pokemon"])
def get_index(username: int):
    pass

@router.post("/", tags=["pokemon"])
def post_encounter(username):
    pass