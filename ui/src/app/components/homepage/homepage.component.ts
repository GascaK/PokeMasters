import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { PokemonMaster } from 'src/app/interfaces/pokeMaster';
import { PokemonTemplate } from 'src/app/interfaces/pokemon';
import ServerService from 'src/app/services/serverService';
import { TrackerService } from 'src/app/services/trackingService';
import { ActiveComponent } from '../active/active.component';

@Component({
    selector: 'app-homepage',
    templateUrl: './homepage.component.html',
    styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
    @Input() trainerTracker: TrackerService;
    @ViewChild(ActiveComponent, {static: false}) childC: ActiveComponent;
    public serverService = new ServerService();
    public choosingStarter = false;
    public legendary = false;
    public trainer: PokemonMaster;
    public interval: any;

    ngOnInit(): void {
        this.legendary = false;
        this.choosingStarter = false;
        this.trainer = this.trainerTracker.getMaster();
        this.interval = setInterval(() => {
            if (this.trainer.pokemon.length == 0) {
                this.choosingStarter = true;
            } else {
                this.choosingStarter = false;
            }
        }, 1000);
    }

    setView(view: string) {
        this.trainerTracker.setNewView(view);
    }

    encounterLegendary() {
        this.legendary = true;
        this.trainerTracker.setNewView("encounterView");
    }

    async setStarter(id: number) {
        await this.serverService.getPokemonByID(id)
            .then( (pokemon) => {
                this.trainer.catchPokemon(pokemon);
                this.trainer.activePokemon = pokemon;
            })
            .catch( (err) => {
                console.log(err);
                alert(err);
            });
    }

    setBenchOne(pokemon: PokemonTemplate | undefined) {
        if (this.trainer.benchOne) {
            this.trainer.activePokemon = this.trainer.benchOne;
            this.trainer.benchOne = pokemon;
        } else {
            this.trainer.benchOne = pokemon;
            this.trainer.activePokemon = undefined;
            this.trainerTracker.setNewView("dexView");
        }
        this.trainer.saveAll();
        this.childC.update();
    }

    setBenchTwo(pokemon: PokemonTemplate | undefined) {
        if (this.trainer.benchTwo) {
            this.trainer.activePokemon = this.trainer.benchTwo;
            this.trainer.benchTwo = pokemon;
        } else {
            this.trainer.benchTwo = pokemon;
            this.trainer.activePokemon = undefined;
            this.trainerTracker.setNewView("dexView");
        }
        this.trainer.saveAll();
        this.childC.update();
    }
}
