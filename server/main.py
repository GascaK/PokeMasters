from flask import Flask
from flask_sqlalchemy import SQLAlchemy

from trainersManager import dbTrainer


@app.route('/trainer/<trainerID>')
def hello_world():
   return 'Hello World'

if __name__ == '__main__':
   app.run()