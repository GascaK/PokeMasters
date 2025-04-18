
import json
from flask import request

from flask_restful import abort, Resource, fields, marshal_with
from services.alchemy_loader import Session

from interfaces.models import Player, Pokemon, Items


player_resource = {
    'id': fields.Integer,
    'name': fields.String,
    'dollars': fields.Integer,
    'badges': fields.Integer
}
class TrainerLocator(Resource):
    # "/player/<int:id>"
    def __init__(self):
        pass

    @marshal_with(player_resource)
    def get(self, id: int):
        with Session() as session:
            player = session.query(Player).filter_by(id=id).first()

        if not player:
            abort(401, message=f"No trainer found for trainer id: {id}")

        return player

    @marshal_with(player_resource)
    def post(self, id):
        payload: dict = json.loads(request.get_json())
        if not payload:
            abort(400, message="Invalid payload data.")

        try:
            p = Player(
                name    = payload.get("name", "newb"),
                badges  = payload.get("badges", 0),
                dollars = payload.get("dollars", 0)
            )
            with Session() as session:
                session.add(p)
                session.commit()
            return p.toJSON()

        except Exception as e:
            print(e)
            return str(e)

    @marshal_with(player_resource)
    def patch(self, id):
        payload: dict = json.loads(request.get_json())
        if not payload or type(payload) != dict:
            abort(400, message="Invalid payload.")

        #player: Player = Player.query.filter_by(id=id).first()
        with Session() as session:
            player: Player = session.query(Player).filter_by(id=id).first()

            if not player:
                abort(400, message="Unable to save trainer data.")

            player.name = payload.get("name") or player.name
            player.dollars = payload.get("dollars") or player.dollars
            player.badges = payload.get("badges") or player.badges

            session.commit()

        return player.toJSON()

class TrainerFinderLocator(Resource):
    # '/player/<name:str>/find
    def get(self, name: str):
        #player: Player = Player.query.filter_by(name=name).first()

        with Session() as session:
            player: Player = session.query(Player).filter_by(name=name).first()

        if not player:
            abort(404, message=f"No trainer found for trainer id: {id}")

        return player.toJSON()

class TrainerPokemonLocator(Resource):
    # '/player/<int:id>/pokemon
    def get(self, id: int):
        #chosen: list[Pokemon] = Pokemon.query.filter_by(owner=id).all()
        with Session() as session:
            chosen: list[Pokemon] = session.query(Pokemon).filter_by(owner=id).all()

        return [x.toJSON() for x in chosen], 200

item_resource = {
    'id': fields.Integer,
    'name': fields.String,
    'cost': fields.Integer,
    'text': fields.String,
    'tier': fields.Integer,
    'trainer': fields.Integer
}
class TrainerItemLocator(Resource):
    # /player/<int:id>/items
    def get(self, id):
        #items: Items = Items.query.filter_by(owner=id).all()

        with Session() as session:
            items: Items = session.query(Items).filter_by(owner=id).all()

        return [x.toJSON() for x in items], 200
    
    @marshal_with(item_resource)
    def post(self, id):
        payload: dict = json.loads(request.get_json())
        if not payload:
            abort(400, message="Invalid payload.")
        
        try:
            i = Items(
                trainer=id,
                name=payload["name"],
                cost=payload["cost"],
                text=payload["text"],
                tier=payload["tier"]
            )
            with Session() as session:
                session.add(i)
                session.commit()

            return i
        except Exception as e:
            print(e)
            return {"message": str(e)}, 503