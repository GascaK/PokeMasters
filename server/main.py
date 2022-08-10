from flask import Flask
from flask_restful import Api, abort, Resource, fields, marshal_with
from flask_sqlalchemy import SQLAlchemy

from trainersManager import TrainerController
#from pokemonManager import PokemonController

app = Flask (__name__)
api = Api(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database/trainers.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

api.add_resource(TrainerController, "/trainers/<int:trainerID>", resource_class_kwargs={'db': db})
#api.add_resource(PokemonController, "/pokemon/<int:tier>")

if __name__ == '__main__':
   app.run()