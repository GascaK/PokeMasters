import random
import math
import requests
import json

from ..interfaces.models import \
    PokemonModel, PokemonBaseModel, SpriteModel, StatsModel, MoveModel, SpecialModel, ItemModel
from .base_loader import BaseLoader


class PokemonBuilder():
    MIN_MOVES = 2
    ITEM_CHANCE = 1/5
    SHINY_CHANCE = 1/2048
    SHINY_CHARM_CHANCE = SHINY_CHANCE * 4
    MOD_MULTIPLYER = 1.150

    headers={
        'Content-type':'application/json', 
        'Accept':'application/json'
    }

    def __init__(self, base_loader: BaseLoader, db_uri="http://poke-db:5000"):
        self.db_uri = db_uri

        # Load Base Loader
        # May take a while..
        self._loader = base_loader

        # Load All Dexs
        self.poke_db = self._loader.POKEDEX
        self.move_db = self._loader.MOVEDEX
        self.item_db = self._loader.POKECENTER
        self.spatk_db = self._loader.SP_ATK


    def random_encounter(self, dex_id=None, tier=1, _type: str=None, items: list[ItemModel]=[]) -> PokemonModel:
        print("Creating Pokemon...")
        print(items)

        # Choose Pokemon
        if dex_id:
            temp = self.poke_db.get_by_dex_id(dex_id)
        elif _type:
            temp = self.poke_db.get_by_type(self.poke_db.get_all(), _type)
            temp = self.poke_db.get_by_tier(self.poke_db.get_all(), tier)
        else:
            temp = self.poke_db.get_by_tier(self.poke_db.get_all(), tier)

        base: PokemonBaseModel = temp if type(temp) != list else self.poke_db.randomize(temp)
        if not base:
            print("No Pokemon found.")
            return

        # Randomizers

        # HP
        match base.tier:
            case 4:
                hp_min = 20
                hp_max = 30
            case 3:
                hp_min = 12
                hp_max = 25
            case 2:
                hp_min = 8
                hp_max = 18
            case 1:
                hp_min = 4
                hp_max = 12
            case _:
                raise Exception(msg="No valid tier found.")

        hp = random.randint(hp_min, hp_max)
        hp_mod = hp-base.hp

        # Speed
        speed = base.speed + random.randint(-3, 3)
        speed_mod = speed-base.speed

        # Special
        special = random.randint(0, base.special)
        special_mod = special-base.special

        # Physical
        physical = random.randint(0, base.physical)
        physical_mod = physical-base.physical

        # Create Stats
        stats = [
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
        ]


        # Random moves
        moves = self._get_valid_moves(base)


        chance = self.SHINY_CHANCE
        for item in items:
            print(item.name)
            if item.name == "Shiny Charm":
                chance = self.SHINY_CHARM_CHANCE

        # Sprite
        if random.random() <= chance:
            shiny = True
            pend_sprite = base.url_shiny
        else:
            shiny = False
            pend_sprite = base.url_default

        sprite = {
            "sprite_url": pend_sprite,
            "shiny": shiny
        }

        pokemon = PokemonModel(base=base, stats=stats, sprite=sprite, moves=moves, items=[])
        return pokemon

    def evolve(self, pokemon: PokemonModel) -> PokemonModel:
        if not pokemon or not pokemon.base.evolutions:
            # No available evolutions
            raise AssertionError

        print(f"Evolving {pokemon.base.name} into #{pokemon.base.evolutions}")
        pid = random.choice(pokemon.base.evolutions)
        temp: PokemonBaseModel = self.poke_db.get_by_dex_id(pid)

        for stat in pokemon.stats:
            if stat.name == "hp":
                hp_mod = stat.mod + random.randint(1, 7)
                hp = temp.hp + hp_mod
            elif stat.name == "speed":
                speed_mod = stat.mod + random.randint(1, 3)
                speed = temp.speed + speed_mod
            elif stat.name == "special":
                special_mod = stat.mod + random.randint(50, 200)
                special = temp.special + special_mod
            elif stat.name == "physical":
                physical_mod = stat.mod + random.randint(50, 200)
                physical = temp.physical + physical_mod

        
        sprite = {
            "sprite_url": temp.url_shiny if pokemon.sprite.shiny else temp.url_default,
            "shiny": pokemon.sprite.shiny
        }

        stats = [
            {
                "name": "hp",
                "value": hp,
                "mod": hp_mod,
                "current_value": hp
            },
            {
                "name": "speed",
                "value": speed,
                "mod": speed_mod,
                "current_value": speed
            },
            {
                "name": "special",
                "value": special,
                "mod": special_mod,
                "current_value": special
            },
            {
                "name": "physical",
                "value": physical,
                "mod": physical_mod,
                "current_value": physical
            }
        ]

        moves = self._get_valid_moves(temp)

        p = PokemonModel(base=temp, owner=pokemon.owner, stats=stats, sprite=sprite, moves=moves, items=pokemon.items)
        return self.save_pokemon(p, owner=pokemon.owner)

    def build_pokemon(self, data: dict) -> PokemonModel:
        try:
            print(data)
            base_data = self.poke_db.get_by_dex_id(data.get("dex_id"))
            moves = [self.get_move(x) for x in data["moves"]]

            return PokemonModel(
                id=data["id"],
                owner=data["owner"],
                items=[],
                base=PokemonBaseModel(
                    dex_id = base_data.dex_id,
                    name = base_data.name,
                    hp = base_data.hp,
                    tier = base_data.tier,
                    types = base_data.types,
                    speed = base_data.speed,
                    special = base_data.special,
                    physical = base_data.physical,
                    evolutions = base_data.evolutions,
                    catch_rate = base_data.catch_rate,
                    url_shiny = base_data.url_shiny,
                    url_default = base_data.url_default
                ),
                sprite=SpriteModel(
                    shiny = data["shiny"],
                    sprite_url = data["sprite_url"]
                ),
                stats=[
                    StatsModel(
                        name =  x["name"],
                        mod =   x["mod"],
                        value = x["value"]
                    ) for x in data["stats"]
                ],
                moves=moves
            )
        except Exception as e:
            print("now here", e)
            raise e

    def get_random_move(self, tier, _type) -> MoveModel:
        pending_moves = self.move_db.get_all()
        pending_moves = self.move_db.get_by_tier(pending_moves, tier=tier)
        pending_moves = self.move_db.get_by_type(pending_moves, _type=_type)
        return self.move_db.randomize(pending_moves)
    
    def get_move(self, id: int) -> MoveModel:
        try:
            r = requests.get(f"{self.db_uri}/moves/{id}",
                headers=self.headers,
                timeout=5)
            move: dict = r.json()


            special = None
            if move.get("special"):
                r = requests.get(f"{self.db_uri}/specials/{move["special"]}",
                    headers=self.headers,
                    timeout=5)
                special: dict = r.json()

            return MoveModel(
                id=move["id"],
                name=move["name"],
                tier=move["tier"],
                move_type=move["move_type"],
                special=special,
                hit=move["hit"]
            )
        except Exception as e:
            raise e

    def _get_valid_moves(self, base: PokemonBaseModel) -> list[MoveModel]:
        # Random moves
        count = 0
        moves: list[MoveModel] = []
        valid_types: list[str] = base.types

        while count < self.MIN_MOVES:
            count += 1
            valid = True
            chosen_type = random.choice(valid_types)
            temp_move = self.get_random_move(tier=base.tier, _type=chosen_type)

            # Retry if move already chosen.
            for pending_move in moves:
                if not temp_move or temp_move.id == pending_move.id:
                    count -= 1
                    valid = False
                    continue

            # Add valid move
            if valid:
                hit = None
                special = None

                # Add random special
                if random.randint(1, 500) <= base.special:
                    special: SpecialModel = random.choice(self.spatk_db)
                # Add random physical
                if random.randint(1, 500) <= base.physical:
                    hit = f"{temp_move.hit}+{base.tier}"

                m = MoveModel(
                    tier=temp_move.tier,
                    move_type=temp_move.move_type,
                    name=temp_move.name,
                    hit=hit or temp_move.hit,
                    special=special
                )

                # Save Move
                resp = requests.put(f"{self.db_uri}/moves/0", headers=self.headers, json=m.model_dump_json(), timeout=30)
                m.id = json.loads(resp.text)["id"]

                # Add to moves list.
                moves.append(m)

        # Return all moves.
        return moves

    def modifiers(self, pokemon: PokemonModel, item: ItemModel, escape=0.15) -> int:
        for stat in pokemon.stats:
            if stat.name == "hp":
                hp = stat.value
            elif stat.name == "speed":
                speed = stat.value

        return {
            "Poke Ball": 0,
            "Great Ball": 1,
            "Ultra Ball": 2,
            "Master Ball": 99,
            "Repeat Ball": (escape / .15) - 1,
            "Joker Ball": random.choice([5, -5]),
            "Heavy Ball": 3 if speed < 0 else 0,
            "Quick Ball": 3 if speed >= 3 else 0,
            "Heal Ball":  3 if hp >= 15 else 0,
            "Level Ball": 3 if pokemon.base.tier >= 2 else 0
        }.get(item.name, 0)

    def save_pokemon(self, pokemon: PokemonModel, owner: int=0) -> PokemonModel:
        try:
            r = requests.put(f"{self.db_uri}/pokemon/{owner}",
                json=pokemon.model_dump_json(),
                headers=self.headers,
                timeout=30)
            r.raise_for_status()
            print("saved", r.json())
            return self.build_pokemon(r.json())
        except Exception as e:
            print(e)
            raise e

    def get_pokemon(self, id: int) -> PokemonModel:
        try:
            r = requests.get(f"{self.db_uri}/pokemon/{id}",
                             headers=self.headers,
                             timeout=30)
            r.raise_for_status()
            return self.build_pokemon(r.json())
        except Exception as e:
            print(e)
            raise e

    def modify_pokemon(self, id: int, payload: dict = {}) -> PokemonModel:
        try:
            r = requests.patch(f"{self.db_uri}/pokemon/{id}",
                               json=json.dumps(payload),
                               headers=self.headers,
                               timeout=30)
            r.raise_for_status()
            return self.build_pokemon(r.json())
        except Exception as e:
            print(e)
            raise e

    def delete_pokemon(self, id: int) -> None:
        try:
            r = requests.delete(f"{self.db_uri}/pokemon/{id}",
                             headers=self.headers,
                             timeout=30)
            return r.json()
        except Exception as e:
            print(e)
            raise e

    def get_by_dex_id(self, dex_id):
        return self._loader.POKEDEX.get_by_dex_id(dex_id)
