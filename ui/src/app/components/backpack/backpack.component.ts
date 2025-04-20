import { Component, Input, OnInit } from '@angular/core';

import { PokeItemsTemplate } from 'src/app/interfaces/pokeItems';
import { PokemonMaster } from 'src/app/interfaces/pokeMaster';

import { MenuService } from 'src/app/services/menuService';
import { ServerService } from 'src/app/services/serverService';
import { TrainerTracker } from 'src/app/services/trainerTracker';

@Component({
  selector: 'app-backpack',
  templateUrl: './backpack.component.html',
  styleUrls: ['./backpack.component.css']
})
export class BackpackComponent implements OnInit {
  @Input() trainerTracker: TrainerTracker;
  @Input() serverService: ServerService;
  @Input() menuService: MenuService;
  
  public trainer: PokemonMaster;
  public activeTab: 'held' | 'ball' | 'other' = 'held';
  public itemList: Map<string, {id: number, name: string, count: number, text: string, item: PokeItemsTemplate}>;

  async ngOnInit(): Promise<void> {
    if (this.trainerTracker?.isLoggedIn()) {
      this.trainer = await this.trainerTracker.getTrainer();
      this.updateItemList();
    }
  }

  updateItemList(): void {
    this.itemList = new Map<string, {id: number, name: string, count: number, text: string, item: PokeItemsTemplate}>();
    
    this.trainer.items.forEach((item) => {
      const existingItem = this.itemList.get(item.name);
      const count = existingItem ? existingItem.count + 1 : 1;
      
      this.itemList.set(item.name, {
        id: item.id,
        name: item.name,
        count: count,
        text: item.text,
        item: item
      });
    });
  }

  async useItem(item: PokeItemsTemplate): Promise<void> {
    const active = this.trainer.team.active.pokemon;

    if (!active) {
      alert("Warning: Please set an active pokemon before continuing.");
      return;
    }
    
    try {
      await this.serverService.deleteItems(this.trainer.id, item);
      await this.serverService.postItemsUpgrade(this.trainer.id, active.id, [item]);
      
      alert(`Used item ${item.name}`);
      await Promise.all([
        this.trainer.reloadItems().then(() => this.updateItemList()),
        this.trainer.reloadPokemon()
      ]);
      
      this.exitBackpack();
    } catch (err) {
      console.error(err);
    }
  }

  async sellItem(itemID: number): Promise<void> {
    const itemToSell = this.trainer.items.find(item => item.id === itemID);
    
    if (itemToSell) {
      try {
        await this.trainer.sellItem(itemToSell);
        alert(`Sold item $${itemToSell.cost}: ${itemToSell.name}`);
        await this.trainer.reloadItems();
        this.updateItemList();
      } catch (err) {
        console.error(err);
      }
    }
  }

  getItemsByCategory(category: 'held' | 'ball' | 'other'): Array<[string, {id: number, name: string, count: number, text: string, item: PokeItemsTemplate}]> {
    // Create new array to store filtered items
    const filteredItems: Array<[string, {id: number, name: string, count: number, text: string, item: PokeItemsTemplate}]> = [];
    
    // Convert Map to array of entries and filter
    this.itemList.forEach((item, key) => {
      const itemName = item.name.toLowerCase();
      const itemText = item.text.toLowerCase();
      
      if (category === 'held' && (itemText.includes('held item'))) {
        filteredItems.push([key, item]);
      } else if (category === 'ball' && itemName.includes('ball')) {
        filteredItems.push([key, item]);
      } else if (category === 'other' && 
                !itemText.includes('held') &&
                !itemName.includes('ball')) {
        filteredItems.push([key, item]);
      }
    });
    
    return filteredItems;
  }

  exitBackpack(): void {
    this.menuService.setNewView("defaultView");
  }
}