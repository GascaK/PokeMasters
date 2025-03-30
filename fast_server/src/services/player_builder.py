import requests
import json

from ..interfaces.interface import PokemonBase, Pokemon, Move, Item, Player
from ..interfaces.models import PlayerModel, PokemonModel, ItemModel
from .poke_builder import PokemonBuilder
from .item_builder import ItemBuilder
from .base_loader import BaseLoader

class PlayerBuilder():
    headers={
        'Content-type':'application/json', 
        'Accept':'application/json'
    }

    def __init__(self, base_loader: BaseLoader, poke_builder: PokemonBuilder=None, db_uri="http://poke-db:5000"):
        self.base_loader = base_loader
        self.poke_builder = poke_builder
        self.db_uri = db_uri
    
    def build_player(self, data: dict) -> PlayerModel:
        return PlayerModel(
            id=data.get("id"),
            name=data.get("name"),
            badges=data.get("badges"),
            dollars=data.get("dollars")
        )

    def get_player(self, id: int) -> PlayerModel:
        try:
            resp = requests.get(f"{self.db_uri}/player/{id}", headers=self.headers, timeout=30)
            resp.raise_for_status()

            p: dict = resp.json()
            return self.build_player(p)
        except Exception as e:
            print(e)
            raise e
        
    def get_player_by_name(self, name: str) -> PlayerModel:
        try:
            resp = requests.get(f"{self.db_uri}/player/{name}/find", headers=self.headers, timeout=30)
            resp.raise_for_status()

            p: dict = resp.json()
            return self.build_player(p)
        except Exception as e:
            print(e)
            raise e
    
    def new_player(self, player: PlayerModel) -> PlayerModel:
        try:
            resp = requests.post(f"{self.db_uri}/player/0",
                                  headers=self.headers, 
                                  json=player.model_dump_json(),
                                  timeout=30)
            resp.raise_for_status()
            return self.build_player(resp.json())
        except Exception as e:
            print(e)
            raise e
    
    def save_player(self, player: PlayerModel) -> PlayerModel:
        try:
            resp = requests.patch(f"{self.db_uri}/player/{player.id}",
                                  headers=self.headers, 
                                  json=player.model_dump_json(),
                                  timeout=30)
            resp.raise_for_status()
            return self.build_player(resp.json())
        except Exception as e:
            print(e)
            raise e

    def get_pokemon(self, id: int) -> list[PokemonModel]:
        try:
            if not self.poke_builder:
                raise ValueError

            resp = requests.get(f"{self.db_uri}/player/{id}/pokemon", headers=self.headers, timeout=30)
            resp.raise_for_status()
            
            pokemon: list[PokemonModel] = []
            for mon in resp.json():
                pokemon.append(self.poke_builder.build_pokemon(mon))
            return pokemon

        except Exception as e:
            print(e)
            raise e

    def get_items(self, id: int) -> list[ItemModel]:
        try:
            resp  = requests.get(f"{self.db_uri}/player/{id}/items", headers=self.headers, timeout=30)
            resp.raise_for_status()
            
            items: list[ItemModel] = []
            for item in resp.json():
                items.append(ItemBuilder.build_item(item))
            return items
        except Exception as e:
            print(e)
            raise e
