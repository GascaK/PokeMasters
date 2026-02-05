import { Component, Input, OnInit } from '@angular/core';
import { PokemonMaster } from 'src/app/interfaces/pokeMaster';

import statusEffects from 'src/app/components/info/status_effects.json';
import { TrainerTracker } from 'src/app/services/trainerTracker';
import { MenuService } from 'src/app/services/menuService';


@Component({
    selector: 'app-info',
    templateUrl: './info.component.html',
    styleUrls: ['./info.component.css']
})
export class InfoComponent implements OnInit {
    @Input() trainerTracker: TrainerTracker;
    @Input() menuService: MenuService;

    public trainer: PokemonMaster;
    public statuses: Array<{name: string, text: string}> = statusEffects.status_effects;
    public nameString: string;
    public loading: boolean = true;
    public randomNames = [
        "Backpacker",
        "Delinquent",
        "Festival Goer",
        "Hiker",
        "Poke Maniac",
        ":( Not Pokemon Master"
    ]

    async ngOnInit() {
        if (this.trainerTracker?.isLoggedIn())
        {
            this.trainer = await this.trainerTracker.getTrainer();
        }

        const randomIndex = Math.floor(Math.random() * this.randomNames.length);
        let pre_name = this.randomNames[randomIndex];
        
        if (this.trainer.name === "Kevin") {
            pre_name = "Pokemon Master";
        }
        this.nameString = `${pre_name} ${this.trainer.name}`;
        this.loading = false;
    }

    onSubmit(badges: string, tier: string) {
        const checkedBadge = parseInt(badges);
        
        if (!isNaN(checkedBadge) && checkedBadge >= 0 && checkedBadge <= 8) {
            this.trainer.setBadges(checkedBadge);
        } else {
            alert(`Invalid Value for badge: ${badges}`);
        }

        this.menuService.setNewView("defaultView");
    }
}
