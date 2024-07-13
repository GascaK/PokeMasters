import requests
import json

from services.trainer_loader import TrainerLoader
from .interface import Pokemon, PokedexBase, Item, Items


class Player():
    headers={
        'Content-type':'application/json', 
        'Accept':'application/json'
    }

    def __init__(self, id: int, name: str, badges:int, dollars: int, loader: TrainerLoader=None, db_uri="127.0.0.1:5000", pokedex: list[Pokemon]=[], items: list[Item]=[]):
        self.id = id
        self.name = name
        self.badges = badges
        self.dollars = dollars
    
        self.loader = loader
        self.db_uri = db_uri

        self.pokedex = PokedexBase(pokedex)
        self.items = Items(items)
    
    def update(self):
        data = self.loader.get_data()

        self.name = data["name"]
        self.badges = data["badges"]
        self.dollars = data["dollars"]

        self.pokedex = PokedexBase(self.loader.get_pokemon())
        self.items = Items(self.loader.get_items())

    def pay(self, value: int) -> int:
        total = self.dollars - value
        if total < 0:
            raise ValueError("Out of dinero bucko.")
        else:
            try:
                resp = requests.put(f"{self.db_uri}/player/{self.id}",
                             json=json.loads({"dollars": total}),
                             headers=self.headers,
                             timeout=30)
                self.dollars = total
                return resp
            except Exception as e:
                print("Error saving value.")
                raise e

    def income(self, value: int) -> int:
        total = self.dollars + value
        try:
            resp = requests.put(f"{self.db_uri}/player/{self.id}",
                             json=json.loads({"dollars": total}),
                             headers=self.headers,
                             timeout=30)
            self.dollars += value
            return resp
        except Exception as e:
            print("Error saving value.")
            raise e

    def get_pokemon(self, pid: int=None) -> Pokemon|list[Pokemon]:
        if pid:
            return self.pokedex.get_by_pid(pid)
        else:
            return self.pokedex.get_all()

    def release_pokemon(self, pokemon: Pokemon) -> None:
        try:
            resp = requests.put(f"{self.db_uri}/pokemon/{self.id}",
                             json=json.loads(pokemon.get_datalization()),
                             headers=self.headers,
                             timeout=30)
            self.pokedex.get_all().remove(pokemon)
            return resp
        except Exception as e:
            print("Error saving value.")
            raise e

    def use_item(self, item: Item) -> None:
        self.items.get_all().remove(item) 
