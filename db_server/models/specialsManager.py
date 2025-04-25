from flask_restful import Resource, fields, marshal_with

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

    def get_special_by_id(self, special_id):
        """Get a special by its ID"""
        with Session() as session:
            return session.query(Specials).filter_by(id=special_id).first()
    
    def put_special(self, special_name, special_text):
        '''Add a new special to the database'''
        with Session() as session:
            new_special = Specials(name=special_name, text=special_text)
            session.add(new_special)
            session.commit()
            return new_special

class SpecialLocator(Resource):
    @marshal_with(special_resource)
    def get(self, special_id):
        specials_manager = SpecialsManager()
        special = specials_manager.get_special_by_id(special_id)
        
        if special:
            return special
        return {"error": f"Special with ID {special_id} not found"}, 404
    
    @marshal_with(special_resource)
    def put(self, special_name, special_text):
        specials_manager = SpecialsManager()
        special = specials_manager.put_special(special_name, special_text)
        return special
