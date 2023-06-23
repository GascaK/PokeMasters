import { Component, Input, OnInit } from '@angular/core';
import { PokeItemsTemplate } from 'src/app/interfaces/pokeItems';
import { PokemonMaster } from 'src/app/interfaces/pokeMaster';
import { PokemonTemplate } from 'src/app/interfaces/pokemon';

@Component({
    selector: 'app-active',
    templateUrl: './active.component.html',
    styleUrls: ['./active.component.css']
})
export class ActiveComponent implements OnInit{
    @Input() trainer: PokemonMaster;
    public active: PokemonTemplate;
    public imgLoc: string;
    public interval: any;
    public items: Array<PokeItemsTemplate> = [];
    public choosingItemStatus = false;

    ngOnInit() {
        if (this.trainer.activePokemon) {
            this.active = this.trainer.activePokemon;
            if (! this.active.currentHP ) {
                this.active.currentHP = this.active.hp;
            }
            this.loadCard(this.active);
            this.items = this.trainer.items;
        }
        this.interval = setTimeout( () => {
            console.log(this.trainer.activePokemon);
            if (this.trainer.activePokemon) {
                this.active = this.trainer.activePokemon;
                this.loadCard(this.active);
            }
        }, 1000);
    }

    loadCard(pokemon: PokemonTemplate) {
        const imgFile = pokemon.pokedex < 10 ? '00' + pokemon.pokedex : pokemon.pokedex < 100 ? '0' + pokemon.pokedex : pokemon.pokedex;
        this.imgLoc = `/assets/imgs/${imgFile}.PNG`;
    }

    chooseNewItem() {
        this.choosingItemStatus = true;
    }

    holdItem(item: PokeItemsTemplate) {
        this.active.item = item;
        this.trainer.removeItem(item._id);
        this.exitItemSelection();
    }

    dropActiveHeldItem() {
        if (this.active.item) {
            alert(`Dropping item ${this.active.item!.name}`);
            this.active.item = null;
        } else {
            alert("Nothing to drop.");
        }
        this.exitItemSelection();
    }

    exitItemSelection() {
        this.choosingItemStatus = false;
    }
}
