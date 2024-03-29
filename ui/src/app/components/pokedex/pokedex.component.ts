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
    public validated: Array<PokemonTemplate> = [];
    public sortedPokemon: Map<number, {name: string, count: number}> = new Map;
    public finalPokedex: Map<number, {name: string, count: number}>;
    interval: any;

    ngOnInit() {
        if (this.trainerTracker?.isMasterSet())
        {
            this.trainer = this.trainerTracker.getMaster();
            
            if (this.trainer.pokemon) {
                this.trainer.pokemon.forEach( (mon) => {
                    let count = 1;
                    if (this.sortedPokemon.has(mon.pokedex)) {
                        count = this.sortedPokemon.get(mon.pokedex)!.count + 1;
                    }
                    this.sortedPokemon.set(mon.pokedex, {
                        name: mon.name,
                        count: count
                    });
                });
                this.finalPokedex = new Map([...this.sortedPokemon.entries()].sort());
                console.log(this.finalPokedex);
            }

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
                this.validated.push(value.data);
            }
        })
    }

    async evolve(mons: Array<PokemonTemplate>) {
        if (this.validated.length >= 3) {
            await this.trainer.evolvePokemon(mons)
                .then( (newPokemonID) => {
                    this.trainer.pokemon.forEach( (pokemon) => {
                        if (newPokemonID == pokemon._id) {
                            this.trainer.activePokemon = pokemon;
                        }
                    })
                });
                this.exitView();
        } else {
            console.log("Not enough selected");
            alert("Warning: Stop cheating..");
        }
        this.exitInfoPanel();
    }

    validateBenchCapacity(pokemon: PokemonTemplate): boolean {
        if (pokemon._id == this.trainer.activePokemon?._id) {
            return false;
        } else if (pokemon._id == this.trainer.benchOne?._id) {
            return false;
        } else if (pokemon._id == this.trainer.benchTwo?._id) {
            return false;
        }
        return true;
    }

    sendToBench(pokemon: PokemonTemplate) {
        console.log(pokemon._id);
        this.trainer.activePokemon = pokemon;
        this.exitView();
    }

    exitInfoPanel() {
        this.infoList = [];
        this.moreInformation = false;
    }

    exitView() {
        this.trainerTracker.setNewView("defaultView");
    }
}
