import answers

from src.services.base_loader import BaseLoader
from src.services.item_builder import ItemBuilder
from src.services.player_builder import PlayerBuilder
from src.services.poke_builder import PokemonBuilder

class Composer:
    base_loader = None
    item_builder = None
    player_builder = None
    poke_builder = None

    def __init__(self):
        self.get_base_loader()
        self.get_item_builder()
        self.get_poke_builder()
        self.get_player_builder()
    
    def get_base_loader(self) -> BaseLoader:
        if not self.base_loader:
            self.base_loader = BaseLoader(generations=answers.POKEMON_GENERATIONS)
        return self.base_loader

    def get_item_builder(self) -> ItemBuilder:
        if not self.item_builder:
            self.item_builder = ItemBuilder(self.get_base_loader())
        return self.item_builder

    def get_player_builder(self) -> PlayerBuilder:
        if not self.player_builder:
            self.player_builder = PlayerBuilder(self.get_base_loader(), self.get_poke_builder())
        return self.player_builder

    def get_poke_builder(self) -> PokemonBuilder:
        if not self.poke_builder:
            self.poke_builder = PokemonBuilder(self.get_base_loader())
        return self.poke_builder
