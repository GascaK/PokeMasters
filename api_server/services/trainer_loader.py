import requests
import json

from interfaces.interface import PokemonBase, Pokemon, Move, Item
from interfaces.player import Player
from .poke_loader import BaseLoader

class TrainerLoader():
    headers={
        'Content-type':'application/json', 
        'Accept':'application/json'
    }

    def __init__(self, id, base_loader: BaseLoader, db_uri="http://127.0.0.1:5000"):
        self.id = id
        self.base_loader = base_loader
        self.db_uri = db_uri

    def get_player(self):
        data = self.get_data()
        return Player(
            id=data["id"],
            name=data["name"],
            badges=data["badges"],
            dollars=data["dollars"],
            loader=self,
            pokedex=self.get_pokemon(),
            items=self.get_items()
        )

    def get_data(self):
        resp = requests.get(f"{self.db_uri}/player/{self.id}", headers=self.headers, timeout=30)
        return json.loads(resp.text)

    def get_pokemon(self) -> list[Pokemon]:
        resp = requests.get(f"{self.db_uri}/pokemon/{self.id}", headers=self.headers, timeout=30)
        if resp.status_code != 200:
            return []
        
        pokemon = json.loads(resp.text)
        pending_dex = []
        for mon in pokemon:
            base = self.base_loader.POKEDEX.get_by_pid(mon["pokedex"])

            stats = [
                {
                    "name": "hp",
                    "base_stat": mon["hp"],
                    "mod": mon["hp_mod"],
                    "current_value": mon["hp"]
                },
                {
                    "name": "speed",
                    "base_stat": mon["speed"],
                    "mod": mon["speed_mod"],
                    "current_value": mon["speed"]
                },
                {
                    "name": "special",
                    "base_stat": mon["special"],
                    "mod": mon["special_mod"],
                    "current_value": mon["special"]
                },
                {
                    "name": "physical",
                    "base_stat": mon["physical"],
                    "mod": mon["physical_mod"],
                    "current_value": mon["physical"]
                }
            ]
            sprite = {
                "url": mon["sprite_url"],
                "is_shiny": mon["shiny"]
            }

            b = PokemonBase(
                pid=base.pid,
                name=base.name,
                hp=base.hp,
                speed=base.speed,
                special=base.special,
                physical=base.physical,
                tier=base.tier,
                types=base.types,
                evolutions=base.evolutions,
                catch_rate=base.catch_rate
            )

            # Get Mon Moves
            moves = []
            for move in [mon["move1"], mon["move2"]]:
                resp = requests.get(f"{self.db_uri}/moves/{move}")
                m = json.loads(resp.text)

                moves.append(Move(
                    id=m["id"],
                    name=m["name"],
                    tier=m["tier"],
                    move_type=m["move_type"],
                    special=m["special"],
                    hit=m["hit"]
                ))

            # Add Pokemon
            pending_dex.append(
                Pokemon(
                    base=b,
                    stats=stats,
                    sprite=sprite,
                    trainer=mon["trainer"],
                    moves=moves,
                    items=[]
                )
            )

        return pending_dex

    def get_items(self) -> list[Item]:
        resp  = requests.get(f"{self.db_uri}/player/{self.id}/items", headers=self.headers, timeout=30)
        items = json.loads(resp.text)
        if resp.status_code != 200:
            return []

        items_list = []
        for i in items:
            items_list.append(
                Item(
                    id=i["id"],
                    name=i["name"],
                    cost=i["cost"],
                    text=i["text"],
                    tier=i["tier"],
                    trainer=i["trainer"]
                )
            )
        return items_list
