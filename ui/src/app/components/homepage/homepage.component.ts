import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { PokemonMaster } from 'src/app/interfaces/pokeMaster';
import { PokemonTemplate } from 'src/app/interfaces/pokemon';

//import { ActiveComponent } from '../active/active.component';

import { MenuService } from 'src/app/services/menuService';
import { ServerService } from 'src/app/services/serverService';
import { TrainerTracker } from 'src/app/services/trainerTracker';

@Component({
    selector: 'app-homepage',
    templateUrl: './homepage.component.html',
    styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
    //@ViewChild(ActiveComponent, {static: false}) childC: ActiveComponent;
    @Input() trainerTracker: TrainerTracker;

    public serverService = new ServerService();
    public menuService = new MenuService

    public legendary = false;
    public trainer: PokemonMaster;
    public interval: any;

    public active: PokemonTemplate | undefined;
    public bench: Array<PokemonTemplate | undefined>;

    async ngOnInit(): Promise<void> {
        this.legendary = false;
        this.trainer = await this.trainerTracker.getTrainer();
    }

    setView(view: string) {
        this.menuService.setNewView(view);
    }

    encounterLegendary() {
        this.legendary = true;
        this.menuService.setNewView("encounterView");
    }

    setBench(pokemon: PokemonTemplate | undefined, index: number) {
        if (this.bench[index]) {
            this.active = this.bench[index];
            this.bench[index] = pokemon;
        } else {
            this.bench[index] = pokemon;
            this.active = undefined;
            this.menuService.setNewView("dexView");
        }
        //this.childC.update();
    }

}
