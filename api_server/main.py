from flask import Flask
from flask_cors import CORS
from flask_restful import Api

import requests
import json

from models.game_start_route import GameStartRoute
from services import get_base_loader
from services.base_loader import BaseLoader

app = Flask("api_server")
api = Api()


CORS(app)

#api.add_resource(GameRoute, "/game/<string:uuid>/player/<int:player>")
api.add_resource(GameStartRoute, "/game/start")

RunningGames = []

if __name__ == "__main__":
    api.init_app(app)

    _ = get_base_loader()

    app.run(host="0.0.0.0", port=9000)


    #base_loader = BaseLoader(generations=[])
    # p_loader = PokemonBuilder(base_loader)
    # t_loader = TrainerLoader(1, base_loader)

    # try:
    #     #data = t_loader.get_data()
    #     payload = {
    #         "name": "Kevin",
    #     }
    #     resp = requests.post("http://127.0.0.1:5000/player/1",
    #                          json=payload,
    #                          headers=headers,
    #                          timeout=30)
    #     data = json.loads(resp.text)
    #     print(data)
    #     player = Player(1, data["name"], data["badges"], data["dollars"], t_loader.get_pokemon(), t_loader.get_items())
    # except Exception as e:
    #     print(e)
    #     exit()

    # #new_game = PlayerGamestate(base_loader)

    # for x in range(25):
    #     print("\n\n")
    #     pokemon = p_loader.encounter(tier=1)
    #     r = requests.put("http://127.0.0.1:5000/pokemon/1",
    #                  json=json.dumps(pokemon.get_datalization()),
    #                  headers=headers,
    #                  timeout=30)
    #     print(r.content)
    # for x in range(25):
    #     print("\n\n")
    #     pokemon = p_loader.encounter(tier=2)
    #     r = requests.put("http://127.0.0.1:5000/pokemon/1",
    #                  json=json.dumps(pokemon.get_datalization()),
    #                  headers=headers,
    #                  timeout=30)
    #     print(r.content)
    # for x in range(25):
    #     print("\n\n")
    #     pokemon = p_loader.encounter(tier=3)
    #     r = requests.put("http://127.0.0.1:5000/pokemon/1",
    #                  json=json.dumps(pokemon.get_datalization()),
    #                  headers=headers,
    #                  timeout=30)
    #     print(r.content)
    # for x in range(25):
    #     print("\n\n")
    #     pokemon = p_loader.encounter(tier=4)
    #     r = requests.put("http://127.0.0.1:5000/pokemon/1",
    #                  json=json.dumps(pokemon.get_datalization()),
    #                  headers=headers,
    #                  timeout=30)
    #     print(r.content)
