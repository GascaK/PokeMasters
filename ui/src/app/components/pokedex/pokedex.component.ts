import { Component, Input, OnInit, OnDestroy } from '@angular/core';
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
export class PokedexComponent implements OnInit, OnDestroy {
    @Input() trainerTracker: TrainerTracker;
    @Input() serverService: ServerService;
    @Input() menuService: MenuService;
    public trainer: PokemonMaster;

    public moreInformation = false;
    public infoList: {data: PokemonTemplate, checked: boolean}[] = [];
    public validated: Array<PokemonTemplate> = [];
    public sortedPokemon: Map<number, {name: string, count: number}> = new Map;
    public finalPokedex: Map<number, {name: string, count: number}>;
    public minRequiredForEvolution = 3; // Minimum number of Pokémon needed for evolution
    public showMissingPokemon = false;
    public missingPokemon: Map<number, {name: string, count: number}> = new Map();
    public combinedPokedex: Map<number, {name: string, count: number, isMissing: boolean}> = new Map();
    interval: any;

    getPokemonSprite(dexId: number): string {
        const pokemon = this.trainer.pokemon.find(p => p.base.dex_id === dexId);
        return pokemon ? pokemon.sprite.sprite_url : '';
    }

    toggleMissingPokemon() {
        this.showMissingPokemon = !this.showMissingPokemon;
        if (this.showMissingPokemon && this.missingPokemon.size === 0) {
            this.loadMissingPokemon();
        }
        this.updateCombinedPokedex();
    }

    private updateCombinedPokedex() {
        this.combinedPokedex.clear();
        
        // Add caught Pokemon
        this.finalPokedex.forEach((value, key) => {
            this.combinedPokedex.set(key, {
                name: value.name,
                count: value.count,
                isMissing: false
            });
        });

        // Add missing Pokemon if showing
        if (this.showMissingPokemon) {
            this.missingPokemon.forEach((value, key) => {
                this.combinedPokedex.set(key, {
                    name: value.name,
                    count: value.count,
                    isMissing: true
                });
            });
        }
    }

    private loadMissingPokemon() {
        this.missingPokemon.clear();
        // Generation 1 Pokemon IDs range from 1 to 151
        for (let i = 1; i <= 252; i++) {
            if (!this.finalPokedex.has(i)) {
                this.missingPokemon.set(i, {
                    name: this.getPokemonName(i),
                    count: 0
                });
            }
        }
        this.updateCombinedPokedex();
    }

    private getPokemonName(dexId: number): string {
        // This is a placeholder - you'll need to implement this based on your Pokemon data
        // You might want to create a service that maps Pokemon IDs to names
        return `Pokemon #${dexId}`;
    }

    async ngOnInit() {
        this.trainer = await this.trainerTracker.getTrainer();

        if (this.trainerTracker) {
            if (this.trainer.pokemon) {
                this.trainer.pokemon.forEach((mon) => {
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
                this.updateCombinedPokedex();
                console.log(this.finalPokedex);
            }

            this.interval = setInterval(() => {
                this.validated = [];
                this.trackChecked();
            }, 1000);
        }
    }

    ngOnDestroy() {
        // Clear the interval when component is destroyed to prevent memory leaks
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    moreInfo(id: number) {
        this.moreInformation = true;
        this.infoList = []; // Clear previous list
        this.trainer.pokemon.forEach((pokemon: PokemonTemplate) => {
            if(pokemon.base.dex_id == id) {
                this.infoList.push({
                    data: pokemon,
                    checked: false
                });
            }
        });
    }

    trackChecked() {
        this.validated = [];
        this.infoList.forEach((value) => {
            if(value.checked) {
                this.validated.push(value.data);
            }
        });
    }

    /**
     * Calculate the average value of a specific stat across all Pokémon in the infoList
     * @param statName The name of the stat to average (e.g., 'hp', 'speed')
     * @returns The average value of the stat
     */
    getAverageStat(statName: string): number {
        if (this.infoList.length === 0) return 0;
        
        let total = 0;
        let count = 0;
        
        this.infoList.forEach(item => {
            item.data.stats.forEach(stat => {
                if (stat.name === statName) {
                    total += stat.value;
                    count++;
                }
            });
        });
        
        return count > 0 ? total / count : 0;
    }

    /**
     * Get the count of currently selected/checked Pokémon
     * @returns Number of checked Pokémon
     */
    getSelectedCount(): number {
        return this.infoList.filter(item => item.checked).length;
    }

    /**
     * Check if the currently selected Pokémon meet the requirements for evolution
     * @returns Boolean indicating if evolution is possible
     */
    canEvolve(): boolean {
        return this.getSelectedCount() >= this.minRequiredForEvolution;
    }

    async evolve(mons: Array<PokemonTemplate>) {
        let ids: Array<number> = [];
        if (this.validated.length >= this.minRequiredForEvolution) {
            this.validated.forEach((mon) => {
                ids.push(mon.id);
            });

            await this.serverService.evolvePokemon(this.trainer.id, ids)
                .then((pokemon) => {
                    this.trainer.team.active.pokemon = pokemon;
                    pokemon.stats.forEach((stat) => {
                        if (stat.name == "hp") {
                            this.trainer.team.active.currentHP = stat.value;
                            this.trainer.team.active.maxHP = stat.value;
                        } else if (stat.name == "speed") {
                            this.trainer.team.active.speed = stat.value;
                        }
                    });

                    this.exitView();
                }).catch((err) => {
                    console.error(err);
                });
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

        if (this.trainer.team.benchOne.pokemon === undefined && this.trainer.team.active.pokemon) {
            this.trainer.team.benchOne.pokemon = this.trainer.team.active.pokemon;
            this.trainer.team.active.pokemon.stats.forEach((stat) => {
                if (stat.name == "hp") {
                    this.trainer.team.benchOne.currentHP = this.trainer.team.active.currentHP;
                    this.trainer.team.benchOne.maxHP = stat.value;
                } else if (stat.name == "speed") {
                    this.trainer.team.benchOne.speed = stat.value;
                }
            });
        } else if (this.trainer.team.benchTwo.pokemon === undefined && this.trainer.team.active.pokemon) {
            this.trainer.team.benchTwo.pokemon = this.trainer.team.active.pokemon;
            this.trainer.team.active.pokemon.stats.forEach((stat) => {
                if (stat.name == "hp") {
                    this.trainer.team.benchTwo.currentHP = this.trainer.team.active.currentHP;
                    this.trainer.team.benchTwo.maxHP = stat.value;
                } else if (stat.name == "speed") {
                    this.trainer.team.benchTwo.speed = stat.value;
                }
            });
        }

        this.trainer.team.active.pokemon = pokemon;
        pokemon.stats.forEach((stat) => {
            if (stat.name == "hp") {
                this.trainer.team.active.currentHP = stat.value;
                this.trainer.team.active.maxHP = stat.value;
            } else if (stat.name == "speed") {
                this.trainer.team.active.speed = stat.value;
            }
        });

        if (this.trainer.team.benchOne.pokemon && this.trainer.team.benchTwo.pokemon){
            this.exitView();
        } else {
            this.exitInfoPanel();
        }
    }

    exitInfoPanel() {
        this.infoList = [];
        this.moreInformation = false;
    }

    exitView() {
        this.menuService.setNewView("defaultView");
    }
}