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
        const atm = this.randomInt(200, 500);
        const tier = this.trainer.getCurrentTier();
        const deposit = atm * tier;

        this.trainer.getDollars(deposit);
        alert(`Got $${deposit}`);
        this.exit();
    }

    beatGymLeader(): void {
        const atm = this.randomInt(500, 1000);
        const tier = this.trainer.getCurrentTier()
        const deposit = atm * tier;

        this.trainer.getDollars(deposit);
        alert(`Got $${deposit}`);
        this.exit();
    }

    beatTrainer(): void {
        const atm = this.randomInt(400, 800);
        const tier = this.trainer.getCurrentTier()
        const deposit = atm * tier;

        this.trainer.getDollars(deposit);
        alert(`Got $${deposit}`);
        this.exit();
    }

    randomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    async randomItem() {
        const item = await this.trainer.getRandomItem(this.trainer.getCurrentTier());
        alert(`Got Item: ${item.name}`);
        this.exit();
    }

    exit(): void {
        this.menuService.setNewView("defaultView");
    }
}