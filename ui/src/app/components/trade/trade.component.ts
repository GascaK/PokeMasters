import { Component, Input, OnInit } from '@angular/core';

import { PokemonMaster } from 'src/app/interfaces/pokeMaster';
import { PokemonTemplate } from 'src/app/interfaces/pokemon';
import { Trades, FullTradeObject } from 'src/app/interfaces/trainer';

import { MenuService } from 'src/app/services/menuService';
import { ServerService } from 'src/app/services/serverService';
import { TrainerTracker } from 'src/app/services/trainerTracker';


@Component({
  selector: 'app-trade',
  templateUrl: './trade.component.html',
  styleUrls: ['./trade.component.css']
})
export class TradeComponent {
  @Input() trainerTracker: TrainerTracker;
  @Input() serverService: ServerService;
  @Input() menuService: MenuService;

  public trainer: PokemonMaster;
  public trades: Array<FullTradeObject> = [];
  public yourTrades: Array<FullTradeObject> = [];

  async ngOnInit(): Promise<void> {
    this.trainer = await this.trainerTracker.getTrainer();

    this.serverService.getTrades(this.trainer.id)
      .then( (trades) => {

        trades.forEach( async (trade) => {
          const pkmn_one = trade.id_one === -1 ? null : await this.serverService.getPokemon(trade.id_one);
          const pkmn_two = trade.id_two === -1 ? null : await this.serverService.getPokemon(trade.id_two);

          if ( (pkmn_one && pkmn_one.owner === this.trainer.id) || (pkmn_two && pkmn_two.owner === this.trainer.id)) {
            this.yourTrades.push({
              id: trade.id!,
              pkmn_one: pkmn_one,
              pkmn_two: pkmn_two,
              state_one: trade.state_one,
              state_two: trade.state_two
            });
          } else {
            this.trades.push({
              id: trade.id!,
              pkmn_one: pkmn_one,
              pkmn_two: pkmn_two,
              state_one: trade.state_one,
              state_two: trade.state_two
            });
          }

        })

      })
      .catch( (err) => {
        console.error(err);
      });
  }

  logs(trade: FullTradeObject): void {
    console.log(trade);
  }

  updateTrade(trade: FullTradeObject): void {
    if (trade.pkmn_one && trade.pkmn_one.owner === this.trainer.id) {
      if (trade.state_one === 1) {
        trade.state_one = 2;
      }
    } else if (trade.pkmn_two && trade.pkmn_two.owner === this.trainer.id) {
      if (trade.state_two === 1) {
        trade.state_two = 2;
      }
    } else {
      console.error("Invalid trade");
      return;
    }

    const pendingTrade = {
      id: trade.id!,
      id_one: trade.pkmn_one!.id,
      id_two: trade.pkmn_two!.id,
      state_one: trade.state_one,
      state_two: trade.state_two
    };

    if (pendingTrade.state_one === 2 && pendingTrade.state_two === 2) {
      // this.serverService.completeTrade(this.trainer.id, trade.pkmn_one!)
      // .then( (res) => {
      //   console.log(res);
      // })
      // .catch( (err) => {
      //   console.error(err);
      // });
    }
    this.serverService.updateTrades(this.trainer.id, pendingTrade)
    .then( (res) => {
      console.log(res);
    })
    .catch( (err) => {
      console.error(err);
    });
  }

}
