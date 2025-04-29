import json
from flask import request
from flask_restful import Resource, fields, marshal_with, abort

from services.alchemy_loader import Session
from interfaces.models import Specials

special_resource = {
    "id": fields.Integer,
    "name": fields.String,
    "text": fields.String
}


class SpecialsManager:
    def get_all_specials(self):
        """Get all specials from the database"""
        with Session() as session:
            return session.query(Specials).all()

    def get_special_by_id(self, id):
        """Get a special by its ID"""
        with Session() as session:
            return session.query(Specials).filter_by(id=id).first()
    
    def put_special(self, id, name, text):
        '''Add a new special to the database or update an existing one'''
        with Session() as session:
            new_special = Specials(id=id, name=name, text=text)
            if session.query(Specials).filter_by(id=id).first():
                session.delete(session.query(Specials).filter_by(id=id).first())

            session.add(new_special)
            session.commit()
            return new_special

class SpecialLocator(Resource):
    @marshal_with(special_resource)
    def get(self, id):
        specials_manager = SpecialsManager()
        special = specials_manager.get_special_by_id(id)
        
        if special:
            return special
        return {"error": f"Special with ID {id} not found"}, 404
    
    @marshal_with(special_resource)
    def put(self, id):
        payload = json.loads(request.get_json())
        if not payload or type(payload) != dict:
            abort(400, message="Invalid payload.")

        specials_manager = SpecialsManager()
        special = specials_manager.put_special(payload.get("id"), payload.get("name"), payload.get("text"))
        return special
