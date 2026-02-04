import { Component, Input, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
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
export class EncounterComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() trainerTracker: TrainerTracker;
    @Input() serverService: ServerService;
    @Input() menuService: MenuService;
    @Input() legendary: boolean = false;
    @ViewChild('catchAnimationContainer') catchAnimationContainer: ElementRef;
    
    //private audio = new Audio();
    private audioElements: Array<HTMLAudioElement> = []; // Track all audio elements for cleanup

    public trainer: PokemonMaster;
    public pokemon: PokemonTemplate;
    public showPokemon = false;
    public statBlock = new Map<string, number>();
    public itemList = new Map<string, { name: string, count: number, text: string, item: PokeItemsTemplate }>();
    
    public inCollection = false;
    public encounterView = false;
    public encounterRetry = false;
    public encounterMsg: string;
    public encounterMod: string;
    public encounterRoll: string;
    public encounterItem: PokeItemsTemplate | null;
    public encounterItems: Array<PokeItemsTemplate> = [];
    public escapeChance: number = .15;

    // Catch animation states
    public showCatchAnimation = false;
    public catchAnimationState: 'wobbling' | 'success' | 'escaped' | null = null;
    public catchResult = false;
    public usedItem: PokeItemsTemplate;
    public xpMessage: string;
    
    // Animation timing
    private catchAnimationTimeout: any;
    private soundTimeout: any;

    async ngOnInit(): Promise<void> {
        if (this.trainerTracker?.isLoggedIn()) {
            this.trainer = await this.trainerTracker.getTrainer();
            await this.getInventory();
        }

        this.inCollection = false;
        const encounterTier = this.legendary ? 4 : this.trainer.getCurrentTier();

        // Play encounter sound
        this.playEncounterSound();

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
        // Component view is initialized
    }

    ngOnDestroy(): void {
        // Clean up all audio elements and timers
        this.audioElements.forEach(audio => {
            audio.pause();
            audio.src = '';
        });
        this.audioElements = [];

        if (this.catchAnimationTimeout) {
            clearTimeout(this.catchAnimationTimeout);
        }
        if (this.soundTimeout) {
            clearTimeout(this.soundTimeout);
        }
    }

    private playEncounterSound(): void {
        const audio = new Audio();
        audio.src = `assets/sounds/pokemon_encounter${this.legendary ? "_legendary" : ""}.webm`;
        audio.volume = 0.4;
        audio.load();
        audio.play().catch(error => console.warn('Could not play encounter sound:', error));
        this.audioElements.push(audio as HTMLAudioElement);
    }

    private playSound(type: 'wobble' | 'success' | 'failure'): void {
        const audio = new Audio();
        let src = '';
        let volume = 0.7;

        switch (type) {
            case 'wobble':
                src = 'assets/sounds/pokemon_encounter_wobble.webm';
                break;
            case 'success':
                src = 'assets/sounds/pokemon_success.m4a';
                // Pause background audio for success
                this.audioElements.forEach(a => a.pause());
                break;
            case 'failure':
                src = 'assets/sounds/pokemon_missed.webm';
                volume = 0.3;
                break;
        }

        if (src) {
            audio.src = src;
            audio.volume = volume;
            audio.load();
            audio.play().catch(error => console.warn(`Could not play ${type} sound:`, error));
            this.audioElements.push(audio as HTMLAudioElement);
        }
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

    private removeUsedItem(item: PokeItemsTemplate): void {
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
        this.catchResult = false;
        this.encounterRetry = false;
        this.catchAnimationState = 'wobbling';

        // Start the catch animation sequence
        this.showCatchAnimation = true;
        this.showPokemon = false;
        this.encounterView = false;

        // Play wobble sound immediately
        this.playSound('wobble');

        // Remove the used item from inventory immediately
        this.removeUsedItem(item);

        // Process the catch after wobble animation (3 seconds)
        this.catchAnimationTimeout = setTimeout(async () => {
            await this.processCatchResult();
            
            // Update animation state and play appropriate sound
            if (this.catchResult) {
                this.catchAnimationState = 'success';
                this.playSound('success');
            } else {
                this.catchAnimationState = 'escaped';
                this.playSound('failure');
            }
        }, 3000);
    }

    private async processCatchResult(): Promise<void> {
        try {
            const res = await this.trainer.catchRandomPokemon(this.pokemon.id, [this.usedItem], this.escapeChance);

            this.encounterMod = res.data.mods;
            this.encounterRoll = res.data.roll + res.data.mods;
            this.encounterRetry = false;

            if (res.msg == "caught") {
                this.catchResult = true;
                this.encounterItem = res.data.item;
                this.encounterMsg = "Caught!";

                await this.trainer.updateXp().then(async (xpItem) => {
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

    private async updateTeam(): Promise<void> {
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

    getPokemonImageUrl(): string {
        return this.pokemon?.sprite.sprite_url || '/assets/images/pokemon-silhouette.png';
    }

    // Button action methods for different states
    showResult(): void {
        this.encounterView = true;
        this.showCatchAnimation = false;
    }

    tryAgain(): void {
        this.showCatchAnimation = false;
        this.showPokemon = true;
        this.encounterView = false;
        this.catchAnimationState = null;
        this.getInventory(); // Refresh inventory
    }

    async fleePokemon(retry: boolean = false): Promise<void> {
        if (retry) {
            this.tryAgain();
        } else {
            // Clean up the uncaught pokemon
            if (!this.catchResult) {
                this.serverService.deletePokemon(this.trainer.id, this.pokemon.id);
            }
            this.menuService.setNewView("defaultView");
        }
    }

    // Getter methods for button states
    get canShowResult(): boolean {
        return this.catchAnimationState === 'success' || this.catchAnimationState === 'escaped';
    }

    get canTryAgain(): boolean {
        return !this.catchResult && this.encounterRetry && this.catchAnimationState === 'escaped';
    }

    get resultButtonText(): string {
        return this.catchResult ? 'Add to Collection' : 'Continue';
    }

    get resultButtonIcon(): string {
        return this.catchResult ? 'fa-solid fa-check-circle me-2' : 'fa-solid fa-arrow-right me-2';
    }
}