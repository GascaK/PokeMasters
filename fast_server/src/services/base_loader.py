import math
import random
import requests
import os
import json

from typing import List, Dict

import pokebase as pb

from ..interfaces.interface import PokemonBase, PokedexBase, Move, Moves, Special, Item, PokeCenter
from ..interfaces.models import ItemModel, PokemonBaseModel, SpecialModel


class BaseLoader():
    FILE_LOC = os.path.join(os.path.abspath(os.path.join(__file__ ,"../..")), "assets")
    headers={
        'Content-type':'application/json', 
        'Accept':'application/json'
    }

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

    SP_DIVISOR = 8
    SP_BASE_LN = 50
    
    # Generation ranges
    GENERATION_RANGES = {
        1: (1, 151),      # Gen 1: 1-151 (Kanto)
        2: (152, 251),    # Gen 2: 152-251 (Johto)
        3: (252, 386),    # Gen 3: 252-386 (Hoenn)
        4: (387, 493),    # Gen 4: 387-493 (Sinnoh)
        5: (494, 649),    # Gen 5: 494-649 (Unova)
        6: (650, 721),    # Gen 6: 650-721 (Kalos)
        7: (722, 809),    # Gen 7: 722-809 (Alola)
        8: (810, 905),    # Gen 8: 810-905 (Galar)
        9: (906, 1025)    # Gen 9: 906-1025 (Paldea)
    }

    def __init__(self, generations: list[int]=[], db_uri="http://poke-db:5000"):
        self.cache_loc = "cache/pokedex.json"
        self.generations = generations if generations else [1]  # Default to Gen 1 if none specified
        self.db_uri = db_uri
        self.dex_list = self.update_generations(self.generations)
        self.load_moves()
        self.load_special_moves()
        self.load_items()

        # Load Cache
        self.load_cached_pokemon()

    def get_generations(self):
        return self.generations
    
    def get_dex_list(self):
        return self.dex_list

    def update_generations(self, generations: list[int]):
        base = []
        if not generations:
            # Default to Gen 1 if no generations specified
            generations = [1]
            
        for gen in generations:
            if gen in self.GENERATION_RANGES:
                start, end = self.GENERATION_RANGES[gen]
                print(f"Loading Generation {gen} into queue (Pokemon #{start}-{end})...")
                for pid in range(start, end + 1):
                    base.append(pid)
        
        return base
    
    def get_dex(self):
        return self.POKEDEX

    def set_dex(self, pokedex):
        self.POKEDEX = pokedex

    def load_cached_pokemon(self):
        """
        Load Pokemon data from cache file with improved handling for the actual format:
        {"cache": [pokemon_dict, pokemon_dict, ...]}
        """
        try:
            # Check if cache file exists
            if not os.path.exists(self.cache_loc):
                print(f"Cache file not found: {self.cache_loc}")
                self.load_pokemon(self.generations)
                return
                
            with open(self.cache_loc, "r") as file:
                file_content = file.read()
                if not file_content.strip():
                    print("Cache file is empty")
                    self.load_pokemon(self.generations)
                    return
                    
                # Parse the JSON data
                try:
                    cache_data = json.loads(file_content)
                except json.JSONDecodeError as e:
                    print(f"Cache JSON decode error: {e}")
                    self._backup_invalid_cache()
                    self.load_pokemon(self.generations)
                    return
                    
                # Check if the cache has the expected structure
                if not isinstance(cache_data, dict) or "cache" not in cache_data or not isinstance(cache_data["cache"], list):
                    print("Cache file has invalid structure")
                    self.load_pokemon(self.generations)
                    return
                    
                # Extract cached Pokemon
                cached_pokemon = cache_data["cache"]
                if not cached_pokemon:
                    print("Cache is empty")
                    self.load_pokemon(self.generations)
                    return
                    
                print(f"Found {len(cached_pokemon)} Pokemon in cache")
                
                # Create a mapping of Pokémon by generation for quick lookup
                gen_ranges = {gen: range(start, end + 1) for gen, (start, end) in self.GENERATION_RANGES.items()}
                pokemon_by_generation = {gen: [] for gen in self.generations}
                
                # Sort each Pokemon into its respective generation
                for pokemon_data in cached_pokemon:
                    dex_id = pokemon_data.get("dex_id")
                    if dex_id is None:
                        continue
                        
                    # Find which generation this Pokemon belongs to
                    for gen, id_range in gen_ranges.items():
                        if dex_id in id_range and gen in self.generations:
                            pokemon_by_generation[gen].append(pokemon_data)
                            break
                
                # Check which generations need to be loaded
                missing_gens = []
                for gen in self.generations:
                    gen_range = gen_ranges.get(gen)
                    if gen_range:
                        expected_count = len(gen_range)
                        actual_count = len(pokemon_by_generation[gen])
                        
                        if actual_count < expected_count * 0.9:  # Allow for 10% missing Pokemon as tolerance
                            missing_gens.append(gen)
                            print(f"Generation {gen} incomplete in cache: found {actual_count}/{expected_count} Pokemon")
                        else:
                            print(f"Generation {gen} sufficiently complete: {actual_count}/{expected_count} Pokemon")
                    else:
                        missing_gens.append(gen)
                
                # Load missing generations
                if missing_gens:
                    print(f"Loading missing generations: {missing_gens}")
                    self.load_pokemon(missing_gens)
                    # After loading, we need to re-read the cache to get the updated data
                    with open(self.cache_loc, "r") as updated_file:
                        updated_content = updated_file.read()
                        updated_data = json.loads(updated_content)
                        if "cache" in updated_data:
                            cached_pokemon = updated_data["cache"]
                
                # Now create Pokemon models from all cached data
                dex = []
                for pokemon_data in cached_pokemon:
                    # Check if this Pokemon is in one of our requested generations
                    dex_id = pokemon_data.get("dex_id")
                    if dex_id is None:
                        continue
                        
                    for gen, id_range in gen_ranges.items():
                        if gen in self.generations and dex_id in id_range:
                            # Create Pokemon model
                            dex.append(PokemonBaseModel(
                                dex_id=pokemon_data.get("dex_id"),
                                name=pokemon_data.get("name"),
                                hp=pokemon_data.get("hp"),
                                speed=pokemon_data.get("speed"),
                                special=pokemon_data.get("special"),
                                physical=pokemon_data.get("physical"),
                                tier=pokemon_data.get("tier"),
                                types=pokemon_data.get("types", []),
                                evolutions=pokemon_data.get("evolutions", []),
                                catch_rate=pokemon_data.get("catch_rate"),
                                url_shiny=pokemon_data.get("url_shiny"),
                                url_default=pokemon_data.get("url_default")
                            ))
                            break
                
                if dex:
                    print(f"Successfully loaded {len(dex)} Pokemon from cache")
                    self.POKEDEX = PokedexBase(dex)
                else:
                    print("No Pokemon loaded from cache")
                    self.load_pokemon(self.generations)
                    
        except Exception as e:
            print(f"Unexpected cache load error: {e}")
            self.load_pokemon(self.generations)

    def _backup_invalid_cache(self):
        """Helper method to back up invalid cache files"""
        if not os.path.exists(self.cache_loc):
            return
            
        backup_path = f"{self.cache_loc}.backup"
        try:
            os.rename(self.cache_loc, backup_path)
            print(f"Backed up invalid cache to {backup_path}")
        except Exception as backup_error:
            print(f"Failed to back up invalid cache: {backup_error}")

    def load_pokemon(self, generations_to_load=None):
        """
        Load Pokemon data from the API for specified generations
        and update the cache with the new data.
        """
        # If no generations specified, load all requested generations
        if generations_to_load is None:
            generations_to_load = self.generations
                
        print(f"Loading Pokémon data for generations: {generations_to_load}")
                
        # Load existing cache if it exists
        cache_data = {"cache": []}
        try:
            if os.path.exists(self.cache_loc):
                with open(self.cache_loc, "r") as file:
                    file_content = file.read()
                    if file_content.strip():  # Check if file is not empty
                        data = json.loads(file_content)
                        if "cache" in data and isinstance(data["cache"], list):
                            cache_data = data
                            print(f"Loaded existing cache with {len(data['cache'])} Pokemon")
                        else:
                            print("Cache file has invalid structure, starting with empty cache")
        except (FileNotFoundError, json.JSONDecodeError) as e:
            print(f"Error loading existing cache: {e}")
                
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(self.cache_loc), exist_ok=True)
                
        # Create lookup dictionary for existing Pokemon to avoid duplicates
        existing_pokemon_dict = {pokemon.get("dex_id"): pokemon for pokemon in cache_data["cache"] if "dex_id" in pokemon}
        
        # Process each generation
        all_pokemon = []
        for gen in generations_to_load:
            print(f"\n\nLoading Generation {gen} Pokémon data...")
            start, end = self.GENERATION_RANGES.get(gen, (1, 151))  # Default to Gen 1 range
            
            for pid in range(start, end + 1):
                # Skip if Pokemon already exists in cache
                if pid in existing_pokemon_dict:
                    print(f"Pokemon #{pid} already in cache, skipping")
                    pokemon_model = PokemonBaseModel(**existing_pokemon_dict[pid])
                    all_pokemon.append(pokemon_model)
                    continue
                    
                print(f"***Loading Pokemon PID: {pid} (Generation {gen})***")
                try:
                    base = pb.APIResource("pokemon", pid)
                    print(f"\tloading {base.name} base info...")
                    species = pb.APIResource("pokemon-species", pid)

                    # Calculate Tier
                    tier = 1
                    if hasattr(species, 'is_legendary') and species.is_legendary or \
                    hasattr(species, 'is_mythical') and species.is_mythical:
                        tier = 4
                        catch_rate = self.CATCH_RATE_T4
                    elif hasattr(base, 'base_experience') and base.base_experience is not None:
                        if 0 <= base.base_experience <= self.LEVEL_1_MAX_EXP:
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
                        else:
                            # Default case
                            tier = 1
                            catch_rate = self.CATCH_RATE_T1
                    else:
                        # Default if base_experience is None
                        tier = 1
                        catch_rate = self.CATCH_RATE_T1
                        
                    print(f"\t\ttier: {tier}")
                    print(f"\t\tcatch_rate: {catch_rate}")

                    # Calculate Stats
                    special = 0
                    physical = 0
                    hp = 10  # Default value
                    speed = 5  # Default value
                    
                    if hasattr(base, 'stats'):
                        for stat in base.stats:
                            name = stat.stat.name
                            if name == "hp":
                                hp = max(1, math.ceil(stat.base_stat / self.HP_DIVISOR))
                            elif name == "speed":
                                speed = max(1, math.ceil((stat.base_stat - self.SP_BASE_LN) / self.SP_DIVISOR))
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
                    if hasattr(base, 'types'):
                        for type_ in base.types:
                            types.append(type_.type.name)
                        if len(types) > self.TYPE_MAX:
                            types = random.sample(types, self.TYPE_MAX)
                    if not types:  # Default type if none found
                        types = ["normal"]
                    print(f"\ttypes: {types}")
                    
                    # Calculate Evolution Tree
                    evolutions = []
                    try:
                        print(f"\tloading {base.name} evolution info...")
                        if hasattr(species, 'evolution_chain') and species.evolution_chain:
                            chain_id = species.evolution_chain.url.split("/")[-2]
                            resp = requests.get(f"http://pokeapi.co/api/v2/evolution-chain/{chain_id}", timeout=30)
                            if resp.status_code == 200:
                                evo_chain = json.loads(resp.content)
                                node = evo_chain["chain"]
                                
                                # Define pull_chain as a local function
                                def pull_chain(node):
                                    # Go through evolution tree recursively
                                    nonlocal evolutions
                                    if node.get("species", {}).get("name") == base.name:
                                        for evolve in node.get("evolves_to"):
                                            evolve_pid = int(evolve["species"]["url"].split("/")[-2])
                                            if evolve_pid in self.get_dex_list():
                                                evolutions.append(evolve_pid)

                                    for each in node["evolves_to"]:
                                        pull_chain(each)
                                
                                # Call the function
                                pull_chain(node)
                                print(f"\t\t{base.name} evolves into {evolutions}")
                    except Exception as evo_error:
                        print(f"\t\tError getting evolution chain: {evo_error}")

                    # Create Pokemon model
                    pokemon_model = PokemonBaseModel(
                        dex_id = pid,
                        name = base.name,
                        hp = hp,
                        speed = speed,
                        special = special,
                        physical = physical,
                        tier = tier,
                        types = types,
                        evolutions = evolutions,
                        catch_rate = catch_rate,
                        url_shiny = getattr(base.sprites, 'front_shiny', None),
                        url_default = getattr(base.sprites, 'front_default', None)
                    )
                    
                    # Add to our list and update the cache
                    pokemon_dict = pokemon_model.__dict__
                    all_pokemon.append(pokemon_model)
                    
                    # Update the cache dictionary
                    existing_pokemon_dict[pid] = pokemon_dict
                    
                except Exception as e:
                    print(f"Error loading Pokemon {pid}: {e}")
        
        # Update the cache with all Pokemon data
        cache_data["cache"] = list(existing_pokemon_dict.values())
        
        # Save updated cache
        try:
            with open(self.cache_loc, "w") as file:
                json.dump(cache_data, file, indent=2)
            print(f"Successfully saved cache to {self.cache_loc}")
        except Exception as save_error:
            print(f"Error saving cache: {save_error}")
            
        # Create or update pokedex with all currently loaded Pokemon
        if all_pokemon:
            if not self.POKEDEX:
                print(f"Creating new Pokedex with {len(all_pokemon)} Pokemon")
                self.POKEDEX = PokedexBase(all_pokemon)
            else:
                # Merge with existing pokemon
                existing_pokemon = self.POKEDEX.get_all()
                # Create a dictionary for quick lookup
                existing_dict = {p.dex_id: p for p in existing_pokemon}
                
                # Update with new pokemon
                for pokemon in all_pokemon:
                    existing_dict[pokemon.dex_id] = pokemon
                    
                # Create new pokedex with merged pokemon
                merged_pokemon = list(existing_dict.values())
                print(f"Updating Pokedex - now contains {len(merged_pokemon)} Pokemon")
                self.POKEDEX = PokedexBase(merged_pokemon)
        else:
            print("No Pokemon were loaded from API")
            if not self.POKEDEX:
                print("WARNING: Pokedex is empty!")

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
            pending = SpecialModel(
                id=special["id"],
                name=special["name"],
                text=special["text"]
            )
            self.SP_ATK.append(pending)

            try:
                resp = requests.put(f"{self.db_uri}/specials/{pending.id}", json=pending.model_dump_json(), timeout=5)
                resp.raise_for_status()
            except Exception as e:
                print(e)
                raise e
    
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