from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_restful import abort, Api, Resource, fields, marshal_with, reqparse

app = Flask (__name__)
api = Api(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database/trainers.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class trainers(db.Model):
   _id = db.Column("id", db.Integer, primary_key = True)
   name = db.Column("name", db.String(100))
   dollars = db.Column("dollars", db.Integer)
   badges = db.Column("badges", db.Integer)

   def __init__(self, name):
      self.name = name
      self.dollars = 0
      self.badges  = 0

   def __repr__(self):
      return f'{self._id}: {self.name} ${self.dollars} and {self.badges} badges.'


trainer_resource = {
   '_id': fields.Integer,
   'name': fields.String,
   'dollars': fields.Integer,
   'badges': fields.Integer,
}
class TrainerController(Resource):
   def __init__(self, **kwargs):
      self.reqparse = reqparse.RequestParser()
      self.reqparse.add_argument('name', type=str, default='', required=False, location='args')
      self.reqparse.add_argument('dollars', type=int, default=0, required=False, location='args')
      self.reqparse.add_argument('badges', type=int, default=0, required=False, location='args')

   @marshal_with(trainer_resource)
   def get(self, trainerID: int):
      player = trainers.query.filter_by(_id=trainerID).first()
      if player:
         print(player)
         return player
      abort(401, message=f"No trainer found for trainer id: {trainerID}")

   def post(self, trainerID: int):
      args = self.reqparse.parse_args()
      player = trainers.query.filter_by(_id=trainerID).first()
      if player:
         player.badges = args['badges'] or player.badges
         player.dollars = args['dollars'] or player.dollars
         db.session.commit()
      else:
         abort(400, message="Unable to save trainer data.")

if __name__ == "__main__":
   if input("Are you sure? This will drop your database (y/n): ").lower() == 'y':
      trainers.__table__.drop(db.engine)
      db.create_all()

      gamers = ["Kevin", "Chris", "Kenneth", "Erick"]
      for player in gamers:
         new_trainer = trainers(player)
         db.session.add(new_trainer)
      db.session.commit()
      print(trainers.query.all())
   else:
      print("Nothing created, exiting.")