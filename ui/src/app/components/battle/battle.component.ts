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
        const baseAmount = this.randomInt(300, 700);
        const tier = this.trainer.getCurrentTier();
        const tierMultiplier = Math.pow(1.75, tier - 1);
        const tierBonus = tier * 150;
        const deposit = Math.floor((baseAmount * tierMultiplier) + tierBonus);

        this.trainer.getDollars(deposit);
        alert(`Got $${deposit}`);
        this.exit();
    }

    beatGymLeader(): void {
        const baseAmount = this.randomInt(500, 1000);
        const tier = this.trainer.getCurrentTier();
        // More aggressive scaling for gym leaders
        const tierMultiplier = Math.pow(2, tier - 1);
        const tierBonus = tier * 250; // Higher bonus for gym leaders
        const deposit = Math.floor((baseAmount * tierMultiplier) + tierBonus);

        this.trainer.getDollars(deposit);
        alert(`Got $${deposit}`);
        this.exit();
    }

    beatTrainer(): void {
        const baseAmount = this.randomInt(400, 800);
        const tier = this.trainer.getCurrentTier();
        // Moderate scaling for regular trainers
        const tierMultiplier = Math.pow(1.75, tier - 1);
        const tierBonus = tier * 150; // Moderate bonus for trainers
        const deposit = Math.floor((baseAmount * tierMultiplier) + tierBonus);

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