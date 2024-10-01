from pydantic import BaseModel


class ItemModel(BaseModel):
    id: int | None = None
    name: str
    text: str
    cost: int
    tier: int
    owner: int | None = None

class SpecialModel(BaseModel):
    id: int | None = None
    name: str
    text: str

class MoveModel(BaseModel):
    id: int = None
    name: str
    tier: int
    hit: str
    move_type: str
    special: SpecialModel | None

class StatsModel(BaseModel):
    name: str
    mod:  int
    value: int

class SpriteModel(BaseModel):
    shiny: bool
    sprite_url: str

class PokemonBaseModel(BaseModel):
    dex_id: int
    name: str
    tier: int
    catch_rate: int
    hp: int
    speed: int
    special: int
    physical: int
    types: list[str]
    url_shiny: str
    url_default: str
    evolutions: list[int] = []

class PokemonModel(BaseModel):
    id: int | None = None
    owner: int | None = 0
    moves: list[MoveModel]
    stats: list[StatsModel]
    items: list[ItemModel | None] = []
    sprite: SpriteModel
    base:   PokemonBaseModel

class PlayerModel(BaseModel):
    id: int | None = None
    name: str
    badges: int
    dollars: int