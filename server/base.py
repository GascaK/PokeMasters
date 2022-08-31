from flask import Flask
from flask_restful import Api
from flask_cors import CORS

from .database import db

from server.trainersManager import TrainerController
from server.itemManager import ItemController
from server.pokemonManager import PokemonCreator, PokemonLocator
from server.moveManager import MoveLocator

api = Api()

api.add_resource(TrainerController, "/trainers/<int:trainerID>")
api.add_resource(ItemController, "/items/<int:trainerID>")
api.add_resource(PokemonCreator, "/trainers/<int:trainerID>/pokemon")
api.add_resource(PokemonLocator, "/pokemon/<int:pokeID>")
api.add_resource(MoveLocator, "/moves/<int:moveID>")

def create_app():
    app = Flask(__name__, instance_relative_config=False)
    CORS(app)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database/pokemasters.sqlite3'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    api.init_app(app)

    with app.app_context():
        db.create_all()

        return app