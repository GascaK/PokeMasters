from .database import db

class PokemonBase(db.Model):
    __tablename__ = "pokemonBase"
    _id = db.Column("id", db.Integer, primary_key=True)
    name  = db.Column("name", db.String(100))
    type1 = db.Column("type1", db.String(30))
    type2 = db.Column("type2", db.String(30))
    hp = db.Column("hp", db.Integer)
    tier  = db.Column("tier", db.Integer)
    speed = db.Column("speed", db.Integer)

    def __init__(self, _id, name, type1, type2, hp, tier, speed):
        self._id = _id
        self.name = name
        self.type1 = type1
        self.type2 = type2
        self.hp = hp
        self.tier = tier
        self.speed = speed

    def __repr__(self):
        return f'{self._id}: {self.name} type: {self.type1}/{self.type2}, hp: {self.hp} w/ s: {self.speed} @ tier {self.tier}'

class pokemon(db.Model):
    __tablename__ = "pokemon"
    _id = db.Column("id", db.Integer, primary_key = True)
    pokedex = db.Column("pokedex", db.Integer)
    trainerID = db.Column("trainerID", db.Integer)
    name  = db.Column("name", db.String(100))
    type1 = db.Column("type1", db.String(30))
    type2 = db.Column("type2", db.String(30))
    hp = db.Column("hp", db.Integer)
    tier  = db.Column("tier", db.Integer)
    move1 = db.Column("move1", db.Integer)
    move2 = db.Column("move2", db.Integer)
    speed = db.Column("speed", db.Integer)

    def __init__(self, trainerID, pokedex, name, type1, type2, hp, tier, move1, move2, speed):
        self.trainerID = trainerID
        self.pokedex = pokedex
        self.name = name
        self.type1 = type1
        self.type2 = type2
        self.hp = hp
        self.tier = tier
        self.move1 = move1
        self.move2 = move2
        self.speed = speed

    def __repr__(self) -> str:
        return f'{self._id}: {self.name} type: {self.type1} / {self.type2}, hp: {self.hp} w/ s: {self.speed} \
            {self.move1} {self.move2} @ tier {self.tier}'

class trainers(db.Model):
    _id = db.Column("id", db.Integer, primary_key = True)
    name = db.Column("name", db.String(100))
    dollars = db.Column("dollars", db.Integer)
    badges = db.Column("badges", db.Integer)
    poke1 = db.Column("poke1", db.Integer)
    poke2 = db.Column("poke2", db.Integer)
    poke3 = db.Column("poke3", db.Integer)

    def __init__(self, name):
        self.name = name
        self.poke1 = 0
        self.poke2 = 0
        self.poke3 = 0
        self.dollars = 0
        self.badges  = 0

    def __repr__(self):
        return f'{self._id}: {self.name} ${self.dollars} and {self.badges} badges. \
    Their pokemon are: {self.poke1}, {self.poke2}, {self.poke3}'

class trainerItems(db.Model):
    _id = db.Column("id", db.Integer, primary_key = True)
    name = db.Column("name", db.String(100))
    cost = db.Column("cost", db.Integer)
    text = db.Column("text", db.String(200))
    owner = db.Column("owner", db.Integer, db.ForeignKey("trainers.id"))

    trainer = db.relationship("trainers", backref=db.backref('items', lazy='dynamic'))

    def __init__(self, name, cost, text, owner):
        self.name = name
        self.cost = cost
        self.text = text
        self.owner = owner

class PokeMoves(db.Model):
    __tablename__ = "PokeMoves"

    _id = db.Column("id", db.Integer, primary_key = True)
    name  = db.Column("name", db.String(100))
    mType = db.Column("type", db.String(10))
    special = db.Column("special", db.String(20))
    tier = db.Column("tier", db.Integer)
    hit  = db.Column("hit",  db.Integer)

    def __init__(self, id, name, mType, special, tier, hit):
        self._id = id
        self.name  = name
        self.mType = mType
        self.special = special
        self.tier = tier
        self.hit  = hit

    def __repr__(self) -> str:
        return f'{self._id}: {self.name} {self.mType} {self.tier} {self.hit}'

class PokeItems(db.Model):
    __tablename__ = "PokeItems"
    _id = db.Column("id", db.Integer, primary_key=True)
    name = db.Column("name", db.String(50))
    cost = db.Column("cost", db.Integer)
    text = db.Column("text", db.String(200))

    def __init__(self, name, cost, text):
        self.name = name
        self.cost = cost
        self.text = text

    def __repr__(self) -> str:
        return f'{self._id}: {self.name} {self.cost} - {self.text}'