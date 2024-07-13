
from .base_loader import BaseLoader
from services.game_state import GameState

loader_base = None
running_games = []

def get_base_loader() -> BaseLoader:
    global loader_base
    if not loader_base:
        loader_base = BaseLoader(generations=[])
    return loader_base

def get_running_games() -> list[GameState]:
    global running_games
    return running_games