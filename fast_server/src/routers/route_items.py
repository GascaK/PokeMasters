import random
import requests

from typing import List, Annotated
from fastapi import APIRouter, HTTPException, Body, Request, Depends

from src.assets.compile import Composer
from src.interfaces.models import ItemModel, PlayerModel


def get_composer(request: Request):
    return request.app.state.composer

router = APIRouter(
    prefix="/api/v1/{username}/items",
    tags=["items"],
    responses={404: {"description": "Not found"}}
)

@router.get("/", tags=["items"])
def get_items(username: int, id: int, composer: Composer = Depends(get_composer)) -> ItemModel:
    # Return Item from db.
    try:
        item: ItemModel = composer.get_item_builder().get_item(id)
    except requests.exceptions.HTTPError as e:
        raise HTTPException(status_code=400, detail=f"{e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"{e}")

    if item.owner == username:
        return item
    else:
        raise HTTPException(status_code=400, detail="Your ID does not match this item.")

@router.delete("/delete", tags=["items"])
def delete_items(username: int, id: int, composer: Composer = Depends(get_composer)) -> None:
    # Delete Item from DB.
    try:
        item: ItemModel = composer.get_item_builder().get_item(id)
    except requests.exceptions.HTTPError as e:
        raise HTTPException(status_code=400, detail=f"{e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"{e}")

    if item.owner == username:
        return composer.get_item_builder().delete_item(item)
    else:
        raise HTTPException(status_code=400, detail="Your ID does not match this item.")

@router.post("/starter", tags=["items"])
def post_items_starter(username: int, amount=20, composer: Composer = Depends(get_composer)) -> None:
    for _ in range(amount):
        item = composer.get_item_builder().get_item_by_name("Poke Ball")
        item.owner = username
        composer.get_item_builder().save_item(item)

@router.post("/random", tags=["items"])
def post_items_random(username: int, tier: Annotated[int | None, Body()]=1, composer: Composer = Depends(get_composer)) -> ItemModel:
    
    if random.random() <= 0.25:
        item: ItemModel = composer.get_item_builder().get_item_by_text(text="sell", tier=random.randint(1, tier))
    else:
        item: ItemModel = composer.get_item_builder().random_item(tier=random.randint(1, tier))

    if item:
        item.owner = username
        return composer.get_item_builder().save_item(item)
    else:
        raise HTTPException(status_code=400, detail="No items found.")

@router.get("/shop", tags=["items", "shop"])
def get_items_shop(
        username: int,
        tier: int = 1,
        shop_size: int = 5,
        composer: Composer = Depends(get_composer)
    ) -> List[ItemModel]:
    # Get Shop of items.

    items: List[ItemModel] = []
    # Add Pokeballs to shop.
    for _ in range(5):
        if tier >= 1:
            items.append(composer.get_item_builder().get_item_by_name("Poke Ball"))
        if tier >= 2:
            items.append(composer.get_item_builder().get_item_by_name("Great Ball"))
        if tier >= 3:
            items.append(composer.get_item_builder().get_item_by_name("Ultra Ball"))

    # Add random items.
    for _ in range(shop_size):
        item: ItemModel = composer.get_item_builder().random_item(tier=random.randint(1, tier))
        items.append(item)
    return items

@router.post("/shop/buy", tags=["items", "shop", "player"])
def post_items_shop_buy(
        username: int,
        item: ItemModel,
        composer: Composer = Depends(get_composer)
    ) -> ItemModel:
    try:
        player = composer.get_player_builder().get_player(username)
        if player.dollars < item.cost:
            raise HTTPException(status_code=400, detail=f"Insufficient PokeDollars. {player.dollars} - {item.cost} < 0")
    except requests.exceptions.HTTPError as e:
        raise HTTPException(status_code=400, detail="Unable to find player.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"{e}")

    try:
        player.dollars = player.dollars - item.cost
        composer.get_player_builder().save_player(player)

        item.owner = username
        saved = composer.get_item_builder().save_item(item)
    except Exception as e:
        HTTPException(status_code=500, detail=f"Something terrible has happened. {e}")

    return saved

@router.post("/shop/sell", tags=["items", "shop", "player"])
def post_items_shop_sell(
        username: int,
        item: ItemModel,
        composer: Composer = Depends(get_composer)
    ) -> PlayerModel:
    try:
        player = composer.get_player_builder().get_player(username)
        if item.owner != username:
            raise HTTPException(status_code=400, detail="Not your item.")
    except requests.exceptions.HTTPError:
        raise HTTPException(status_code=400, detail="Unable to find player.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"{e}")

    try:
        player.dollars = player.dollars + item.cost
        composer.get_item_builder().delete_item(item)
        composer.get_player_builder().save_player(player)
    except Exception as e:
        HTTPException(status_code=500, detail=f"Something terrible has happened. {e}")

    return player
