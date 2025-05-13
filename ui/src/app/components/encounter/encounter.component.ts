import { Component, Input, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
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
/**
 * Angular component for managing Pokemon encounters and catch mechanics
 * 
 * Handles the entire encounter flow including:
 * - Generating random Pokemon encounters
 * - Animating catch attempts with visual and audio feedback
 * - Processing catch results from the server
 * - Managing inventory items used during catches
 */
export class EncounterComponent implements OnInit, AfterViewInit {
    @Input() trainerTracker: TrainerTracker;
    @Input() serverService: ServerService;
    @Input() menuService: MenuService;
    @Input() legendary: boolean = false;
    @ViewChild('catchAnimationContainer') catchAnimationContainer: ElementRef;
    public audio = new Audio();

    public trainer: PokemonMaster;
    public pokemon: PokemonTemplate;
    public showPokemon = false;
    public statBlock = new Map<string, number>;
    public itemList = new Map<string, { name: string, count: number, text: string, item: PokeItemsTemplate }>();
    public imgLoc: string;
    interval: any;

    public inCollection = false;
    public encounterView = false;
    public encounterRetry = false;
    public encounterMsg: string;
    public encounterMod: string;
    public encounterRoll: string;
    public encounterItem: PokeItemsTemplate | null;
    public encounterItems: Array<PokeItemsTemplate> = [];
    public escapeChance: number = .15;

    // Properties for the catch animation
    public showCatchAnimation = false;
    public catchResult = false;
    public usedItem: PokeItemsTemplate;
    public xpMessage: string;

    async ngOnInit(): Promise<void> {
        if (this.trainerTracker?.isLoggedIn()) {
            this.trainer = await this.trainerTracker.getTrainer();
            await this.getInventory();
        }

        this.inCollection = false;
        const encounterTier = this.legendary ? 4 : this.trainer.getCurrentTier();

        this.audio.src = `assets/sounds/pokemon_encounter${this.legendary ? "_legendary": ""}.webm`;
        this.audio.load();
        this.audio.volume = 0.4;
        this.audio.play();


        await this.serverService.encounterRandomPokemon(this.trainer.id, encounterTier, this.encounterItems, "")
            .then((res) => {
                this.trainer.pokemon.forEach((pkmn) => {
                    if (res.base.dex_id == pkmn.base.dex_id) {
                        this.inCollection = true;
                    }
                });

                this.pokemon = res;
                this.pokemon.stats.forEach((stat) => {
                    if (stat.name == "hp") {
                        this.statBlock.set("hp", stat.value);
                    } else if (stat.name == "speed") {
                        this.statBlock.set("speed", stat.value);
                    }
                });
                this.showPokemon = true;
            }).catch((err) => {
                console.error(err);
            });

        this.legendary = false;
    }

    ngAfterViewInit(): void {
        // Any setup needed after the view is initialized
    }

    ngOnDestroy(): void {
        // Clean up animations when component is destroyed
        this.audio.pause();
    }

    async getInventory(): Promise<void> {
        let inventory: number;
        this.itemList.clear();
        await this.trainer.reloadItems()
            .then(() => {
                this.trainer.items.forEach((item) => {
                    if (item.name.includes("Shiny")) {
                        this.encounterItems.push(item);
                        return;
                    }
                    if (!item.name.includes("Ball")) {
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
                    });
                });
            });
    }

    /**
     * Removes a used item from the trainer's inventory and updates the UI
     * @param item The item that was used in the catch attempt
     */
    removeUsedItem(item: PokeItemsTemplate): void {
        // Find the item in the itemList Map and decrement its count
        if (this.itemList.has(item.name)) {
            const itemEntry = this.itemList.get(item.name);
            if (itemEntry && itemEntry.count > 0) {
                itemEntry.count--;
                
                // If count reaches zero, remove the item from the list
                if (itemEntry.count <= 0) {
                    this.itemList.delete(item.name);
                }
            }
        }
        
        // Remove the actual item from the trainer's inventory
        const itemIndex = this.trainer.items.findIndex(i => i.id === item.id);
        if (itemIndex !== -1) {
            this.trainer.items.splice(itemIndex, 1);
        }
    }

    async catchPokemon(item: PokeItemsTemplate): Promise<void> {
        // Store the used item for the animation
        this.usedItem = item;

        // Reset some screen states.
        this.catchResult = false;
        this.encounterRetry = false;

        const audio = new Audio();
        audio.src = 'assets/sounds/pokemon_encounter_wobble.webm';
        audio.load();
        audio.volume = 0.7;
        audio.play();

        // Start change in screen.
        this.showCatchAnimation = true;
        this.showPokemon = false;
        this.encounterView = false;

        setTimeout(async () => {
            // Remove the used item from inventory immediately
            this.removeUsedItem(item);

            await this.processCatchResult();
            this.updateAnimationWithResult(this.catchResult);
        }, 5000);

        
        

        // Start the catch animation sequence
        

        // Process catch result in background but don't wait for it to start animation
        // const catchResultPromise = this.processCatchResult();

        // // Wait for both server response and minimum animation time
        // await Promise.all([
        //     catchResultPromise,
        //     new Promise(resolve => setTimeout(resolve, 3500)) // Minimum animation time
        // ]);

        // // Update animation with result after minimum time has passed
        // this.updateAnimationWithResult(this.catchResult);
    }

    /**
     * Play sound effects for the animation
     */
    playSound(type: 'success' | 'failure'): void {
        //
        if (type === 'success') {
            const audio = new Audio();
            audio.src = 'assets/sounds/pokemon_success.m4a';
            audio.load();

            this.audio.pause(); // Pause background audio.
            audio.play();
        } else if (type === 'failure') {
            const audio = new Audio();
            audio.src = 'assets/sounds/pokemon_missed.webm';
            audio.load();
            audio.volume = 0.3;
            audio.play();
        }
    }

    /**
     * Helper method to get the Pokemon image URL
     */
    getPokemonImageUrl(): string {
        return this.pokemon?.sprite.sprite_url || '/assets/images/pokemon-silhouette.png';
    }

    updateAnimationWithResult(success: boolean): void {
        // Play appropriate sound
        this.playSound(success ? 'success' : 'failure');
    }

    // Process the catch result from the server
    async processCatchResult(): Promise<void> {
        try {
            const res = await this.trainer.catchRandomPokemon(this.pokemon.id, [this.usedItem], this.escapeChance);

            this.encounterMod = res.data.mods;
            this.encounterRoll = res.data.roll + res.data.mods;
            this.encounterRetry = false;

            if (res.msg == "caught") {
                this.catchResult = true;
                this.encounterItem = res.data.item;
                this.encounterMsg = "Caught!";


                await this.trainer.updateXp().then( async (xpItem) => {
                    await this.updateTeam();

                    if (xpItem.name.toLowerCase().includes("hp up")) {
                        this.xpMessage = `${this.trainer.team.active.pokemon?.base.name} gained ${xpItem.cost} HP! :${this.trainer.team.active.pokemon?.stats.find(stat => stat.name === 'hp')?.value}:`;
                    } else if (xpItem.name.toLowerCase().includes("speed up")) {
                        this.xpMessage = `${this.trainer.team.active.pokemon?.base.name} gained ${xpItem.cost} Speed! :${this.trainer.team.active.pokemon?.stats.find(stat => stat.name === 'speed')?.value}:`;
                    } else if (xpItem.name.toLowerCase().includes("physical up")) {
                        this.xpMessage = `${this.trainer.team.active.pokemon?.base.name} gained ${xpItem.cost} Physical Attack! :${this.trainer.team.active.pokemon?.stats.find(stat => stat.name === 'physical')?.value}:`;
                    } else if (xpItem.name.toLowerCase().includes("special up")) {
                        this.xpMessage = `${this.trainer.team.active.pokemon?.base.name} gained ${xpItem.cost} Special Attack! :${this.trainer.team.active.pokemon?.stats.find(stat => stat.name === 'special')?.value}:`;
                    }

                }).catch(error => {
                    console.error('Error updating XP:', error);
                });

            } else if (res.msg == "retry") {
                this.catchResult = false;
                this.encounterMsg = "Try Again!";
                this.escapeChance = res.data.escape;
                this.encounterRetry = true;
            } else {
                this.catchResult = false;
                this.encounterMsg = "Pokemon escaped!";
            }
        } catch (error) {
            console.error('Error processing catch result:', error);
            this.catchResult = false;
            this.encounterMsg = "Error processing catch";
        }
    }

    async updateTeam(): Promise<void> {
        await Promise.all([
            this.trainer.reloadPokemon()
          ]);

        this.trainer.pokemon.forEach((pokemon) => {
            if (pokemon.id === this.trainer.team.active?.pokemon?.id) {
              this.trainer.team.active.pokemon = pokemon;
              this.trainer.team.active.speed = pokemon.stats.find(stat => stat.name === 'speed')?.value || 0;
              this.trainer.team.active.maxHP = pokemon.stats.find(stat => stat.name === 'hp')?.value || 0;
            }
          });
    }


    async fleePokemon(retry: boolean = false): Promise<void> {
        this.showCatchAnimation = false;
        if (retry) {
            this.getInventory();
            this.showPokemon = true;
            this.encounterView = false;
        } else {
            if (! this.catchResult ){
                this.serverService.deletePokemon(this.trainer.id, this.pokemon.id);
            }
            this.menuService.setNewView("defaultView");
        }
    }
}