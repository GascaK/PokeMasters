import { Component, Input, OnInit } from '@angular/core';
import { PokemonMaster } from 'src/app/interfaces/pokeMaster';
import { PokemonTemplate } from 'src/app/interfaces/pokemon';
import { TrackerService } from 'src/app/services/trackingService';

@Component({
    selector: 'app-encounter',
    templateUrl: './encounter.component.html',
    styleUrls: ['./encounter.component.css']
})
export class EncounterComponent implements OnInit{
    @Input() trainerTracker: TrackerService;
    @Input() legendary: boolean = false;
    public trainer: PokemonMaster;
    public wildPokemon: PokemonTemplate;
    public showPokemon = false;
    public itemList = new Map<string, {name: string, count: number, text: string}>; 
    public imgLoc: string;
    interval: any;

    async ngOnInit(): Promise<void> {
        if (this.trainerTracker?.isMasterSet()) {
            this.trainer = this.trainerTracker.getMaster();
            let inventory: number;
            this.trainer.items.forEach( (item) => {
                console.log(item);
                if (this.itemList.has(item.name)) {
                    inventory = this.itemList.get(item.name)!.count + 1;
                } else {
                    inventory = 1;
                }
                this.itemList.set(item.name, {
                    name: item.name,
                    count: inventory,
                    text: item.text
                })

            });
        }
        this.interval = setTimeout( async () => {
            this.showPokemon = true;
            const tier = this.legendary ? 4 : this.trainer.getCurrentTier();

            this.wildPokemon = await this.trainer.encounterRandomPokemonByTier(tier);
            this.loadCard(this.wildPokemon);
        }, 4000);
    }

    loadCard(pokemon: PokemonTemplate) {
        const imgFile = pokemon.pokedex < 10 ? '00' + pokemon.pokedex : pokemon.pokedex < 100 ? '0' + pokemon.pokedex : pokemon.pokedex;
        this.imgLoc = `/assets/imgs/${imgFile}.PNG`;
    }

    catchPokemon(wildPokemon: PokemonTemplate) {
        this.trainer.catchPokemon(wildPokemon);
        this.fleePokemon();
    }

    fleePokemon(): void {
        this.trainerTracker.setNewView("defaultView");
    }
}
