import { Component, Input, OnInit } from '@angular/core';
import { PokemonMaster } from 'src/app/interfaces/pokeMaster';
import { PokemonTemplate } from 'src/app/interfaces/pokemon';
import { TrackerService } from 'src/app/services/trackingService';

@Component({
    selector: 'app-pokedex',
    templateUrl: './pokedex.component.html',
    styleUrls: ['./pokedex.component.css']
})
export class PokedexComponent implements OnInit {
    @Input() trainerTracker: TrackerService;
    public trainer: PokemonMaster;
    public moreInformation = false;
    public infoList: {data: PokemonTemplate, checked: boolean}[] = [];
    public validated: Array<number> = [];
    interval: any;

    ngOnInit() {
        if (this.trainerTracker?.isMasterSet())
        {
            this.trainer = this.trainerTracker.getMaster();
            this.interval = setInterval(() => {
                this.validated = [];
                this.trackChecked();
            }, 1000);
        }
    }

    moreInfo(id: number) {
        this.moreInformation = true;
        this.trainer.pokemon.forEach((pokemon: PokemonTemplate) => {
            if(pokemon.pokedex == id) {
                this.infoList.push({
                    data: pokemon,
                    checked: false
                });
            }
        });
    }

    trackChecked() {
        this.infoList.forEach( (value) => {
            if(value.checked) {
                this.validated.push(value.data._id);
            }
        })
    }

    evolve() {
        if (this.validated.length >= 3) {
            console.log("Evolving..");
        }
        this.exitInfoPanel();
    }

    sendToBench(id: number) {
        console.log(id);
    }

    exitInfoPanel() {
        this.infoList = [];
        this.moreInformation = false;
    }

    exitView() {
        this.trainerTracker.setNewView("defaultView");
    }
}
