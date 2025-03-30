
import json
from flask import request

from flask_restful import abort, fields, marshal_with, Resource, reqparse
from services.alchemy_loader import Session
from interfaces.models import Pokemon, Moves, Items


class PokemonLocator(Resource):
    # "/pokemon/<id>"
    def __init__(self):
        pass

    def get(self, id: int):
        #chosen: Pokemon = Pokemon.query.filter_by(id=id).first()
        with Session() as session:
            chosen: Pokemon = session.query(Pokemon).filter_by(id=id).first()

        if not chosen:
            abort(404, message=f"Unable to locate pokemon with ID: {id}")

        return chosen.toJSON(), 200
    
    def patch(self, id: int):
        payload = json.loads(request.get_json())
        if not payload or type(payload) != dict:
            abort(400, message="Invalid payload.")
        
        #chosen: Pokemon = Pokemon.query.filter_by(id=id).first()
        with Session() as session:
            chosen: Pokemon = session.query(Pokemon).filter_by(id=id).first()

            if not chosen:
                abort(404, message=f"Unable to locate pokemon with ID: {id}")

            chosen.owner = payload.get("owner", 0)
            session.add(chosen)
            session.commit()

        return chosen.toJSON(), 200

    def put(self, id: int):
        payload: dict = json.loads(request.get_json())
        if not payload:
            abort(400, message="Invalid payload.")
        print(payload)

        try:
            for stat in payload["stats"]:
                if stat["name"] == "speed":
                    speed = stat["value"]
                    speed_mod = stat["mod"]
                elif stat["name"] == "hp":
                    hp = stat["value"]
                    hp_mod = stat["mod"]
                elif stat["name"] == "special":
                    special = stat["value"]
                    special_mod = stat["mod"]
                elif stat["name"] == "physical":
                    physical = stat["value"]
                    physical_mod = stat["mod"]

            p = Pokemon(
                dex_id=payload["base"]["dex_id"],
                owner=payload["owner"],
                name=payload["base"]["name"],
                tier=payload["base"]["tier"],
                shiny=payload["sprite"]["shiny"],
                sprite_url=payload["sprite"]["sprite_url"],
                hp=hp,
                hp_mod=hp_mod,
                speed=speed,
                speed_mod=speed_mod,
                special=special,
                special_mod=special_mod,
                physical=physical,
                physical_mod=physical_mod,
                catch_rate=payload["base"]["catch_rate"],
                type1=payload["base"]["types"][0],
                type2=payload["base"]["types"][-1],
                move1=payload["moves"][0]["id"],
                move2=payload["moves"][1]["id"]
            )

            with Session() as session:
                session.add(p)
                session.commit()

            return p.toJSON(), 200
        except Exception as e:
            print(str(e))
            return {"error": str(e)}, 503

    def delete(self, id: int):
        with Session() as session:
            chosen: Pokemon = session.query(Pokemon).filter_by(id=id).first()
            session.delete(chosen)
            session.commit()

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
        #move = Moves.query.filter_by(id=id).first()
        with Session() as session:
            move: Moves = session.query(Moves).filter_by(id=id).first()

        if not move:
            abort(400, message=f"Unable to find move. ID:{id}")

        return move

    @marshal_with(move_resource)
    def put(self, id):
        payload: dict = json.loads(request.get_json())
        if not payload:
            abort(400, message="Invalid payload.")

        try:
            with Session() as session:
                m = Moves(
                    name=payload["name"],
                    move_type=payload["move_type"],
                    special=None if not payload["special"] else payload["special"]["text"],
                    tier=payload["tier"],
                    hit=payload["hit"]
                )
                session.add(m)
                session.commit()

            return m

        except Exception as e:
            print(e)
            return {"message": str(e)}, 503
