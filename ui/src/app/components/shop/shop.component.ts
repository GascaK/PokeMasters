import { Component, Input, OnInit } from '@angular/core';
import { PokeItemsTemplate } from 'src/app/interfaces/pokeItems';
import { PokemonMaster } from 'src/app/interfaces/pokeMaster';
import { MenuService } from 'src/app/services/menuService';
import ServerService from 'src/app/services/serverService';
import { TrainerTracker } from 'src/app/services/trainerTracker';


interface GroupedItems {
    name: string;
    items: PokeItemsTemplate[];
    count: number;
  }

@Component({
    selector: 'app-shop',
    templateUrl: './shop.component.html',
    styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit {
    @Input() trainerTracker: TrainerTracker;
    @Input() serverService: ServerService;
    @Input() menuService: MenuService;

    public trainer: PokemonMaster;
    public shop: Array<PokeItemsTemplate>;
    public groupedShop: GroupedItems[] = [];

    async ngOnInit() {
        if (this.trainerTracker?.isLoggedIn()){
            this.trainer = await this.trainerTracker.getTrainer();
            this.getNewShop(this.trainer.getCurrentTier() * 2);
        }
    }

    async getNewShop(shelfSpace: number): Promise<void> {
        try {
          const shopItems = await this.serverService.getItemsShop(
            this.trainer.id,
            this.trainer.getCurrentTier(),
            shelfSpace
          );

          this.shop = shopItems.sort((a, b) => a.cost - b.cost);
          this.groupItemsByName();
        } catch (error) {
          console.error('Error loading shop items:', error);
        }
      }

      groupItemsByName(): void {
        // Create a map to group items by name
        const groupMap = new Map<string, PokeItemsTemplate[]>();
        
        // Group items by their name
        this.shop.forEach(item => {
          if (!groupMap.has(item.name)) {
            groupMap.set(item.name, []);
          }
          groupMap.get(item.name)!.push(item);
        });
        
        // Convert map to array of GroupedItems with count
        this.groupedShop = Array.from(groupMap.entries()).map(([name, items]) => ({
          name,
          items: items.sort((a, b) => a.cost - b.cost), // Sort items within each group by cost
          count: items.length
        }));
        
        // Sort groups by name for consistent display
        this.groupedShop.sort((a, b) => a.name.localeCompare(b.name));
      }
    
      /**
       * Check if the trainer can afford the item
       */
      canAffordItem(item: PokeItemsTemplate): boolean {
        return this.trainer && this.trainer.dollars >= item.cost;
      }
    
      /**
       * Purchase an item and update trainer's dollars
       */
      async purchaseItem(item: PokeItemsTemplate): Promise<void> {
        try {
          const result = await this.trainer.buyItem(item);
          console.log(result);
          
          // Update trainer data to reflect new balance
          this.updateTrainerBalance();
          
          // Remove item from shop array
          const index = this.shop.indexOf(item);
          if (index > -1) {
            this.shop.splice(index, 1);
          }
          
          // Regroup items after purchase
          this.groupItemsByName();
        } catch (error) {
          console.error('Error purchasing item:', error);
          alert((error as Error).message);
        }
      }
    
      /**
       * Refresh trainer data to get updated dollars/balance
       */
      async updateTrainerBalance(): Promise<void> {
        try {
          // Fetch the latest trainer data to get updated balance
          this.trainer = await this.trainerTracker.getTrainer();
        } catch (error) {
          console.error('Error updating trainer balance:', error);
        }
      }

    returnView() {
        this.menuService.setNewView("defaultView");
    }

}
