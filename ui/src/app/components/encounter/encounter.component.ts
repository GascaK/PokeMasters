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
    public encounterRetry = false;
    public encounterMsg: string;
    public encounterMod: string;
    public encounterRoll: string;
    public encounterItem: PokeItemsTemplate | null;
    public encounterItems: Array<PokeItemsTemplate> = [];
    public escapeChance: number = .15;

    async ngOnInit(): Promise<void> {
        if (this.trainerTracker?.isLoggedIn()) {
            this.trainer = await this.trainerTracker.getTrainer();
            await this.getInventory();
        }

        const encounterTier = this.legendary ? 4 : this.trainer.getCurrentTier();
        await this.serverService.encounterRandomPokemon(this.trainer.id, encounterTier, this.encounterItems, "")
            .then((res) => {
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

    async getInventory(): Promise<void> {
        let inventory: number;
        this.itemList.clear();
        await this.trainer.reloadItems()
            .then( () => {
                this.trainer.items.forEach( (item) => {
                    if (item.name.includes("Shiny")) {
                        this.encounterItems.push(item);
                        return;
                    }
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
            });
    }

    async catchPokemon(item: PokeItemsTemplate) {
        await this.trainer.catchRandomPokemon(this.pokemon.id, [item], this.escapeChance)
            .then((res) => {
                this.encounterMod = res.data.mods;
                this.encounterRoll = res.data.roll + res.data.mods;
                this.encounterRetry = false;

                if (res.msg == "caught"){
                    this.encounterItem = res.data.item;
                    this.encounterMsg = "Caught!";
                } else if(res.msg == "retry"){
                    this.encounterMsg = "Try Again!";
                    this.escapeChance = res.data.escape;
                    this.encounterRetry = true;
                } else {
                    this.encounterMsg = "Pokemon escaped!";
                }
                // Set encounter output.
                this.encounterView = true;
            });
    }

    fleePokemon(retry: boolean=false): void {
        if (retry) {
            this.getInventory();
            this.encounterView = false;
        } else {
            this.menuService.setNewView("defaultView");
        }
    }
}
