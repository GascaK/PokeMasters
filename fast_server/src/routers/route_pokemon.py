import random
import requests
from typing import List, Annotated

from fastapi import APIRouter, HTTPException, Body, Request, Depends
from pydantic import BaseModel

import answers
from src.assets.compile import Composer
from src.interfaces.models import PokemonModel, ItemModel


def get_composer(request: Request):
    return request.app.state.composer

router = APIRouter(
    prefix="/api/v1/{username}/pokemon",
    tags=["index"],
    responses={404: {"description": "Not found"}}
)

@router.post("/encounter", response_model=PokemonModel, tags=["pokemon", "encounter"])
def post_pokemon_encounter(
        username: int,
        tier: Annotated[int | None, Body()]=1,
        items: list[ItemModel]=None,
        encounter_type: Annotated[str | None, Body()]=None,
        composer: Composer = Depends(get_composer)
    ) -> PokemonModel:
    # Encounter a wild Pokemon.

    try:
        encounter_tier = random.randint(1 if tier!=4 else 4, tier)
        print("items.", items)
        pokemon = composer.get_poke_builder().random_encounter(tier=encounter_tier, _type=encounter_type, items=items)
        saved: PokemonModel = composer.get_poke_builder().save_pokemon(pokemon, owner=0)
        return saved

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error encountering pokemon: {e}")


@router.put("/encounter", tags=["pokemon", "encounter"])
def put_pokemon_encounter_id(
        username: int,
        pokemon_id: Annotated[int, Body()],
        items: list[ItemModel]=None,
        escape: Annotated[float | None, Body()]=answers.POKEMON_ESCAPE_CHANCE,
        composer: Composer = Depends(get_composer)
    ):
    # Attempt to catch a wild pokemon.

    # Exit if no pokeball was used.
    if not items or len([x for x in items if "Ball" in x.name]) == 0:
        raise HTTPException(status_code=400, detail="A PokeBall must be used to attempt to catch a wild pokemon.")


    # Encounter a specific already created Pokemon
    try:
        pokemon: PokemonModel = composer.get_poke_builder().get_pokemon(pokemon_id)
    except requests.HTTPError as e:
        raise HTTPException(status_code=400, detail=f"Unable to locate pokemon: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pokemon was lost to the void: {e}")

    # Check valid Pokemon state. And valid item in payload.
    if pokemon.owner != 0:
        raise HTTPException(status_code=400, detail="Pokemon does not belong to correct owner catalog.")


    # Attempt to catch.
    modifiers = 0
    print(f"Attempting to catch {pokemon.base.name}\nRolling Die...")
    die = random.randint(1, 20)

    # Calculate Modifiers and delete used items.
    for item in items:
        try:
            # Verify Item exists in db.
            item_validation = composer.get_item_builder().get_item(item.id)
            if item_validation.name != item.name:
                raise ValueError

            modifiers += composer.get_poke_builder().modifiers(pokemon, item=item) # Add item modifier
            composer.get_item_builder().delete_item(item) # Delete item after use.
        except requests.HTTPError as e:
            raise HTTPException(status_code=500, detail=f"Item was unable to be deleted: {e}")
        except ValueError:
            raise HTTPException(status_code=400, detail="Item does not belong to owner.")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"{e}")


    print(f"Rolled a d20 and got a ##! {die} + {modifiers} !##")
    if (die + modifiers) >= pokemon.base.catch_rate:
        print("Caught!")
        try:
            composer.get_poke_builder().modify_pokemon(pokemon.id, payload={"owner": username})
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed saving pokemon to pokedex. {e}")

        got_item = None
        if random.random() <= answers.ITEM_RANDOM_CHANCE:
            item: ItemModel = composer.get_item_builder().random_item(tier=1)
            try:
                item.owner = username
                got_item = composer.get_item_builder().save_item(item)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to save got item. {e}")

        return {"msg": "caught", "data": {"roll": die, "mods": modifiers, "item": got_item}}


    # Did not catch. Consequences..
    print(f"Did not catch... Rolling to escape.")
    if random.random() <= escape or die == 1:
        # Run away if rolled escape chance LESS than escape OR
        # Escape chance was modified to be less than lowest percent OR
        # User rolled a NAT 1 RIP
        try:
            composer.get_poke_builder().delete_pokemon(pokemon.id)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Unable to delete pokemon?.. {e}")

        print(f"{pokemon.base.name} ran away...")
        return {"msg": "escaped", "data": {"roll": die, "mods": modifiers}}

    # Try again..
    # increase escape chance by 15 percent.
    return {"msg": "retry", "data": {"roll": die, "mods": modifiers, "escape": escape+.15}}


@router.put("/evolve", tags=["pokemon", "evolve"])
def put_pokemon_evolve(
        username: int, 
        ids: Annotated[list[int], Body()],
        composer: Composer = Depends(get_composer)
    ) -> PokemonModel:

    # Get list of pokemon
    staged: List[PokemonModel] = []
    try:
        for id in ids:
            staged.append(composer.get_poke_builder().get_pokemon(id))
    except requests.HTTPError as e:
        print(str(e))
        raise HTTPException(status_code=500, detail=f"Unable to locate Pokemon: {e}")
    except Exception as e:
        print(str(e))
        raise HTTPException(status_code=500, detail=f"Pokemon was lost to the void: {e}")

    # Verify if valid and evolution.
    if len(set([x.owner for x in staged])) > 1:
        raise HTTPException(status_code=400, detail="Pokemon owners do not match.")
    elif username not in set([x.owner for x in staged]):
        raise HTTPException(status_code=400, detail="You do not own all these pokemon.")
    elif len(set([x.base.dex_id for x in staged])) > 1:
        raise HTTPException(status_code=400, detail="Pokemon base ID's do not match.")
    elif len(staged[0].base.evolutions) == 0:
        raise HTTPException(status_code=400, detail="Pokemon has no evolutions in this Generation.")


    chosen = None
    for each in staged:
        # Choose the shiny one.
        if each.sprite.shiny:
            chosen = each
    pokemon = composer.get_poke_builder().evolve(chosen if chosen else staged[0]) # Evolve chosen OR first pokemon.

    # Release evolved pokemon.
    released = []
    for each in staged:
        composer.get_poke_builder().delete_pokemon(each.id)
        released.append(each.id)

    return pokemon

@router.delete("/flee", tags=["pokemon", "flee"])
def delete_pokemon_flee(
    username: int,
    id: int,
    composer: Composer = Depends(get_composer)
    ):

    print(f"Fleeing pokemon {id}...")
    try:
        pokemon: PokemonModel = composer.get_poke_builder().get_pokemon(id)
    except requests.HTTPError as e:
        raise HTTPException(status_code=400, detail=f"Unable to locate pokemon: {e}")

    if pokemon.owner == 0 or pokemon.owner == username:
        composer.get_poke_builder().delete_pokemon(pokemon.id)
    else:
        raise HTTPException(status_code=400, detail="You do not own this pokemon.")


@router.post("/upgrade", tags=["pokemon", "upgrade"])
def post_pokemon_upgrade(
        username: int,
        pokemon_id: Annotated[int, Body()],
        items: list[ItemModel]=None,
        composer: Composer = Depends(get_composer)
    ):
    
    # Exit if no item was used.
    if not items:
        raise HTTPException(status_code=400, detail="An item must be used to attempt to upgrade a pokemon.")
    
    # Encounter a specific already created Pokemon
    try:
        pokemon: PokemonModel = composer.get_poke_builder().get_pokemon(pokemon_id)
    except requests.HTTPError as e:
        raise HTTPException(status_code=400, detail=f"Unable to locate pokemon: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pokemon was lost to the void: {e}")
    
    # Check valid Pokemon state. And valid item in payload.
    if pokemon.owner != username:
        raise HTTPException(status_code=400, detail="Pokemon does not belong to correct owner catalog.")

    for item in items:
        if item.name == "X Speed":
            composer.get_poke_builder().modify_pokemon(pokemon_id, payload={"speed": [x.value for x in pokemon.stats if x.name == "speed"][0] + 1})
        elif item.name == "HP Up":
            composer.get_poke_builder().modify_pokemon(pokemon_id, payload={"hp": [x.value for x in pokemon.stats if x.name == "hp"][0] + 1})
        elif item.name == "TM Machine":
            kept_move = random.choice(pokemon.moves)
            new_moves = composer.get_poke_builder()._get_valid_moves(pokemon.base)

            composer.get_poke_builder().modify_pokemon(pokemon_id, payload={"moves": [kept_move.id, random.choice(new_moves).id]})
        else:
            pass
