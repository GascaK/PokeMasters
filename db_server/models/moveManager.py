import random
import json

from flask_restful import abort, Resource, marshal_with, fields, request
from interfaces.models import Move
from services.alchemy_loader import Session

 
# Move resource fields for marshalling
move_resource = {
    'id': fields.Integer,
    'name': fields.String,
    'tier': fields.Integer,
    'move_type': fields.String,
    'special': fields.Integer,
    'hit': fields.String
}

class MoveLocator(Resource):
    """Resource for handling Move CRUD operations at /moves/<id>."""

    @marshal_with(move_resource)
    def get(self, id):
        """Retrieve a Move by ID."""
        with Session() as session:
            move = session.query(Move).filter_by(id=id).first()

        if not move:
            abort(404, message=f"Unable to find move with ID: {id}")

        return move

    def delete(self, id):
        """Delete a Move by ID."""
        with Session() as session:
            move = session.query(Move).filter_by(id=id).first()

            if not move:
                abort(404, message=f"Unable to find move with ID: {id}")

            session.delete(move)
            session.commit()

    @marshal_with(move_resource)
    def put(self, id):
        """Create or replace a Move with the given ID."""
        try:
            payload = json.loads(request.get_json())
            if not payload:
                abort(400, message="Invalid payload.")

            with Session() as session:
                move = Move(
                    name=payload["name"],
                    move_type=payload["move_type"],
                    special=None if not payload.get("special") else payload["special"]["id"],
                    tier=payload["tier"],
                    hit=payload["hit"]
                )
                session.add(move)
                session.commit()

            return move
        except Exception as e:
            abort(503, message=f"Error creating move: {str(e)}")
