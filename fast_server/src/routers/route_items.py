import random
import requests

from typing import List, Annotated
from fastapi import APIRouter, HTTPException, Body

import answers
from src.interfaces.interface import Player
from src.services.base_loader import BaseLoader
from src.services.item_builder import ItemBuilder
from src.services.player_builder import PlayerBuilder

from src.interfaces.models import ItemModel


base_loader = BaseLoader(generations=answers.POKEMON_GENERATIONS)
item_builder = ItemBuilder(base_loader)
player_builder = PlayerBuilder(base_loader)
router = APIRouter(
    prefix="/api/v1/{username}/items",
    tags=["items"],
    responses={404: {"description": "Not found"}}
)


@router.get("/", tags=["items"])
def get_items(username: int, id: Annotated[int, Body()]) -> ItemModel:
    # Return Item from db.
    try:
        item: ItemModel = item_builder.get_item(id)
    except requests.exceptions.HTTPError as e:
        raise HTTPException(status_code=400, detail=f"{e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"{e}")

    if item.owner == username:
        return item
    else:
        raise HTTPException(status_code=400, detail="Your ID does not match this item.")

@router.delete("/", tags=["items"])
def delete_items(username: int, id: Annotated[int, Body()]) -> None:
    # Delete Item from DB.
    try:
        item: ItemModel = item_builder.get_item(id)
    except requests.exceptions.HTTPError as e:
        raise HTTPException(status_code=400, detail=f"{e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"{e}")

    if item.owner == username:
        return item_builder.delete_item(item)
    else:
        raise HTTPException(status_code=400, detail="Your ID does not match this item.")

@router.get("/random", tags=["items"])
def get_items_random(username: int, tier: Annotated[int | None, Body()]=1) -> ItemModel:
    item: ItemModel = item_builder.random_item(tier=random.randint(1, tier))

    if item:
        item.owner = username
        return item_builder.save_item(item)
    else:
        raise HTTPException(status_code=400, detail="No items found.")

@router.get("/shop", tags=["items", "shop"])
def get_items_shop(
        username: int, 
        tier: Annotated[int, Body()], 
        shop_size: Annotated[int | None, Body()]=5
    ) -> List[ItemModel]:
    # Get Shop of items.

    items: List[ItemModel] = []
    # Add Pokeballs to shop.
    for _ in range(5):
        if tier >= 1:
            items.append(item_builder.get_item_by_name("Poke Ball"))
        if tier >= 2:
            items.append(item_builder.get_item_by_name("Great Ball"))
        if tier >= 3:
            items.append(item_builder.get_item_by_name("Ultra Ball"))

    # Add 5 random items.
    for _ in range(shop_size):
        item: ItemModel = item_builder.random_item(tier=random.randint(1, tier))
        items.append(item)
    return items

@router.post("/shop/buy", tags=["items", "shop", "player"])
def post_items_shop_buy(username: int, item: ItemModel) -> ItemModel:
    try:
        player = player_builder.get_player(username)
        if player.dollars < item.cost:
            raise HTTPException(status_code=400, detail=f"Insufficient PokeDollars. {player.dollars} - {item.cost} < 0")
    except requests.exceptions.HTTPError as e:
        raise HTTPException(status_code=400, detail="Unable to find player.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"{e}")

    try:
        player.dollars = player.dollars - item.cost
        player_builder.save_player(player)

        item.owner = username
        saved = item_builder.save_item(item)
    except Exception as e:
        HTTPException(status_code=500, detail=f"Something terrible has happened. {e}")

    return saved

@router.post("/shop/sell", tags=["items", "shop", "player"])
def post_items_shop_sell(username: int, item: ItemModel):
    try:
        player = player_builder.get_player(username)
        if item.owner != username:
            raise HTTPException(status_code=400, detail="Not your item.")
    except requests.exceptions.HTTPError:
        raise HTTPException(status_code=400, detail="Unable to find player.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"{e}")

    try:
        player.dollars = player.dollars + item.cost
        item_builder.delete_item(item)
        player_builder.save_player(player)
    except Exception as e:
        HTTPException(status_code=500, detail=f"Something terrible has happened. {e}")

    return player
