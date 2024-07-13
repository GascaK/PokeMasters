import random
import requests
import json

import pokebase as pb

from interfaces.interface import Pokemon, PokemonBase, Move, Item
from .base_loader import BaseLoader


class PokemonBuilder():
    MIN_HP = 5
    MIN_MOVES = 2
    ITEM_CHANCE = 1
    SHINY_CHANCE = 4096
    MOD_MULTIPLYER = 1.5

    headers={
        'Content-type':'application/json', 
        'Accept':'application/json'
    }

    def __init__(self, base_loader: BaseLoader, db_uri="http://127.0.0.1:5000"):
        self.gens = base_loader.generations
        self.db_uri = db_uri

        # Load Base Loader
        # May take a while..
        self._loader = base_loader

        # Load All Dexs
        self.poke_db = self._loader.POKEDEX
        self.move_db = self._loader.MOVEDEX
        self.item_db = self._loader.ITEMDEX
        self.spatk_db = self._loader.SP_ATK

    def encounter(self, tier=1, _type=None) -> Pokemon:
        print("Creating Pokemon...")

        # Choose Pokemon
        temp = self.poke_db.get_all()
        if _type:
            temp = self.poke_db.get_by_type(temp, _type)

        temp = self.poke_db.get_by_tier(temp, tier)
        base: PokemonBase = self.poke_db.randomize(temp)
        if not base:
            print("No Pokemon found.")
            return

        api_resource = pb.APIResource("pokemon", base.pid)


        # Randomizers
        # HP
        mod = random.random()*self.MOD_MULTIPLYER
        hp = int(base.hp*mod)
        hp  = self.MIN_HP if hp < self.MIN_HP else hp
        hp_mod = hp-base.hp
        # Speed
        mod = random.random()*self.MOD_MULTIPLYER
        speed = int(base.speed*mod)
        speed_mod = speed-base.speed
        # Special
        mod = random.random()*self.MOD_MULTIPLYER
        special = int(base.special*mod)
        special_mod = special-base.special
        # Physical
        mod = random.random()*self.MOD_MULTIPLYER
        physical = int(base.physical*mod)
        physical_mod = physical-base.physical

        # Create Stats
        stats = [
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
        ]


        # Random moves
        moves = self._get_valid_moves(base, include_normal=False if base.tier >= 4 else True)


        # Random items
        items = []
        if random.randrange(0, self.ITEM_CHANCE) == 0:
            items.append(self.get_item())


        # Sprite
        is_shiny = False
        pend_sprite = api_resource.sprites.front_default
        if random.randrange(0, self.SHINY_CHANCE) == 0:
            is_shiny = True
            pend_sprite = api_resource.sprites.front_shiny

        sprite = {
            "url": pend_sprite,
            "is_shiny": is_shiny
        }

        pokemon = Pokemon(base, stats=stats, sprite=sprite, moves=moves, items=items)
        print(pokemon)

        return pokemon

    def evolve(self, base: Pokemon) -> Pokemon:
        # No available evolutions
        if not base or not base.evolutions:
            return None

        print(f"Evolving {base.name} into #{base.evolutions}")

        pid = random.choice(base.evolutions)
        api_resource = pb.APIResource("pokemon", pid)

        temp = self.poke_db.get_by_pid(pid)

        for stat in base.stats:
            if stat["name"] == "hp":
                hp_mod = stat["mod"]
                hp = temp.hp + hp_mod
            elif stat["name"] == "speed":
                speed_mod = stat["mod"]
                speed = temp.speed + speed_mod
            elif stat["name"] == "special":
                special_mod = stat["mod"]
                special = temp.special + special_mod
            elif stat["name"] == "physical":
                physical_mod = stat["mod"]
                physical = temp.physical + physical_mod

        sprite_url = api_resource.sprites.front_default
        if base.sprite.get("shiny"):
            sprite_url = api_resource.sprites.front_shiny
        
        sprite = {
            "url": sprite_url,
            "is_shiny": base.sprite.get("is_shiny", False)
        }

        stats = [
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
        ]

        moves = self._get_valid_moves(base, include_normal=False if base.tier >= 4 else True)

        pokemon = Pokemon(temp, stats=stats, sprite=sprite, moves=moves, items=base.items)
        print(pokemon)

        return pokemon

    def get_item(self, tier=1) -> Item:
        pending_items = self.item_db.get_all()
        pending_items = self.item_db.get_by_tier(pending_items, tier=tier)
        item = self.item_db.randomize(pending_items)

        resp = requests.put(f"{self.db_uri}/items/0", headers=self.headers, data=json.dumps(item.get_datalization()), timeout=30)
        item.id = json.loads(resp.text)["id"]

        return item

    def get_move(self, tier, _type) -> Move:
        pending_moves = self.move_db.get_all()
        pending_moves = self.move_db.get_by_tier(pending_moves, tier=tier)
        pending_moves = self.move_db.get_by_type(pending_moves, _type=_type)
        return self.move_db.randomize(pending_moves)

    def _get_valid_moves(self, base: PokemonBase, include_normal=True) -> list[Move]:
        # Random moves
        count = 0
        moves: list[Move] = []
        valid_types: list = base.types

        if include_normal:
            valid_types.append("normal")

        while count < self.MIN_MOVES:
            count += 1
            valid = True
            chosen_type = random.choice(valid_types)
            temp_move = self.get_move(tier=base.tier, _type=chosen_type)

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
                if random.random()*1000 <= base.special:
                    special = random.choice(self.spatk_db)
                # Add random physical
                if random.random()*1000 <= base.physical:
                    hit = f"{temp_move.hit}+{base.tier}"

                m = Move(
                    tier=temp_move.tier,
                    move_type=temp_move.move_type,
                    name=temp_move.name,
                    hit=hit or temp_move.hit,
                    special="" if not special else special.text
                )

                resp = requests.put(f"{self.db_uri}/moves/0", headers=self.headers, data=json.dumps(m.get_datalization()), timeout=30)
                m.id = json.loads(resp.text)["id"]

                # Add to moves list.
                moves.append(m)

        # Return all moves.
        return moves

    def get_by_pid(self, pid):
        return self._loader.POKEDEX.get_by_pid(pid)
