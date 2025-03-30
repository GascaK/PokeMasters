import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { PokeItemsTemplate } from 'src/app/interfaces/pokeItems';
import { PokemonMaster } from 'src/app/interfaces/pokeMaster';
import { PokemonTemplate } from 'src/app/interfaces/pokemon';
import { PokeTeam, Bench } from 'src/app/interfaces/pokeTeam';
import { MenuService } from 'src/app/services/menuService';
import { TrainerTracker } from 'src/app/services/trainerTracker';

@Component({
    selector: 'app-active',
    templateUrl: './active.component.html',
    styleUrls: ['./active.component.css']
})
export class ActiveComponent implements OnInit{
    @Input() trainerTracker: TrainerTracker;
    @Input() menuService: MenuService;
    @Input() team: PokeTeam;

    public trainer: PokemonMaster;

    public imgLoc: string;
    public interval: any;
    public items: Array<PokeItemsTemplate> = [];
    public choosingItemStatus = false;

    async ngOnInit() {
        this.trainer = await this.trainerTracker.getTrainer();
    }

    loadActive() {
        console.log(this.team.active);
        if (this.team.active.pokemon) {
            this.team.active.pokemon.stats.forEach((stat) => {
                if (stat.name == "hp"){
                    this.team.active.currentHP = stat.value;
                    this.team.active.maxHP = stat.value;
                }
                if (stat.name == "speed"){
                    this.team.active.speed = stat.value;
                }
            });
        }
    }

    chooseNewItem() {
        this.items = this.trainer.items;
        this.choosingItemStatus = true;
    }

    holdItem(item: PokeItemsTemplate) {
        this.team.active.item = item;
        // this.trainer.deleteItem(item.id); Do not delete item after use.
        this.exitItemSelection();
    }

    dropActiveHeldItem() {
        if (this.team.active.item) {
            alert(`Dropping item ${this.team.active.item.name}`);
            this.team.active.item = null;
        } else {
            alert("Nothing to drop.");
        }
        this.exitItemSelection();
    }

    setBenchOne() {
        if (!this.team.benchOne) {
            this.team.active = this.team.benchOne;
            this.menuService.setNewView("dexView");
        } else {
            const temp = this.team.active;
            this.team.active = this.team.benchOne;
            this.team.benchOne = temp;
        }
    }
    
    setBenchTwo() {
        if (!this.team.benchTwo) {
            this.team.active = this.team.benchTwo;
            this.menuService.setNewView("dexView");
        } else {
            const temp = this.team.active;
            this.team.active = this.team.benchTwo;
            this.team.benchTwo = temp;
        }
    }

    exitItemSelection() {
        this.choosingItemStatus = false;
    }
}
