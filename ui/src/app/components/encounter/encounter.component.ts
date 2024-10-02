import { Component, Input, OnInit } from '@angular/core';
import { PokeItemsTemplate } from 'src/app/interfaces/pokeItems';
import { PokemonMaster } from 'src/app/interfaces/pokeMaster';
import { PokemonTemplate } from 'src/app/interfaces/pokemon';
import { MenuService } from 'src/app/services/menuService';
import ServerService from 'src/app/services/serverService';
import { TrainerTracker } from 'src/app/services/trainerTracker';

@Component({
    selector: 'app-encounter',
    templateUrl: './encounter.component.html',
    styleUrls: ['./encounter.component.css']
})
export class EncounterComponent implements OnInit{
    @Input() trainerTracker: TrainerTracker;
    @Input() serverService: ServerService;
    @Input() menuService: MenuService;

    @Input() legendary: boolean = false;
    public trainer: PokemonMaster;
    public pokemon: PokemonTemplate;
    public showPokemon = false;
    public statBlock = new Map<string, number>;
    public itemList = new Map<string, {name: string, count: number, text: string, item: PokeItemsTemplate}>; 
    public imgLoc: string;
    interval: any;

    public encounterView = false;
    public encounterMsg: string;
    public encounterMod: string;
    public encounterItem: PokeItemsTemplate | null;
    public encounterRoll: string;

    async ngOnInit(): Promise<void> {
        if (this.trainerTracker?.isLoggedIn()) {
            this.trainer = await this.trainerTracker.getTrainer();
            this.getInventory();
        }

        const encounterTier = this.legendary ? 4 : this.trainer.getCurrentTier();
        await this.serverService.encounterRandomPokemon(this.trainer.id, encounterTier, null, [])
            .then((res) => {
                console.log(res);
                this.pokemon = res;
                this.pokemon.stats.forEach((stat) => {
                    if (stat.name == "hp") {
                        this.statBlock.set("hp", stat.value);
                    }else if (stat.name == "speed"){
                        this.statBlock.set("speed", stat.value);
                    }
                })
                this.showPokemon = true;
            }).catch((err) => {
                console.error(err);
            });
    }

    getInventory(){
        let inventory: number;
        this.trainer.items.forEach( (item) => {
            if (!item.name.includes("Ball")){
                return;
            }

            if (this.itemList.has(item.name)) {
                inventory = this.itemList.get(item.name)!.count + 1;
            } else {
                inventory = 1;
            }
            this.itemList.set(item.name, {
                name: item.name,
                count: inventory,
                text: item.text,
                item: item
            })
        });
    }

    async catchPokemon(item: PokeItemsTemplate) {
        await this.trainer.catchRandomPokemon(this.pokemon.id, [item])
            .then((res) => {
                console.log("res", res);
                this.encounterMod = res.data.mods;
                this.encounterRoll = res.data.roll;

                if (res.msg == "caught"){
                    this.encounterItem = res.data.item;
                    this.encounterMsg = "Caught!";
                } else if(res.msg == "retry"){
                    this.encounterMsg = "Try Again!";
                } else {
                    this.encounterMsg = "Pokemon escaped!";
                }

                this.encounterView = true;
            });
    }

    fleePokemon(): void {
        this.menuService.setNewView("defaultView");
    }
}
