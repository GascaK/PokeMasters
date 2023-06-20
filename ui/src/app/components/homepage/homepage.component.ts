import { Component, Input, OnInit } from '@angular/core';
import { PokemonMaster } from 'src/app/interfaces/pokeMaster';
import ServerService from 'src/app/services/serverService';
import { TrackerService } from 'src/app/services/trackingService';

@Component({
    selector: 'app-homepage',
    templateUrl: './homepage.component.html',
    styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
    @Input() trainerTracker: TrackerService;
    public serverService = new ServerService();
    public legendary: boolean;
    public choosingStarter = false;
    public trainer: PokemonMaster;
    public interval: any;

    ngOnInit(): void {
        this.trainer = this.trainerTracker.getMaster();
        this.legendary = false;
        this.choosingStarter = false;
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
                console.log(pokemon);
                this.trainer.catchPokemon(pokemon);
                this.trainer.activePokemon = pokemon;
            })
            .catch( (err) => {
                console.log(err);
                alert(err);
            });
    }
}
