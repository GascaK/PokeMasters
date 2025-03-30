import { Component, Input, OnInit } from '@angular/core';
import { PokemonMaster } from 'src/app/interfaces/pokeMaster';

import { MenuService } from 'src/app/services/menuService';
import { ServerService } from 'src/app/services/serverService';
import { TrainerTracker } from 'src/app/services/trainerTracker';

@Component({
    selector: 'app-homepage',
    templateUrl: './homepage.component.html',
    styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
    @Input() trainerTracker: TrainerTracker;

    public serverService = new ServerService();
    public menuService = new MenuService

    public legendary = false;
    public trainer: PokemonMaster;
    public interval: any;

    async ngOnInit(): Promise<void> {
        this.legendary = false;
        this.trainer = await this.trainerTracker.getTrainer();
    }

    setView(view: string) {
        this.legendary = false;
        this.menuService.setNewView(view);
    }

    encounterLegendary() {
        this.legendary = true;
        this.menuService.setNewView("encounterView");
    }

}
