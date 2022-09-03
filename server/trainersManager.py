
from flask_restful import abort, Resource, fields, marshal_with, reqparse

from .models import db, trainers

import json

trainer_resource = {
    '_id': fields.Integer,
    'name': fields.String,
    'dollars': fields.Integer,
    'badges': fields.Integer,
    'tier': fields.Integer,
    'poke1': fields.Integer,
    'poke2': fields.Integer,
    'poke3': fields.Integer,
}
class TrainerController(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('name', type=str, default='', required=False, location='args')
        self.reqparse.add_argument('dollars', type=int, default=0, required=False, location='args')
        self.reqparse.add_argument('badges', type=int, default=0, required=False, location='args')
        self.reqparse.add_argument('tier', type=int, default=0, required=False, location='args')
        self.reqparse.add_argument('poke1', type=int, default=0, required=False, location='args')
        self.reqparse.add_argument('poke2', type=int, default=0, required=False, location='args')
        self.reqparse.add_argument('poke3', type=int, default=0, required=False, location='args')

    def get(self, trainerID: int):
        player = trainers.query.filter_by(_id=trainerID).first()
        if not player:
            abort(401, message=f"No trainer found for trainer id: {trainerID}")
        player_items = player.items.all()
        return json.dumps({
            '_id': player._id,
            'name': player.name,
            'dollars': player.dollars,
            'badges': player.badges,
            'tier': player.tier,
            'poke1': player.poke1,
            'poke2': player.poke2,
            'poke3': player.poke3,
            'items': [x._id for x in player_items]
        })

    def post(self, trainerID: int):
        args = self.reqparse.parse_args()
        player = trainers.query.filter_by(_id=trainerID).first()
        if player:
            player.badges = args['badges'] or player.badges
            player.dollars = args['dollars'] or player.dollars
            player.tier = args['tier'] or player.tier
            player.poke1 = args['poke1'] or player.poke1
            player.poke2 = args['poke2'] or player.poke2
            player.poke3 = args['poke3'] or player.poke3
            db.session.commit()
            return json.dumps({'success':True}), 200, {'ContentType':'application/json'} 
        else:
            abort(400, message="Unable to save trainer data.")
