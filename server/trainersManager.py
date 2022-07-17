from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask (__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database/trainers.sqlite3'

dbTrainer = SQLAlchemy(app)

class trainers(dbTrainer.Model):
   id = dbTrainer.Column(dbTrainer.Integer, primary_key = True)
   name = dbTrainer.Column(dbTrainer.String(100))
   dollars = dbTrainer.Column(dbTrainer.Integer)
   badges = dbTrainer.Column(dbTrainer.Integer)
