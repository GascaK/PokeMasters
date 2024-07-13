import uuid
import json
from flask import request

from flask_restful import abort, Resource
from services import get_base_loader, get_running_games
from services.game_state import GameState
from services.trainer_loader import TrainerLoader


class GameStartRoute(Resource):
    # "/game/start"
    game_folder = "games"

    def __init__(self):
        pass

    def get(self):
        payload: dict = request.get_json()
        if not payload.get("uuid"):
            abort(400, message="No 'uuid' provided.")

        base_loader = get_base_loader()

        for game in get_running_games():
            if game.get_id() == payload["uuid"]:
                for player in game.get_players():
                    tp = TrainerLoader(player.id, base_loader).get_player()
                    print(tp.name)
                    print(tp.items.get_all())

    def post(self):
        payload: dict = request.get_json()
        if not payload.get("id"):
            abort(400, message="No 'id' provided.")
        
        game_id = str(uuid.uuid4())
        base_loader = get_base_loader()

        _loader = TrainerLoader(payload["id"], base_loader)
        get_running_games().append(
            GameState(players=[_loader.get_player()], game_id=game_id)
            )
        
        # TODO: Save player data instead.
        with open(f"{self.game_folder}/{game_id}", "w+", encoding="utf-8") as file:
            players = { 'players': 
                            [
                                get_running_games()[-1].players[0].name
                            ]
                    }
            json.dump(players, file)

        return game_id, 200
    
    def put(self):
        payload: dict = request.get_json()
        if not payload.get("id") or not payload.get("uuid"):
            abort(400, message="Missing parameters: \{ID\} or \{uuid\}")
        
        base_loader = get_base_loader()
        data: dict[str, list[str]] = []

        player = TrainerLoader(payload["id"], base_loader).get_player()
        for game in get_running_games():
            print(game.get_id())
            if game.get_id() == payload["uuid"]:
                game.add_player(player)

                # Add player name to list. TODO: Add functionality to track game.
                with open(f"{self.game_folder}/{game.get_id()}", "r", encoding="utf-8") as file:
                    data = json.loads(file.read())
                    data["players"].append(player.name)
                with open(f"{self.game_folder}/{game.get_id()}", "w+", encoding="utf-8") as file:
                    json.dump(data, file)
        
        return data, 200