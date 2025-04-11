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

  exitBackpack(): void {
    this.menuService.setNewView("defaultView");
  }
}