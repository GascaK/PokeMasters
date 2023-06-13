import { Component, Input, OnInit } from '@angular/core';
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

    ngOnInit() {
        this.loadActive();
        this.interval = setInterval(() => {
            this.loadCard(this.trainer.activePokemon);
        }, 1000);
    }

    loadActive() {
        if (this.trainer.activePokemon) {
            this.active = this.trainer.activePokemon;
            if (! this.active.currentHP ) {
                this.active.currentHP = this.active.hp;
            }
        }
    }

    loadCard(pokemon: PokemonTemplate) {
        const imgFile = pokemon.pokedex < 10 ? '00' + pokemon.pokedex : pokemon.pokedex < 100 ? '0' + pokemon.pokedex : pokemon.pokedex;
        this.imgLoc = `/assets/imgs/${imgFile}.PNG`;
    }
}
