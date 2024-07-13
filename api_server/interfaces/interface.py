import random

from typing import Dict


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
    def __init__(self, name, cost, text, tier, id=None, trainer=-1):
        self.id = id
        self.name = name
        self.cost = cost
        self.text = text
        self.tier = tier
        self.trainer = trainer
    
    def get_datalization(self):
        return {
            "name": self.name,
            "cost": self.cost,
            "text": self.text,
            "tier": self.tier
        }
    
    def __repr__(self):
        return f"{self.id}: t{self.tier} {self.name} - {self.text} ${self.cost}"

class Items():
    def __init__(self, items):
        self.items: list[Item] = items
    
    def get_all(self):
        return self.items
    
    def get_by_id(self, id: int) -> Item:
        for item in self.items:
            if item.id == id:
                return item
    
    def get_by_tier(self, items, tier: int=1) -> list[Item]:
        selected = []
        for item in items:
            if item.tier == tier:
                selected.append(item)
        return selected
    
    def randomize(self, items) -> Item:
        try:
            return random.choice(items)
        except IndexError as e:
            print("No values found")

class PokemonBase():
    def __init__(self, pid, name, hp, speed, special, physical, tier, types, evolutions, catch_rate):
        self.pid = pid
        self.name = name
        self.hp = hp
        self.speed = speed
        self.special = special
        self.physical = physical
        self.tier = tier
        self.types = types
        self.evolutions = evolutions
        self.catch_rate = catch_rate

    def __repr__(self):
        return f"{self.pid}:{self.name} - {self.evolutions}\n\thp:{self.hp} sp:{self.speed} special:{self.special} physical:{self.physical}"

class PokedexBase():
    def __init__(self, pokemon_list: list[PokemonBase|Pokemon]):
        self._list = pokemon_list

    def get_all(self) -> list[PokemonBase|Pokemon]:
        return self._list

    def get_by_pid(self, pid: int) -> PokemonBase|Pokemon:
        for pokemon in self._list:
            if pokemon.pid == pid:
                return pokemon

    def get_by_type(self, pokemon_list: list[PokemonBase|Pokemon], base_type: str) -> list[PokemonBase|Pokemon]:
        selected = []
        for pokemon in pokemon_list:
            if base_type in pokemon.base_type:
                selected.append(pokemon)
        return selected

    def get_by_tier(self, pokemon_list: list[PokemonBase|Pokemon], tier: int) -> list[PokemonBase|Pokemon]:
        selected = []
        for pokemon in pokemon_list:
            if pokemon.tier == tier:
                selected.append(pokemon)
        return selected

    def randomize(self, pokemon_list: list[PokemonBase|Pokemon]) -> PokemonBase|Pokemon:
        if pokemon_list:
            return random.choice(pokemon_list)
        else:
            return None

class Pokemon(PokemonBase):
    def __init__(self, base: PokemonBase,
                 stats: Dict[str:str, str:int],
                 sprite: Dict[str:str, str:int],
                 trainer: int=0,
                 moves: list[Move]=None,
                 items: list[Item]=None):

        for stat in stats:
            if stat["name"] == "speed":
                speed = stat["base_stat"]
            elif stat["name"] == "hp":
                hp = stat["base_stat"]
            elif stat["name"] == "special":
                special = stat["base_stat"]
            elif stat["name"] == "physical":
                physical = stat["base_stat"]

        self.base: PokemonBase = base
        self.sprite: Dict[str:str, str:int] = sprite
        self.stats: Dict[str:str, str:int] = stats
        self.trainer: int = trainer
        self.moves: list[Move] = moves
        self.items: list[Item] = items
        super().__init__(base.pid,
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
        for stat in self.stats:
            if stat["name"] == "speed":
                speed = stat["base_stat"]
                speed_mod = stat["mod"]
            elif stat["name"] == "hp":
                hp = stat["base_stat"]
                hp_mod = stat["mod"]
            elif stat["name"] == "special":
                special = stat["base_stat"]
                special_mod = stat["mod"]
            elif stat["name"] == "physical":
                physical = stat["base_stat"]
                physical_mod = stat["mod"]

        return {
            "id": self.base.pid,
            "trainer": self.trainer,
            "name": self.base.name,
            "tier": self.base.tier,
            "stats": [
                {
                    "name": "hp",
                    "base_stat": hp,
                    "mod": hp_mod,
                    "current_value": hp
                },
                {
                    "name": "speed",
                    "base_stat": speed,
                    "mod": speed_mod,
                    "current_value": speed
                },
                {
                    "name": "special",
                    "base_stat": special,
                    "mod": special_mod,
                    "current_value": special
                },
                {
                    "name": "physical",
                    "base_stat": physical,
                    "mod": physical_mod,
                    "current_value": physical
                }
            ],
            "moves": [
                {
                    "id": self.moves[0].id
                },
                {
                    "id": self.moves[1].id
                }
            ],
            "items": [
                {
                    "id": self.items[0].id
                }
            ],
            "shiny": self.sprite["is_shiny"],
            "sprite_url": self.sprite["url"],
            "type1": self.base.types[0],
            "type2": self.base.types[1]
        }

    def __repr__(self):
        for stat in self.stats:
            if stat["name"] == "hp":
                hp_mod = stat["mod"]
                hp = stat["base_stat"]
            elif stat["name"] == "speed":
                speed_mod = stat["mod"]
                speed = stat["base_stat"]
            elif stat["name"] == "special":
                special = stat["base_stat"]
            elif stat["name"] == "physical":
                physical = stat["base_stat"]

        return f"{"**" if self.sprite.get("is_shiny") else ""}{self.pid}:{self.name} - {self.evolutions}\n\t{hp_mod} hp:{hp} {speed_mod} sp:{speed} special:{special} physical:{physical}\n\t{self.moves}\n\t{self.items}"
