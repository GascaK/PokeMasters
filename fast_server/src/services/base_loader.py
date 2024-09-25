import math
import random
import requests
import os
import json

from typing import List

import pokebase as pb

from ..interfaces.interface import PokemonBase, PokedexBase, Move, Moves, Special, Item, PokeCenter
from ..interfaces.models import ItemModel


class BaseLoader():
    FILE_LOC = os.path.join(os.path.abspath(os.path.join(__file__ ,"../..")), "assets")

    POKEDEX: PokedexBase = None
    MOVEDEX: Moves = None
    POKECENTER: PokeCenter = None
    SP_ATK: list[Special] = []

    # Variables
    CATCH_RATE_T1 = 7
    CATCH_RATE_T2 = 11
    CATCH_RATE_T3 = 16
    CATCH_RATE_T4 = 20

    LEVEL_1_MAX_EXP = 75
    LEVEL_2_MAX_EXP = 150
    LEVEL_3_MAX_EXP = None
    LEVEL_4_MAX_EXP = None

    TYPE_MAX = 2
    HP_DIVISOR = 4

    SP_DIVISOR = 10
    SP_BASE_LN = 80

    def __init__(self, generations: list[int]=[]):
        self.generations = self.update_generations(generations)
        self.load_moves()
        self.load_special_moves()
        self.load_items()

        # Load Cache
        try:
            with open("cache/pokedex.json") as file:
                data = json.load(file)
                dex = []
                for mon in [json.loads(x) for x in data["cache"]]:
                    dex.append(PokemonBase(
                        dex_id=mon.get("dex_id"),
                        name=mon.get("name"),
                        hp=mon.get("hp"),
                        speed=mon.get("speed"),
                        special=mon.get("special"),
                        physical=mon.get("physical"),
                        tier=mon.get("tier"),
                        types=mon.get("types"),
                        evolutions=mon.get("evolutions"),
                        catch_rate=mon.get("catch_rate"),
                    ))
                self.POKEDEX = PokedexBase(dex)
        except Exception as e:
                print(e)
                self.load_pokemon()

    def get_generations(self):
        return self.generations

    def update_generations(self, generations: list[int]):
        base = []
        if not generations:
            x = range(1, 4)
            for y in x:
                base.append(y)
        if 1 in generations:
            print("Loading Generation 1 into que...")
            x = range(1, 151+1)
            for y in x:
                base.append(y)
        if 2 in generations:
            print("Loading Generation 2 into que...")
            x = range(152, 251)
            for y in x:
                base.append(y)
        return base
    
    def get_dex(self):
        return self.POKEDEX

    def set_dex(self, pokedex):
        self.POKEDEX = pokedex

    def load_pokemon(self):
        def pull_chain(node: dict):
            # Go through evolution tree recursively
            nonlocal evolutions
            if node.get("species", {}).get("name") == base.name:
                for evolve in node.get("evolves_to"):
                    evolve_pid = int(evolve["species"]["url"].split("/")[-2])
                    if evolve_pid in self.get_generations():
                        evolutions.append(evolve_pid)

            for each in node["evolves_to"]:
                pull_chain(each)

        pokedex: List[PokemonBase] = []
        for pid in self.get_generations():
            print(f"\n\n***Loading Pokemon PID: {pid}***")
            base = pb.APIResource("pokemon", pid)
            print(f"\tloading {base.name} base info...")
            species = pb.APIResource("pokemon-species", pid)


            # Calculate Tier
            tier = 1
            if species.is_legendary or species.is_mythical:
                tier = 4
                catch_rate = self.CATCH_RATE_T4
            elif 0 <= base.base_experience <= self.LEVEL_1_MAX_EXP:
                tier = 1
                catch_rate = self.CATCH_RATE_T1
            elif self.LEVEL_1_MAX_EXP < base.base_experience <= self.LEVEL_2_MAX_EXP:
                tier = 2
                catch_rate = self.CATCH_RATE_T2
            elif self.LEVEL_2_MAX_EXP < base.base_experience <= (self.LEVEL_3_MAX_EXP or 99999):
                tier = 3
                catch_rate = self.CATCH_RATE_T3
            elif self.LEVEL_3_MAX_EXP < base.base_experience <= (self.LEVEL_4_MAX_EXP or 99999):
                tier = 4
                catch_rate = self.CATCH_RATE_T4
            print(f"\t\ttier: {tier}")
            print(f"\t\tcatch_rate: {catch_rate}")


            # Calculate Stats
            special = 0
            physical = 0
            for stat in base.stats:
                name = stat.stat.name
                if name == "hp":
                    hp = math.ceil(stat.base_stat / self.HP_DIVISOR)
                elif name == "speed":
                    speed = math.ceil((stat.base_stat - self.SP_BASE_LN) / self.SP_DIVISOR)
                elif name == "attack" or name == "defense":
                    physical += math.ceil(stat.base_stat)
                elif name == "special-attack" or name == "special-defense":
                    special += math.ceil(stat.base_stat)
            print(f"\t\thp: {hp}")
            print(f"\t\tspeed: {speed}")
            print(f"\t\tspecial: {special}")
            print(f"\t\tphysical: {physical}")


            # Calculate Types
            types = []
            for type_ in base.types:
                types.append(type_.type.name)
            if len(types) > self.TYPE_MAX:
                types = random.sample(types, self.TYPE_MAX)
            print(f"\ttypes: {types}")
            
            
            # Calculate Evolution Tree
            print(f"\tloading {base.name} evolution info...")
            chain_id = species.evolution_chain.url.split("/")[-2]
            resp = requests.get(f"http://pokeapi.co/api/v2/evolution-chain/{chain_id}", timeout=30)
            evo_chain = json.loads(resp.content)

            evolutions = []
            node = evo_chain["chain"]
            pull_chain(node)
            print(f"\t\t{base.name} evolves into {evolutions}")


            # Pend to Dex
            pokedex.append(PokemonBase(
                dex_id = pid,
                name = base.name,
                hp = hp,
                speed = speed,
                special = special,
                physical = physical,
                tier = tier,
                types = types,
                evolutions = evolutions,
                catch_rate = catch_rate
            ))

        # Create pokedex cache
        with open("cache/pokedex.json", "w") as file:
            json.dump({"cache": [x.toJSON() for x in pokedex]}, file)

        # Set Pokedex
        self.POKEDEX = PokedexBase(pokedex)

    def load_items(self):
        with open(self.FILE_LOC + "/items.json", "r", encoding="utf-8") as file:
            data = json.load(file)

        temp: list[ItemModel] = []
        for item in data["items"]:
            temp.append(ItemModel(
                name = item["name"],
                cost = item["cost"],
                text = item["text"],
                tier = item["tier"]
            ))
        self.POKECENTER = PokeCenter(temp)

    def load_special_moves(self):
        with open(self.FILE_LOC + "/specials.json", "r", encoding="utf-8") as file:
            data = json.load(file)

        for special in data["specials"]:
            self.SP_ATK.append(Special(
                id=special["id"],
                name=special["name"],
                text=special["text"]
            ))
    
    def load_moves(self):
        data = None
        with open(self.FILE_LOC + "/movelist.json", "r", encoding="utf-8") as file:
            data = json.load(file)

        # Collate all moves
        pending_moves = []
        for tier_lvl, type_moves in data.items():
            for current_type, move_list in type_moves.items():
                for move in move_list:
                    pending_moves.append(Move(
                        tier=int(tier_lvl.split("_")[-1]),
                        move_type=current_type,
                        name=move["name"],
                        hit=move["hit"]
                    ))

        # Save moves
        self.MOVEDEX = Moves(pending_moves)
