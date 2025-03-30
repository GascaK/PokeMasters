import json
from flask import request

from flask_restful import abort, fields, marshal_with, Resource, reqparse
from services.alchemy_loader import Session

from interfaces.models import Items


item_resource = {
    'id': fields.Integer,
    'name': fields.String,
    'cost': fields.Integer,
    'text': fields.String,
    'tier': fields.Integer,
    'owner': fields.Integer
}
class ItemLocator(Resource):
    # "/items/<int:id>"
    def __init__(self):
        pass

    @marshal_with(item_resource)
    def get(self, id: int):
        with Session() as session:
            item = session.query(Items).filter_by(id=id).first()

        if not item:
            abort(400, message="Unable to find item.")

        return item

    def put(self, id: int):
        payload = json.loads(request.get_json())
        if not payload or type(payload) != dict:
            abort(400, message="Invalid payload.")
        
        try:
            i = Items(
                name=payload["name"],
                cost=payload["cost"],
                text=payload["text"],
                tier=payload["tier"],
                owner=payload["owner"]
            )
            with Session() as session:
                session.add(i)
                session.commit()
            return i.toJSON()
        except Exception as e:
            print(e)
            return {"message": str(e)}, 503
        
    def delete(self, id):
        try:
            with Session() as session:
                session.query(Items).filter_by(id=id).delete()
                session.commit()
        except Exception as e:
            print(e)
            return {"message": str(e)}, 503
