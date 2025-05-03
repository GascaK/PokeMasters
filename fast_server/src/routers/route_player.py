import json
import random
import requests
from typing import Annotated

from fastapi import APIRouter, HTTPException, Body, Request, Depends

from src.assets.compile import Composer
from src.interfaces.models import PlayerModel, PokemonModel, ItemModel


def get_composer(request: Request):
    return request.app.state.composer

router = APIRouter(
    prefix="/api/v1/{username}/player",
    tags=["index"],
    responses={404: {"description": "Not found"}}
)

@router.get("/find", tags=["player"])
def get_player_login(username: int, name: str, composer: Composer = Depends(get_composer)) -> PlayerModel:
    try:
        player: PlayerModel = composer.get_player_builder().get_player_by_name(name)

        return player
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error grabbing player: {e}")

@router.get("/starters", tags=["player", "pokemon"])
def get_player_starters(username: int, composer: Composer = Depends(get_composer)) -> list[PokemonModel]:
    starters = []
    for generation in composer.get_base_loader().get_generations():
        starters = {
            1: [1, 4, 7],
            2: [152, 155, 158]
        }.get(generation)

    try:
        saved: list[PokemonModel] = []
        for starter in starters:
            pokemon = composer.get_poke_builder().random_encounter(dex_id=starter)
            saved.append(pokemon)

        if not saved:
            raise HTTPException(status_code=500, detail="No starters generations were given.")
        
        return saved
    except Exception as e:
        raise HTTPException(status_code=500, detail="Unable to encounter starters.")

@router.post("/starters", tags=["player", "pokemon"])
def post_player_starters(username: int, pokemon: PokemonModel, composer: Composer = Depends(get_composer)) -> PokemonModel:
    try:
        return composer.get_poke_builder().save_pokemon(pokemon, owner=username)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Unable to save pokemon.")

@router.get("/", tags=["player"])
def get_player(username: int, composer: Composer = Depends(get_composer)) -> PlayerModel:
    # Get a current player
    try:
        player: PlayerModel = composer.get_player_builder().get_player(username)
        print(player)
        return player
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error grabbing player: {e}")

@router.post("/", tags=["player"])
def post_player(username: int, name: Annotated[str, Body()], composer: Composer = Depends(get_composer)) -> PlayerModel:
    # Create a new player
    try:
        player = composer.get_player_builder().new_player(
            PlayerModel(
                name=name,
                badges=0,
                dollars=1500
            )
        )
        return player
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating player: {e}")

@router.patch("/", tags=["player"])
def patch_player(
        username: int,
        player: PlayerModel,
        composer: Composer = Depends(get_composer)
    ) -> PlayerModel:

    # Update a current player
    try:
        temp = composer.get_player_builder().get_player(player.id)
        temp.name = player.name or temp.name
        temp.dollars = player.dollars or temp.dollars
        temp.badges = player.badges or temp.badges

        return composer.get_player_builder().save_player(temp)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving player: {e}")

@router.get("/pokemon", tags=["player"])
def get_player_pokemon(username: int, composer: Composer = Depends(get_composer)) -> list[PokemonModel]:
    # Get player pokemon
    try:
        pokemon: list[PokemonModel] = composer.get_player_builder().get_pokemon(username)
        return pokemon
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error grabbing player pokemon: {e}")

@router.delete("/pokemon", tags=["player"])
def delete_player_pokemon(username: int, composer: Composer = Depends(get_composer)):
    # delete player pokemon
    # TODO: figure out why we would ever do this... release? Dumb
    pass

@router.get("/items", tags=["player"])
def get_player_items(username: int, composer: Composer = Depends(get_composer)) -> list[ItemModel]:
    # Get player items
    try:
        items: list[ItemModel] = composer.get_player_builder().get_items(username)

        return items
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting player items: {e}")

@router.delete("/items", tags=["player"])
def delete_player_items(username: int, id: int, composer: Composer = Depends(get_composer)) -> None:
    # delete player items
    try:
        i = composer.get_item_builder().get_item(id)
        if i.owner != username:
            raise HTTPException(status_code=400, detail="This item does not belong to you.")

        return composer.get_item_builder().delete_item(i)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting player items: {e}")
