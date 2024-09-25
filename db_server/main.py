from flask import Flask
from flask_cors import CORS
from flask_restful import Api

from models.playerManager import TrainerLocator, TrainerPokemonLocator, TrainerItemLocator
from models.pokemonManager import PokemonLocator, MoveLocator
from models.itemManager import ItemLocator
from services.root import Root
from services.alchemy_loader import init_db


app = Flask("db_server")
api = Api()

CORS(app)
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{Root.app_dir()}\\database\\pokemasters.sqlite3"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

api.add_resource(MoveLocator, "/moves/<int:id>")
api.add_resource(ItemLocator, "/items/<int:id>")
api.add_resource(TrainerLocator, "/player/<int:id>")
api.add_resource(PokemonLocator, "/pokemon/<int:id>")
api.add_resource(TrainerItemLocator, "/player/<int:id>/items")
api.add_resource(TrainerPokemonLocator, "/player/<int:id>/pokemon")

if __name__ == "__main__":
    init_db()
    api.init_app(app)
    app.run(host="0.0.0.0", port=5000)
