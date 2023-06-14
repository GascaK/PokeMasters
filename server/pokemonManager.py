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
        new_mons = []
        args = self.reqparse.parse_args()
        max_tier = int(args["tier"])

        while(max_tier > 0):
            new_mons.append(self.generate_random_mon(trainerID, max_tier))
            max_tier -= 1

        print(new_mons)
        return random.choice(new_mons)

    def generate_random_mon(self, trainerID, tier):
        def v(pl: int):
            val = random.randint(-abs(pl), abs(pl))
            return val

        if not tier:
            print(f'tier is {tier}')

        base = random.choice(PokemonBase.query.filter_by(tier=tier).all())
        mg = MoveGenerator()

        move1 = mg.get_random_move(tier, base.type1)._id
        move2 = mg.get_random_move(tier, base.type2)._id
        hp = base.hp+v(5) # hp is always atleast 2.
        new_mon = pokemon(trainerID, base._id, base.name, base.type1, base.type2, hp if hp>=2 else 2, base.tier, move1, move2, base.speed+v(2))
        db.session.add(new_mon)
        db.session.commit()
        return new_mon

class PokemonLocator(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('trainerID', type=int, required=True, location='args')

    @marshal_with(pokemon_resource)
    def get(self, pokeID):
        chosen = pokemon.query.filter_by(_id=pokeID).first()
        if chosen:
            return chosen
        abort(404, message=f"Unable to locate pokemon with ID: {pokeID}")

    def put(self, pokeID):
        args = self.reqparse.parse_args()
        chosen = pokemon.query.filter_by(_id=pokeID).first()
        if chosen and args['trainerID']:
            chosen.trainerID = args['trainerID']
            db.session.commit()
            return({"message": "Successs"})
        abort(404, message=f"No pokemon with id {pokeID} found. Or {args['trainerID']}")

class PokemonEvolver(Resource):
    def __init__(self):
        pass

    @marshal_with(pokemon_resource)
    def get(self, trainerID, pokedex):
        new_mon = self.generate_pokemon_by_id(trainerID, pokedex)
        print(new_mon)
        return new_mon

    def generate_pokemon_by_id(self, trainerID: int, pokedex: int):
        def v(pl: int):
            return random.randint(-abs(pl), abs(pl))

        base = PokemonBase.query.filter_by(_id=pokedex).first()
        mg = MoveGenerator()

        move1 = mg.get_random_move(base.tier, base.type1)._id
        move2 = mg.get_random_move(base.tier, base.type2)._id
        hp = base.hp+v(5) # hp is always atleast 2.
        new_mon = pokemon(trainerID,
                          base._id,
                          base.name,
                          base.type1,
                          base.type2,
                          hp if hp>=2 else 2, base.tier,
                          move1, move2,
                          base.speed+v(2))
        db.session.add(new_mon)
        db.session.commit()
        return new_mon