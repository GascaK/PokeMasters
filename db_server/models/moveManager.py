import random
import json

from flask_restful import abort, Resource, marshal_with, fields

from services.alchemy_loader import Session
from interfaces.models import Moves

move_resource = {
    "_id": fields.Integer,
    "name": fields.String,
    "mType": fields.String,
    "tier": fields.Integer,
    "hit": fields.Integer,
    "special": fields.String
}
class MoveLocator(Resource):
    @marshal_with(move_resource)
    def get(self, moveID):
        #chosen = PokeMoves.query.filter_by(_id=moveID).first()
        with Session() as session:
            chosen = session.query(Moves).filter_by(_id=moveID).first()

        if chosen:
            return chosen
        abort(404, message=f"Unable to locate pokemon with ID: {moveID}")

class MoveGenerator():
    def __init__(self):
        pass

    def get_random_move(self, tier, mType):
        #chosen_type = PokeMoves.query.filter_by(tier=tier, mType=mType)
        with Session() as session:
            chosen_type = session.query(Moves).filter_by(tier=tier, mType=mType)

        return random.choice(chosen_type.all())

    def get_move(self, _id):
        #move = PokeMoves.query.filter_by(_id=_id).first()
        with Session() as session:
            move = session.query(Moves).filter_by(_id=_id).first()

        if move:
            move.name = move.name.title() # Capatalize from lowercase str.
            return move
        return {"404": f"Move with id: {_id} not found."}