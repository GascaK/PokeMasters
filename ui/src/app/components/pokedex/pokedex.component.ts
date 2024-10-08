import { Component, Input, OnInit } from '@angular/core';
import { PokemonTemplate } from 'src/app/interfaces/pokemon';
import { PokemonMaster } from 'src/app/interfaces/pokeMaster';

import { MenuService } from 'src/app/services/menuService';
import { TrainerTracker } from 'src/app/services/trainerTracker';
import { ServerService } from 'src/app/services/serverService';

@Component({
    selector: 'app-pokedex',
    templateUrl: './pokedex.component.html',
    styleUrls: ['./pokedex.component.css']
})
export class PokedexComponent implements OnInit {
    @Input() trainerTracker: TrainerTracker;
    @Input() serverService: ServerService;
    @Input() menuService: MenuService;
    public trainer: PokemonMaster;

    public moreInformation = false;
    public infoList: {data: PokemonTemplate, checked: boolean}[] = [];
    public validated: Array<PokemonTemplate> = [];
    public sortedPokemon: Map<number, {name: string, count: number}> = new Map;
    public finalPokedex: Map<number, {name: string, count: number}>;
    interval: any;

    async ngOnInit() {
        this.trainer = await this.trainerTracker.getTrainer();

        if (this.trainerTracker)
        {
            if (this.trainer.pokemon) {
                this.trainer.pokemon.forEach( (mon) => {
                    let count = 1;
                    if (this.sortedPokemon.has(mon.base.dex_id)) {
                        count = this.sortedPokemon.get(mon.base.dex_id)!.count + 1;
                    }
                    this.sortedPokemon.set(mon.base.dex_id, {
                        name: mon.base.name,
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
            if(pokemon.base.dex_id == id) {
                console.log("special", pokemon.moves[0].special);
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
        let ids: Array<number> = [];
        if (this.validated.length >= 3) {
            this.validated.forEach((mon) => {
                ids.push(mon.id);
            });

            await this.serverService.evolvePokemon(this.trainer.id, ids)
                .then( (res) => {
                    this.exitView();
                }).catch( (err) => {
                    console.error(err);
                })
        }
        this.exitInfoPanel();
    }

    validateBenchCapacity(pokemon: PokemonTemplate): boolean {
        if (pokemon.id == this.trainer.team.active?.pokemon?.id) {
            return false;
        } else if (pokemon.id == this.trainer.team.benchOne?.pokemon?.id) {
            return false;
        } else if (pokemon.id == this.trainer.team.benchTwo?.pokemon?.id) {
            return false;
        }
        return true;
    }

    setActive(pokemon: PokemonTemplate) {
        this.trainer.team.active.pokemon = pokemon;
        pokemon.stats.forEach((stat) => {
            if (stat.name == "hp") {
                this.trainer.team.active.currentHP = stat.value;
                this.trainer.team.active.maxHP = stat.value;
            } else if (stat.name == "speed") {
                this.trainer.team.active.speed = stat.value;
            }
        })

        this.exitView();
    }

    exitInfoPanel() {
        this.infoList = [];
        this.moreInformation = false;
    }

    exitView() {
        this.menuService.setNewView("defaultView");
    }
}
