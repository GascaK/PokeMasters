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
 */
export class EncounterComponent implements OnInit, AfterViewInit {
    @Input() trainerTracker: TrainerTracker;
    @Input() serverService: ServerService;
    @Input() menuService: MenuService;
    @Input() legendary: boolean = false;
    @ViewChild('catchAnimationContainer') catchAnimationContainer: ElementRef;

    public trainer: PokemonMaster;
    public pokemon: PokemonTemplate;
    public showPokemon = false;
    public statBlock = new Map<string, number>;
    public itemList = new Map<string, { name: string, count: number, text: string, item: PokeItemsTemplate }>;
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
    private animationCleanupFn: (() => void) | null = null;

    async ngOnInit(): Promise<void> {
        if (this.trainerTracker?.isLoggedIn()) {
            this.trainer = await this.trainerTracker.getTrainer();
            await this.getInventory();
        }

        this.inCollection = false;
        const encounterTier = this.legendary ? 4 : this.trainer.getCurrentTier();

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
        this.cleanupCatchAnimation();
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

    async catchPokemon(item: PokeItemsTemplate): Promise<void> {
        // Store the used item for the animation
        this.usedItem = item;

        // Start the catch animation sequence
        this.showCatchAnimation = true;
        this.showPokemon = false;
        this.encounterView = false;

        // Process catch result in background but don't wait for it to start animation
        const catchResultPromise = this.processCatchResult();

        // Wait for both server response and minimum animation time
        await Promise.all([
            catchResultPromise,
            new Promise(resolve => setTimeout(resolve, 3500)) // Minimum animation time
        ]);

        // Update animation with result after minimum time has passed
        this.updateAnimationWithResult(this.catchResult);
    }

    /**
     * Initialize the catch animation with proper integration into Angular component
     * @param success Whether the catch attempt was successful
     */
    initCatchAnimation(): void {
        // No animation initialization needed
    }

    /**
     * Play sound effects for the animation
     * @param type The type of sound to play (success/failure)
     */
    playSound(type: 'success' | 'failure'): void {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            if (type === 'success') {
                // Create a short success jingle
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
                oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
                oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
                oscillator.frequency.setValueAtTime(1046.50, audioContext.currentTime + 0.3); // C6

                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.5);
            } else {
                // Create a short failure sound
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
                oscillator.frequency.setValueAtTime(349.23, audioContext.currentTime + 0.1); // F4
                oscillator.frequency.setValueAtTime(293.66, audioContext.currentTime + 0.2); // D4

                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.3);
            }
        } catch (error) {
            // Silently fail if audio context isn't available
            console.log('Audio context not available');
        }
    }

    /**
     * Helper method to clean up animation elements and timers
     */
    cleanupCatchAnimation(): void {
        // No cleanup needed
    }

    /**
     * Helper method to get the Pokemon image URL
     */
    getPokemonImageUrl(): string {
        // Return the appropriate image URL based on your application structure
        // This is a placeholder - adjust according to your actual image path structure
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

    fleePokemon(retry: boolean = false): void {
        this.cleanupCatchAnimation();
        this.showCatchAnimation = false;
        if (retry) {
            this.getInventory();
            this.showPokemon = true;
            this.encounterView = false;
        } else {
            this.menuService.setNewView("defaultView");
        }
    }
}