
import json
from flask import request

from flask_restful import abort, fields, marshal_with, Resource, reqparse
from services.alchemy_loader import db_session
from interfaces.models import Pokemon, Moves, Items

pokemon_resource = {
    'id': fields.Integer,
    'pokedex': fields.Integer,
    'trainer': fields.Integer,
    'name': fields.String,
    'tier': fields.Integer,
    'hp': fields.Integer,
    'hp_mod': fields.Integer,
    'speed': fields.Integer,
    'speed_mod': fields.Integer,
    'special': fields.Integer,
    'special_mod': fields.Integer,
    'physical': fields.Integer,
    'physical_mod': fields.Integer,
    'shiny': fields.Boolean,
    'sprite_url': fields.String,
    'move1': fields.Integer,
    'move2': fields.Integer,
    'move3': fields.Integer,
    'move4': fields.Integer,
    'type1': fields.String,
    'type2': fields.String,
}
class PokemonLocator(Resource):
    # "/pokemon/<int:trainer>"
    def __init__(self):
        pass

    @marshal_with(pokemon_resource)
    def get(self, trainer):
        chosen = Pokemon.query.filter_by(trainer=trainer).all()
        if not chosen:
            abort(404, message=f"Unable to locate pokemon with ID: {trainer}")

        return chosen

    def put(self, trainer):
        payload: dict = request.get_json()
        if not payload:
            abort(400, message="Invalid payload.")

        for stat in payload["stats"]:
            if stat["name"] == "speed":
                speed = stat["base_stat"]
                speed_mod = stat["mod"]
            elif stat["name"] == "hp":
                hp = stat["base_stat"]
                hp_mod = stat["mod"]
            elif stat["name"] == "special":
                special = stat["base_stat"]
                special_mod = stat["mod"]
            elif stat["name"] == "physical":
                physical = stat["base_stat"]
                physical_mod = stat["mod"]

        try:
            p = Pokemon(
                trainer=trainer,
                pokedex=payload["id"],
                name=payload["name"],
                tier=payload["tier"],
                hp=hp,
                hp_mod=hp_mod,
                speed=speed,
                speed_mod=speed_mod,
                special=special,
                special_mod=special_mod,
                physical=physical,
                physical_mod=physical_mod,
                type1=payload["type1"],
                type2=payload["type2"],
                move1=payload["moves"][0]["id"],
                move2=payload["moves"][1]["id"],
                move3=None,
                move4=None
            )

            db_session.add(p)
            db_session.commit()
        except Exception as e:
            print(e)
            return {"message": str(e)}, 503

        return {"message": "Success"}, 200

    def delete(self, trainer):
        payload: dict = request.get_json()
        if not payload:
            abort(400, message="Invalid payload.")

        chosen = Pokemon.query.filter_by(trainer=trainer,id=payload["id"]).first()
        db_session.delete(chosen)
        db_session.commit()

move_resource = {
    'id': fields.Integer,
    'name': fields.String,
    'tier': fields.Integer,
    'move_type': fields.String,
    'special': fields.String,
    'hit': fields.String
}
class MoveLocator(Resource):
    # "/moves/<int:id>"
    def __init__(self):
        pass

    @marshal_with(move_resource)
    def get(self, id):
        move = Moves.query.filter_by(id=id).first()
        db_session.close()
        if not move:
            abort(400, message="Unable to find move.")

        return move

    @marshal_with(move_resource)
    def put(self, id):
        payload: dict = request.get_json()
        if not payload:
            abort(400, message="Invalid payload.")

        try:
            m = Moves(
                name=payload["name"],
                move_type=payload["move_type"],
                special=payload["special"],
                tier=payload["tier"],
                hit=payload["hit"]
            )
            db_session.add(m)
            db_session.commit()

            return m

        except Exception as e:
            print(e)
            return {"message": str(e)}, 503
