import json
from flask import request
from flask_restful import abort, fields, marshal_with, Resource
from services.alchemy_loader import Session
from interfaces.models import Pokemon, Move


class PokemonLocator(Resource):
    """Resource for handling Pokemon CRUD operations at /pokemon/<id>."""

    def get(self, id: int):
        """Retrieve a Pokemon by ID."""
        with Session() as session:
            pokemon = session.query(Pokemon).filter_by(id=id).first()

        if not pokemon:
            abort(404, message=f"Unable to locate pokemon with ID: {id}")

        return pokemon.toJSON(), 200
    
    def patch(self, id: int):
        """Update specific fields of a Pokemon."""
        try:
            payload = json.loads(request.get_json())
            if not isinstance(payload, dict):
                abort(400, message="Invalid payload. Expected a JSON object.")

            with Session() as session:
                pokemon = session.query(Pokemon).filter_by(id=id).first()
                if not pokemon:
                    abort(404, message=f"Unable to locate pokemon with ID: {id}")

                # Update fields if they exist in payload
                if "owner" in payload:
                    pokemon.owner = payload["owner"]
                if "speed" in payload:
                    pokemon.speed = payload["speed"]
                if "hp" in payload:
                    pokemon.hp = payload["hp"]
                if "moves" in payload and len(payload["moves"]) >= 2:
                    pokemon.move1 = payload["moves"][0]
                    pokemon.move2 = payload["moves"][1]

                session.add(pokemon)
                session.commit()

            return pokemon.toJSON(), 200
        except Exception as e:
            abort(400, message=f"Error updating Pokemon: {str(e)}")

    def put(self, id: int):
        """Create or replace a Pokemon with the given ID."""
        try:
            payload = json.loads(request.get_json())
            if not payload:
                abort(400, message="Invalid payload.")

            # Extract stats from payload
            stats_map = {stat["name"]: stat for stat in payload.get("stats", [])}
            
            # Create Pokemon instance with data from payload
            pokemon = Pokemon(
                dex_id=payload["base"]["dex_id"],
                owner=payload["owner"],
                name=payload["base"]["name"],
                tier=payload["base"]["tier"],
                shiny=payload["sprite"]["shiny"],
                sprite_url=payload["sprite"]["sprite_url"],
                hp=stats_map.get("hp", {}).get("value", 0),
                hp_mod=stats_map.get("hp", {}).get("mod", 0),
                speed=stats_map.get("speed", {}).get("value", 0),
                speed_mod=stats_map.get("speed", {}).get("mod", 0),
                special=stats_map.get("special", {}).get("value", 0),
                special_mod=stats_map.get("special", {}).get("mod", 0),
                physical=stats_map.get("physical", {}).get("value", 0),
                physical_mod=stats_map.get("physical", {}).get("mod", 0),
                catch_rate=payload["base"]["catch_rate"],
                type1=payload["base"]["types"][0],
                type2=payload["base"]["types"][-1] if len(payload["base"]["types"]) > 1 else "",
                move1=payload["moves"][0]["id"],
                move2=payload["moves"][1]["id"]
            )

            with Session() as session:
                session.add(pokemon)
                session.commit()

            return pokemon.toJSON(), 200
        except Exception as e:
            return {"error": str(e)}, 503

    def delete(self, id: int):
        """Delete a Pokemon by ID."""
        try:
            with Session() as session:
                pokemon = session.query(Pokemon).filter_by(id=id).first()
                if not pokemon:
                    abort(404, message=f"Unable to locate pokemon with ID: {id}")
                    
                session.delete(pokemon)
                session.commit()
                
            return {"message": f"Pokemon {id} deleted successfully"}, 200
        except Exception as e:
            abort(500, message=f"Error deleting Pokemon: {str(e)}")


# Move resource fields for marshalling
move_resource = {
    'id': fields.Integer,
    'name': fields.String,
    'tier': fields.Integer,
    'move_type': fields.String,
    'special': fields.String,
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
                    special=None if not payload.get("special") else payload["special"]["text"],
                    tier=payload["tier"],
                    hit=payload["hit"]
                )
                session.add(move)
                session.commit()

            return move
        except Exception as e:
            abort(503, message=f"Error creating move: {str(e)}")