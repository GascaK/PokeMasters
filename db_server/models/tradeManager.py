import json
import logging

from flask import request
from flask_restful import Resource, fields, marshal_with, abort
from services.alchemy_loader import Session

from interfaces.models import Trades


trade_resource = {
    "id": fields.Integer,
    "id_one": fields.Integer,
    "id_two": fields.Integer,
    "state_one": fields.Integer,
    "state_two": fields.Integer
}
class TradesLocator(Resource):

    @marshal_with(trade_resource)
    def get(self):
        with Session() as session:
            trades = session.query(Trades).all()
    
        if not trades:
            abort(404, message=f"No trades found.")
        return trades
    
    @marshal_with(trade_resource)
    def put(self, id):
        payload = json.loads(request.get_json())
        if not payload:
            abort(400, message="No payload provided")
        
        with Session() as session:
            try:
                trade = Trades(
                    id_one=payload["id_one"],
                    id_two=payload["id_two"],
                    state_one=payload["state_one"],
                    state_two=payload["state_two"]
                    )
                session.add(trade)
                session.commit()
            except Exception as ex:
                abort(400, message=f"Error creating trade: {ex}")

            return trade

    @marshal_with(trade_resource)
    def patch(self, id):
        payload = json.loads(request.get_json())

        with Session() as session:
            trade = session.query(Trades).filter_by(id=id).first()

            try:
                trade.id_one = payload["id_one"]
                trade.id_two = payload["id_two"]
                trade.state_one = payload["state_one"]
                trade.state_two = payload["state_two"]
                session.commit()

                return trade
            except Exception as ex:
                abort(400, message=f"Error updating trade: {ex}")