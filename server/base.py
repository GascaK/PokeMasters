from flask import Flask
from flask_restful import Api
from .database import db


from server.trainersManager import TrainerController
from server.pokemonManager import PokemonCreator, PokemonLocator

api = Api()

api.add_resource(TrainerController, "/trainers/<int:trainerID>")
api.add_resource(PokemonCreator, "/pokemon/<int:trainerID>")
api.add_resource(PokemonLocator, "/trainers/pokemon/<int:pokeID>")

def create_app():
    app = Flask(__name__, instance_relative_config=False)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database/pokemasters.sqlite3'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    api.init_app(app)

    with app.app_context():
        db.create_all()

        return app