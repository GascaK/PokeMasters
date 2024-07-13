import json
from flask import request

from flask_restful import abort, fields, marshal_with, Resource, reqparse
from services.alchemy_loader import db_session

from interfaces.models import Items

# item_resource = {
#     '_id': fields.Integer,
#     'name': fields.String,
#     'cost': fields.Integer,
#     'text': fields.String,
# }
# class ItemController(Resource):

#     def __init__(self):
#         self.reqparse = reqparse.RequestParser()
#         self.reqparse.add_argument('_id', type=str, default='', required=False, location='args')
#         self.reqparse.add_argument('item_id', type=int, default='', required=False, location='args')
#         self.reqparse.add_argument('store', type=boolean, default='', required=False, location='args')

#     def get(self, trainerID):
#         args = self.reqparse.parse_args()

#         if args['_id']:
#             item = self.get_item_by_id(args['_id'])
#             items = {
#                 '_id': item._id,
#                 'name': item.name,
#                 'cost': item.cost,
#                 'text': item.text
#                 }
#         elif args['store']:
#             item = self.get_random_item()
#             items = {
#                 '_id': item._id,
#                 'name': item.name,
#                 'cost': item.cost,
#                 'text': item.text
#             }
#         else:
#             item = self.get_trainer_items(trainerID)
#             items = []
#             for each in item:
#                 items.append({
#                     '_id': each._id,
#                     'name': each.name,
#                     'cost': each.cost,
#                     'text': each.text,
#                 })
#         return items

#     def post(self, trainerID):
#         # Purchase an item.
#         args = self.reqparse.parse_args()
#         if not args['item_id']:
#             abort(404, message="Item ID required on POST.")

#         item = self.get_item_by_id(args['item_id'])
#         if not item:
#             abort(404, message=f"ItemID {args['item_id']} not found..")

#         new_item = trainerItems(item.name, item.cost, item.text, trainerID)
#         db.session.add(new_item)
#         db.session.commit()
#         return json.dumps({"message": "Success!", "Status": 200})

#     def put(self, trainerID):
#         # Use an item through _id
#         args = self.reqparse.parse_args()
#         if not args['item_id']:
#             abort(404, message="item_id required in PUT.")
#         item = trainerItems.query.filter_by(_id=args['item_id']).first()
#         if not item:
#             abort(401, message=f"Item by id #{args['item_id']} not found.")
        
#         item.owner = -1
#         db.session.commit()
#         return json.dumps({"message": "Success!", "Status": 200})

#     def get_random_item(self):
#         return random.choice(PokeItems.query.filter().all())

#     def get_item_by_id(self, id):
#         item = PokeItems.query.filter_by(_id=id).first()
#         return item if item else None

#     def get_trainer_items(self, trainerID):
#         items = trainerItems.query.filter(trainerItems.owner == trainerID).all()
#         return items

item_resource = {
    'id': fields.Integer,
    'name': fields.String,
    'cost': fields.Integer,
    'text': fields.String,
    'trainer': fields.Integer
}
class ItemLocator(Resource):
    # "/items/<int:id>"
    def __init__(self):
        pass

    @marshal_with(item_resource)
    def get(self, id):
        item = Items.query.filter_by(id=id).first()
        if not item:
            abort(400, message="Unable to find item.")

        return item

    @marshal_with(item_resource)
    def put(self, id):
        payload: dict = request.get_json()
        if not payload:
            abort(400, message="Invalid payload.")
        
        try:
            i = Items(
                name=payload["name"],
                cost=payload["cost"],
                text=payload["text"],
                tier=payload["tier"]
            )
            db_session.add(i)
            db_session.commit()

            return i
        except Exception as e:
            print(e)
            return {"message": str(e)}, 503
        
    def delete(self, id):
        try:
            Items.query.filter_by(id=id).delete()
            db_session.commit()
        except Exception as e:
            print(e)
            return {"message": str(e)}, 503
