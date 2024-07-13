from flask import request
from flask_restful import abort, Resource

from services import get_running_games

class GamePokemonRoute(Resource):
    # "/game/<string:uuid>/pokemon/encounter"
    def __init__(self):
        pass

    def get(self, uuid: str):
        payload: dict = request.get_json()
        if not payload.get("id"):
            abort(400, message="No 'id' provided.")
        
        for game in get_running_games():
            if game.get_id() == uuid:
                return game.get_players()
