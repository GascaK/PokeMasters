import uuid

from interfaces.player import Player


class GameState():
    def __init__(self, players: list[Player], game_id=None):
        self.players = players
        self.game_id = game_id

        if not self.game_id:
            self.game_id = str(uuid.uuid4())

    def get_id(self) -> str:
        return self.game_id
    
    def add_player(self, player: Player):
        self.players.append(player)
    
    def get_players(self) -> list[Player]:
        return self.players

    def save(self) -> None:
        with open(self.get_id(), "r+", encoding="utf-8") as file:
            file.write("")


## Create Game
## Get pLayer GET("player/{ID}")
## Update player stats PUT("game/player/{username}") {PAYLOAD}

