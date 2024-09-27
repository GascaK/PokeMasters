import json
import random
import requests
from typing import Annotated

from fastapi import APIRouter, HTTPException, Body

import answers
from src.services.base_loader import BaseLoader
from src.services.item_builder import ItemBuilder
from src.services.poke_builder import PokemonBuilder
from src.services.player_builder import PlayerBuilder

from src.interfaces.models import PlayerModel, PokemonModel, ItemModel

base_loader = BaseLoader(generations=answers.POKEMON_GENERATIONS)
poke_builder = PokemonBuilder(base_loader)
item_builder = ItemBuilder(base_loader)

player_builder = PlayerBuilder(base_loader, poke_builder)

router = APIRouter(
    prefix="/api/v1/{username}/player",
    tags=["index"],
    responses={404: {"description": "Not found"}}
)

@router.get("/", tags=["player"])
def get_player(username: int) -> PlayerModel:
    # Get a current player
    try:
        player: PlayerModel = player_builder.get_player(username)
        print(player)
        return player
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error grabbing player: {e}")

@router.post("/", tags=["player"])
def post_player(username: int, name: Annotated[str, Body()]) -> PlayerModel:
    # Create a new player
    try:
        player = player_builder.new_player(
            PlayerModel(
                name=name,
                badges=0,
                dollars=500
            )
        )
        return player
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating player: {e}")

@router.patch("/", tags=["player"])
def patch_player(
        username: int,
        player: PlayerModel
    ) -> PlayerModel:

    # Update a current player
    try:
        temp = player_builder.get_player(player.id)
        temp.name = player.name or temp.name
        temp.dollars = player.dollars or temp.dollars
        temp.badges = player.badges or temp.badges

        return player_builder.save_player(temp)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving player: {e}")

@router.get("/pokemon", tags=["player"])
def get_player_pokemon(username: int) -> list[PokemonModel]:
    # Get player pokemon
    try:
        pokemon: list[PokemonModel] = player_builder.get_pokemon(username)
        return pokemon
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error grabbing player pokemon: {e}")

@router.delete("/pokemon", tags=["player"])
def delete_player_pokemon(username: int):
    # delete player pokemon
    # TODO: figure out why we would ever do this... release? Dumb
    pass

@router.get("/items", tags=["player"])
def get_player_items(username: int) -> list[ItemModel]:
    # Get player items
    try:
        items: list[ItemModel] = player_builder.get_items(username)

        return items
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting player items: {e}")

@router.delete("/items", tags=["player"])
def delete_player_items(username: int, id: int) -> None:
    # delete player items
    try:
        i = item_builder.get_item(id)
        if i.owner != username:
            raise HTTPException(status_code=400, detail="This item does not belong to you.")

        return item_builder.delete_item(i)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting player items: {e}")
