import json
from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from services.alchemy_loader import Base


class Pokemon(Base):
    __tablename__ = "pokemon"

    id = Column(Integer, primary_key=True)
    dex_id = Column(Integer)
    owner = Column(Integer)
    name = Column(String(100))
    type1 = Column(String(30))
    type2 = Column(String(30))
    hp = Column(Integer)
    hp_mod = Column(Integer)
    speed = Column(Integer)
    speed_mod = Column(Integer)
    special = Column(Integer)
    special_mod = Column(Integer)
    physical = Column(Integer)
    physical_mod = Column(Integer)
    catch_rate = Column(Integer)
    shiny = Column(Boolean)
    sprite_url = Column(String(50))
    tier = Column(Integer)
    move1 = Column(Integer)
    move2 = Column(Integer)

    def __init__(self, owner, dex_id, name, type1, type2, hp, hp_mod, shiny, sprite_url, catch_rate, 
                 tier, move1, move2, speed, speed_mod, special, special_mod, physical, physical_mod):
        self.owner = owner
        self.dex_id = dex_id
        self.name = name
        self.type1 = type1
        self.type2 = type2
        self.hp = hp
        self.hp_mod = hp_mod
        self.speed = speed
        self.speed_mod = speed_mod
        self.special = special
        self.special_mod = special_mod
        self.physical = physical
        self.physical_mod = physical_mod
        self.shiny = shiny
        self.sprite_url = sprite_url
        self.catch_rate = catch_rate
        self.tier = tier
        self.move1 = move1
        self.move2 = move2

    def toJSON(self):
        return {
            "id": self.id,
            "dex_id": self.dex_id,
            "owner": self.owner,
            "name": self.name,
            "tier": self.tier,
            "stats": [
                {"name": "hp", "value": self.hp, "mod": self.hp_mod},
                {"name": "speed", "value": self.speed, "mod": self.speed_mod},
                {"name": "special", "value": self.special, "mod": self.special_mod},
                {"name": "physical", "value": self.physical, "mod": self.physical_mod}
            ],
            "moves": [self.move1, self.move2],
            "types": [self.type1, self.type2],
            "shiny": self.shiny,
            "sprite_url": self.sprite_url,
            "catch_rate": self.catch_rate
        }

    def __repr__(self):
        return (f"Pokemon(id={self.id}, name={self.name}, dex_id={self.dex_id}, "
                f"types={self.type1}/{self.type2}, tier={self.tier})")

class Specials(Base):
    __tablename__ = "specials"

    id = Column(Integer, primary_key=True)
    name = Column(String(50))
    text = Column(String(100))

    def __init__(self, id, name, text):
        self.id = id
        self.name = name
        self.text = text

class Move(Base):
    __tablename__ = "moves"

    id = Column(Integer, primary_key=True)
    name = Column(String(50))
    move_type = Column("type", String(10))
    special = Column(Integer)
    tier = Column(Integer)
    hit = Column(String(10))

    def __init__(self, name, move_type, special, tier, hit):
        self.name = name
        self.move_type = move_type
        self.special = special
        self.tier = tier
        self.hit = hit

    def toJSON(self):
        return {
            "id": self.id,
            "name": self.name,
            "move_type": self.move_type,
            "special": self.special,
            "tier": self.tier,
            "hit": self.hit
        }

    def __repr__(self):
        return f"Move(id={self.id}, name={self.name}, type={self.move_type}, tier={self.tier})"

class Items(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    cost = Column(Integer)
    tier = Column(Integer)
    text = Column(String(200))
    owner = Column(Integer)

    def __init__(self, name, cost, text, tier, owner=-1):
        self.name = name
        self.cost = cost
        self.text = text
        self.tier = tier
        self.owner = owner
    
    def toJSON(self):
        return {
            "id": self.id,
            "name": self.name,
            "cost": self.cost,
            "text": self.text,
            "tier": self.tier,
            "owner": self.owner
        }

    def __repr__(self):
        return f"Item(id={self.id}, name={self.name}, tier={self.tier}, owner={self.owner})"

class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    dollars = Column(Integer)
    badges = Column(Integer)

    def __init__(self, name, badges, dollars):
        self.name = name
        self.badges = badges
        self.dollars = dollars
    
    def toJSON(self):
        return {
            "id": self.id,
            "name": self.name,
            "dollars": self.dollars,
            "badges": self.badges
        }

    def __repr__(self):
        return f"Player(id={self.id}, name={self.name}, dollars={self.dollars}, badges={self.badges})"