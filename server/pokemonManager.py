from flask_restful import abort, fields, marshal_with, Resource, reqparse

from .models import PokemonBase, pokemon, db
from .moveManager import MoveGenerator

import random

pokemon_resource = {
    '_id': fields.Integer,
    'pokedex': fields.Integer,
    'trainerID': fields.Integer,
    'name': fields.String,
    'type1': fields.String,
    'type2': fields.String,
    'hp': fields.Integer,
    'tier': fields.Integer,
    'move1': fields.Integer,
    'move2': fields.Integer,
    'speed': fields.Integer,
}
class PokemonCreator(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('tier', type=str, default='', required=True, location='args')
    
    @marshal_with(pokemon_resource)
    def get(self, trainerID):
        args = self.reqparse.parse_args()
        new_mon = self.generate_random_mon(trainerID, args["tier"])
        print(new_mon)
        return new_mon

    def generate_random_mon(self, trainerID, tier):
        def v(pl: int):
            return random.randint(-abs(pl), abs(pl))

        base = random.choice(PokemonBase.query.filter_by(tier=tier).all())
        mg = MoveGenerator()

        move1 = mg.get_random_move(tier, base.type1)._id
        move2 = mg.get_random_move(tier, base.type2)._id
        new_mon = pokemon(trainerID, base.pokedex, base.name, base.type1, base.type2, base.hp+v(5), base.tier, move1, move2, base.speed+v(2))
        db.session.add(new_mon)
        db.session.commit()
        return new_mon

class PokemonLocator(Resource):
    @marshal_with(pokemon_resource)
    def get(self, pokeID):
        chosen = pokemon.query.filter_by(_id=pokeID).first()
        if chosen:
            return chosen
        abort(404, message=f"Unable to locate pokemon with ID: {pokeID}")

    def put(self, pokeID):
        chosen = pokemon.query.filter_by(_id=pokeID).first()
        if chosen:
            chosen.trainerID = -99
            db.session.commit()
            return({"message": "Successs"})
