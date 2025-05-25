import { Component, Input, OnInit } from '@angular/core';

import { PokemonMaster } from 'src/app/interfaces/pokeMaster';
import { Trades } from 'src/app/interfaces/trainer';

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
  public trades: Array<Trades>;

  async ngOnInit(): Promise<void> {
    this.trainer = await this.trainerTracker.getTrainer();

    this.serverService.getTrades(this.trainer.id)
      .then( (trades) => {
        this.trades = trades;
      })
      .catch( (err) => {
        console.error(err);
      });
  }
}
