import { Component, Input, OnInit } from '@angular/core';
import { PokemonMaster } from 'src/app/interfaces/pokeMaster';

import { MenuService } from 'src/app/services/menuService';
import { ServerService } from 'src/app/services/serverService';
import { TrainerTracker } from 'src/app/services/trainerTracker';

@Component({
    selector: 'app-battle',
    templateUrl: './battle.component.html',
    styleUrls: ['./battle.component.css']
})
export class BattleComponent{
    @Input() trainerTracker: TrainerTracker;
    @Input() menuService: MenuService;
    @Input() serverService: ServerService;

    public trainer: PokemonMaster;

    async ngOnInit() {
        if (this.trainerTracker?.isLoggedIn())
        {
            this.trainer = await this.trainerTracker.getTrainer();
        }
    }

    randomMoney(): void {
        const dollars = this.randomInt(500, 1500);
        this.trainer.getDollars(dollars);
        alert(`Got $${dollars}`);
        this.exit();
    }

    beatGymLeader(): void {
        const tier = this.trainer.getCurrentTier()
        const x = tier == 1 ? 500 : tier == 2 ? 1000 : 1500;
        const y = x + 1000;

        const dollars = this.randomInt(x, y);
        this.trainer.getDollars(dollars);
        alert(`Got $${dollars}`);
        this.exit();
    }

    beatTrainer(): void {
        const dollars = this.randomInt(400, 800);

        this.trainer.getDollars(dollars);
        alert(`Got $${dollars}`);
        this.exit();
    }

    randomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    exit(): void {
        this.menuService.setNewView("defaultView");
    }
}