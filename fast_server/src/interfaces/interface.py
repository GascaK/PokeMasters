import random
import json

from typing import Dict
from .models import ItemModel, PokemonBaseModel, PokemonModel


class PokemonBase():
    pass

class Pokemon():
    pass

class Special():
    def __init__(self, id, name, text):
        self.id = id
        self.name = name
        self.text = text

    def __repr__(self):
        return f"{self.id} {self.name} - {self.text}"

class Move():
    def __init__(self, tier, move_type, name, hit, id=None, special=None):
        self.hit = hit
        self.tier = tier
        self.name = name
        self.move_type = move_type
        self.id: int = id
        self.special: Special = special

    def get_datalization(self):
        return {
            "hit": self.hit,
            "tier": self.tier,
            "name": self.name,
            "special": self.special,
            "move_type": self.move_type
        }
    
    def __repr__(self):
        return f"T{self.tier}: {self.name} - {self.special} {self.hit}"

class Moves():
    def __init__(self, moves: list[Move]):
        self.moves: list[Move] = moves

    def get_all(self):
        return self.moves

    def get_by_id(self, move_id: int):
        for move in self.moves:
            if move.move_id == move_id:
                return move

    def get_by_tier(self, moves: list[Move], tier: int=1):
        selected = []
        for move in moves:
            if move.tier == tier:
                selected.append(move)
        return selected

    def get_by_type(self, moves: list[Move], _type: str):
        selected = []
        for move in moves:
            if move.move_type == _type:
                selected.append(move)
        return selected

    def randomize(self, pokemon_list: list[PokemonBase]):
        if pokemon_list:
            # Return a random from list
            return random.choice(pokemon_list)
        else:
            # If no valid choice return ANY move.
            # in case of unsupported move type.
            return random.choice(self.moves)

class Item():
    def __init__(self, name, cost, text, tier, id=0, owner=-1):
        self.id = id
        self.name = name
        self.cost = cost
        self.text = text
        self.tier = tier
        self.owner = owner
    
    def get_datalization(self):
        return {
            "id": self.id,
            "name": self.name,
            "cost": self.cost,
            "text": self.text,
            "tier": self.tier,
            "owner": self.owner
        }
    
    def __repr__(self):
        return f"{self.id}: t{self.tier} {self.name} - {self.text} ${self.cost}"

class PokeCenter():
    def __init__(self, items):
        self.items: list[ItemModel] = items
    
    def get_all(self):
        return self.items
    
    def get_by_name(self, name: str) -> ItemModel:
        for item in self.items:
            if item.name == name:
                return item
    
    def get_by_id(self, id: int) -> ItemModel:
        for item in self.items:
            if item.id == id:
                return item
    
    def get_by_tier(self, items: list[ItemModel], tier: int=1) -> list[ItemModel]:
        selected = []
        for item in items:
            if item.tier == tier:
                selected.append(item)
        return selected
    
    def randomize(self, items: list[ItemModel]) -> ItemModel:
        try:
            return random.choice(items)
        except IndexError as e:
            print("No values found")

class PokemonBase():
    def __init__(self, dex_id, name, hp, speed, special, physical, tier, types, evolutions, catch_rate, url_shiny, url_default):
        self.dex_id = dex_id
        self.name = name
        self.hp = hp
        self.speed = speed
        self.special = special
        self.physical = physical
        self.tier = tier
        self.types = types
        self.evolutions = evolutions
        self.catch_rate = catch_rate
        self.url_shiny = url_shiny
        self.url_default = url_default
    
    def toJSON(self):
        return json.dumps(
            self,
            default=lambda o: o.__dict__, 
            sort_keys=True
            )

    def __repr__(self):
        return f"{self.dex_id}:{self.name} t[{self.types}]- {self.evolutions}\n\thp:{self.hp} sp:{self.speed} special:{self.special} physical:{self.physical}"

class PokedexBase():
    def __init__(self, pokemon_list: list[PokemonBaseModel|PokemonModel]):
        self._list = pokemon_list

    def get_all(self) -> list[PokemonBaseModel|PokemonModel]:
        return self._list

    def get_by_dex_id(self, dex_id: int) -> PokemonBaseModel|PokemonModel:
        for pokemon in self._list:
            if pokemon.dex_id == dex_id:
                return pokemon

    def get_by_type(self, pokemon_list: list[PokemonBaseModel|PokemonModel], base_type: str) -> list[PokemonBaseModel|PokemonModel]:
        selected = []
        for pokemon in pokemon_list:
            if base_type in pokemon.types:
                selected.append(pokemon)
        return selected

    def get_by_tier(self, pokemon_list: list[PokemonBaseModel|PokemonModel], tier: int) -> list[PokemonBaseModel|PokemonModel]:
        selected = []
        for pokemon in pokemon_list:
            if pokemon.tier == tier:
                selected.append(pokemon)
        return selected

    def randomize(self, pokemon_list: list[PokemonBaseModel|PokemonModel]) -> PokemonBaseModel|PokemonModel:
        if pokemon_list:
            return random.choice(pokemon_list)
        else:
            return None

class Pokemon(PokemonBase):
    def __init__(self, base: PokemonBase,
                 stats: Dict[str:str, str:int],
                 sprite: Dict[str:str, str:int],
                 id: int = 0,
                 owner: int = 0,
                 moves: list[Move]=None,
                 items: list[Item]=None,
                 types: list[str]= None):

        for stat in stats:
            if stat["name"] == "speed":
                speed = stat["value"]
            elif stat["name"] == "hp":
                hp = stat["value"]
            elif stat["name"] == "special":
                special = stat["value"]
            elif stat["name"] == "physical":
                physical = stat["value"]


        self.id: int = id
        self.base: PokemonBase = base
        self.sprite: Dict[str:str, str:int] = sprite
        self.stats: Dict[str:str, str:int] = stats
        self.owner: int = owner
        self.moves: list[Move] = moves
        self.items: list[Item] = items
        self.types: list[str] = base.types
        super().__init__(base.dex_id,
                         base.name,
                         hp,
                         speed,
                         special,
                         physical,
                         base.tier,
                         base.types,
                         base.evolutions,
                         base.catch_rate)


    def get_datalization(self):
        # Format for database.
        for stat in self.stats:
            if stat["name"] == "speed":
                speed = stat["value"]
                speed_mod = stat["mod"]
            elif stat["name"] == "hp":
                hp = stat["value"]
                hp_mod = stat["mod"]
            elif stat["name"] == "special":
                special = stat["value"]
                special_mod = stat["mod"]
            elif stat["name"] == "physical":
                physical = stat["value"]
                physical_mod = stat["mod"]

        return {
            "id": self.id,
            "dex_id": self.base.dex_id,
            "owner": self.owner,
            "name": self.base.name,
            "tier": self.base.tier,
            "stats": [
                {
                    "name": "hp",
                    "value": hp,
                    "mod": hp_mod
                },
                {
                    "name": "speed",
                    "value": speed,
                    "mod": speed_mod
                },
                {
                    "name": "special",
                    "value": special,
                    "mod": special_mod
                },
                {
                    "name": "physical",
                    "value": physical,
                    "mod": physical_mod
                }
            ],
            "moves": [x.id for x in self.moves],
            "catch_rate": self.catch_rate,
            "shiny": self.sprite["shiny"],
            "sprite_url": self.sprite["sprite_url"],
            "type1": self.base.types[0],
            "type2": self.base.types[1]
        }

    def __repr__(self):
        for stat in self.stats:
            if stat["name"] == "hp":
                hp_mod = stat["mod"]
                hp = stat["value"]
            elif stat["name"] == "speed":
                speed_mod = stat["mod"]
                speed = stat["value"]
            elif stat["name"] == "special":
                special = stat["value"]
            elif stat["name"] == "physical":
                physical = stat["value"]

        return f"{"**" if self.sprite.get("shiny") else ""}{self.dex_id}:{self.name} {self.base.types} - {self.evolutions}\n\t{hp_mod} hp:{hp} {speed_mod} sp:{speed} special:{special} physical:{physical}\n\t{self.moves}\n\t{self.items}"

class Player():
    def __init__(self, name: int, id: int=0, badges: int=0, dollars: int=0):
        self.id = id
        self.name = name
        self.badges = badges
        self.dollars = dollars

    def get_datalization(self):
        return {
            "id": self.id,
            "name": self.name,
            "badges": self.badges,
            "dollars": self.dollars
        }
