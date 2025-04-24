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
    public items: Array<any> = [];
    public choosingItemStatus = false;
    public itemSearchText: string = '';

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
        this.items = [];
        const categorizedItems: { [key: string]: { [key: string]: any } } = {};
        
        // Categorize and count items
        this.trainer.items.forEach((item) => {
            if (item.text.includes("Held Item:")) {
                const category = this.getItemCategory(item);
                if (!categorizedItems[category]) {
                    categorizedItems[category] = {};
                }
                
                const itemKey = `${item.name}-${item.text}`;
                if (!categorizedItems[category][itemKey]) {
                    categorizedItems[category][itemKey] = {
                        ...item,
                        count: 1
                    };
                } else {
                    categorizedItems[category][itemKey].count++;
                }
            }
        });

        // Add items with category headers
        Object.keys(categorizedItems).sort().forEach(category => {
            // Skip empty categories
            if (Object.keys(categorizedItems[category]).length === 0) return;
            
            // Add category header
            this.items.push({
                isCategoryHeader: true,
                name: category
            });
            
            // Add items in this category
            Object.values(categorizedItems[category]).forEach(item => {
                this.items.push({
                    ...item,
                    category: category,
                    isCategoryHeader: false
                });
            });
        });

        this.choosingItemStatus = true;
    }

    private getItemCategory(item: PokeItemsTemplate): string {
        // Determine item category based on item text
        const text = item.text.toLowerCase();
        if (text.includes('berry')) return 'Berries';
        if (text.includes('evolution')) return 'Evolution Items';
        if (text.includes('stone')) return 'Evolution Items';
        if (text.includes('plate')) return 'Type Enhancement';
        if (text.includes('incense')) return 'Type Enhancement';
        if (text.includes('orb')) return 'Type Enhancement';
        if (text.includes('gem')) return 'Type Enhancement';
        if (text.includes('memory')) return 'Type Enhancement';
        if (text.includes('drive')) return 'Type Enhancement';
        if (text.includes('mail')) return 'Mail';
        if (text.includes('ball')) return 'Poké Balls';
        return 'Held Items';
    }

    holdItem(item: PokeItemsTemplate) {
        this.team.active.item = item;
        this.exitItemSelection();
    }

    dropActiveHeldItem() {
        if (this.team.active.item) {
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
        this.itemSearchText = '';
    }
}
