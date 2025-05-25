from fastapi import APIRouter, Depends, Request

from src.interfaces.models import TradesModel
from src.assets.compile import Composer


def get_composer(request: Request):
    return request.app.state.composer

router = APIRouter(
    prefix="/api/v1/{username}/trades",
    tags=["index"],
    responses={404: {"description": "Not found"}}
)

@router.get("/all", tags=["trades"])
def get_trades(username: int, trade_id: int=None, composer: Composer = Depends(get_composer)):
    trades = composer.get_player_builder().get_trades(username, trade_id=trade_id)
    return trades

@router.patch("/update", tags=["trades"])
def patch_trades(username: int, trade: TradesModel, composer: Composer = Depends(get_composer)):
    trades = composer.get_player_builder().update_trades(username, trade)

    return trades