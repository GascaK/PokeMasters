import json
from sqlalchemy import Column, Integer, String, ForeignKey, Boolean

from services.alchemy_loader import Base


class Pokemon(Base):
    __tablename__ = "pokemon"

    id = Column("id", Integer, primary_key = True)
    dex_id = Column("dex_id", Integer)
    owner = Column("owner", Integer)
    name  = Column("name", String(100))
    type1 = Column("type1", String(30))
    type2 = Column("type2", String(30))
    hp = Column("hp", Integer)
    hp_mod = Column("hp_mod", Integer)
    speed = Column("speed", Integer)
    speed_mod = Column("speed_mod", Integer)
    special = Column("special", Integer)
    special_mod = Column("special_mod", Integer)
    physical = Column("physical", Integer)
    physical_mod = Column("physical_mod", Integer)
    catch_rate = Column("catch_rate", Integer)
    shiny = Column("shiny", Boolean)
    sprite_url = Column("sprite_url", String(50))
    tier  = Column("tier", Integer)
    move1 = Column("move1", Integer)
    move2 = Column("move2", Integer)

    def __init__(self, owner, dex_id, name, type1, type2, hp, hp_mod, shiny, sprite_url, catch_rate, tier, move1, move2, speed, speed_mod, special, special_mod, physical, physical_mod):
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
                {
                    "name": "hp",
                    "value": self.hp,
                    "mod": self.hp_mod,
                },
                {
                    "name": "speed",
                    "value": self.speed,
                    "mod": self.speed_mod,
                },
                {
                    "name": "special",
                    "value": self.special,
                    "mod": self.special_mod,
                },
                {
                    "name": "physical",
                    "value": self.physical,
                    "mod": self.physical_mod,
                }
            ],
            "moves": [self.move1, self.move2],
            "types": [self.type1, self.type2],
            "shiny": self.shiny,
            "sprite_url": self.sprite_url,
            "catch_rate": self.catch_rate
        }

    def __repr__(self) -> str:
        return f'{self.id}: {self.dex_id} {self.name} type: {self.type1} / {self.type2}, \
            hp: {self.hp}  sp: {self.speed} \
            {self.move1} {self.move2} @ tier {self.tier}'


class Moves(Base):
    __tablename__ = "moves"

    id = Column("id", Integer, primary_key = True)
    name  = Column("name", String(50))
    move_type = Column("type", String(10))
    special = Column("special", String(100))
    tier = Column("tier", Integer)
    hit  = Column("hit",  String(10))

    def __init__(self, name, move_type, special, tier, hit):
        self.name  = name
        self.move_type = move_type
        self.special = special
        self.tier = tier
        self.hit  = hit

    def __repr__(self) -> str:
        return f'{self.id}: {self.name} {self.move_type} {self.tier} {self.hit}'


class Items(Base):
    __tablename__ = "items"

    id = Column("id", Integer, primary_key = True)
    name = Column("name", String(100))
    cost = Column("cost", Integer)
    tier = Column("tier", Integer)
    text = Column("text", String(200))
    owner = Column("owner", Integer)

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


class Player(Base):
    __tablename__ = "players"

    id = Column("id", Integer, primary_key = True)
    name = Column("name", String(100))
    dollars = Column("dollars", Integer)
    badges = Column("badges", Integer)

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

    def __repr__(self) -> str:
        return f"#{self.id} {self.name}: ${self.dollars} and #{self.badges} badges."
