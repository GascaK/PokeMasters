import requests
import json

from .base_loader import BaseLoader
from ..interfaces.interface import PokeCenter
from ..interfaces.models import ItemModel

class ItemBuilder():
    headers={
        'Content-type':'application/json', 
        'Accept':'application/json'
    }

    def __init__(self, base_loader: BaseLoader, db_uri="http://poke-db:5000"):
       self.poke_center: PokeCenter = base_loader.POKECENTER
       self.db_uri = db_uri

    def random_item(self, tier=1) -> ItemModel:
        pending_items = self.poke_center.get_all()
        pending_items = self.poke_center.get_by_tier(pending_items, tier=tier)

        item = self.poke_center.randomize(pending_items)
        return item

    def get_item_by_name(self, name: str) -> ItemModel:
        item = self.poke_center.get_by_name(name)

        return item

    def get_item(self, item_id: int) -> ItemModel:
        try:
            resp = requests.get(f"{self.db_uri}/items/{item_id}", headers=self.headers, timeout=30)
            resp.raise_for_status()

            return self.build_item(resp.json())
        except Exception as e:
            print("ERROR", str(e))
            raise e
    
    @staticmethod
    def build_item(data: dict) -> ItemModel:
        try:
            i = ItemModel(
                id=data.get("id"),
                name=data["name"],
                cost=data["cost"],
                text=data["text"],
                tier=data["tier"],
                owner=data.get("owner")
            )
            return i
        except Exception as e:
            print(e)
            raise e

    def save_item(self, item: ItemModel) -> ItemModel:
        resp = requests.put(f"{self.db_uri}/items/0", headers=self.headers, json=item.model_dump_json(), timeout=30)
        return self.build_item(resp.json())

    def delete_item(self, item: ItemModel) -> None:
        print(f"Deleting item {item.id}: {item.name}")
        resp = requests.delete(f"{self.db_uri}/items/{item.id}")
        resp.raise_for_status()
        return resp.json()
