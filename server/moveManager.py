from .models import PokeMoves
import random
import json

class MoveGenerator():
    def __init__(self):
        pass

    def get_random_move(self, tier, mType):
        chosen_type = PokeMoves.query.filter_by(tier=tier, mType=mType)
        return random.choice(chosen_type.all())

    def get_move(self, _id):
        move = PokeMoves.query.filter_by(_id=_id).first()
        if move:
            return move
        return {"404": f"Move with id: {_id} not found."}