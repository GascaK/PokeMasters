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
export class BackpackComponent implements OnInit{
    @Input() trainerTracker: TrainerTracker;
    @Input() serverService: ServerService;
    @Input() menuService: MenuService;
    
    public trainer: PokemonMaster;
    public itemList: Map<string, {id: number, name: string, count: number, text: string}>; 

    async ngOnInit() {
        if (this.trainerTracker?.isLoggedIn())
        {
            this.trainer = await this.trainerTracker.getTrainer();
            this.updateItemList();
        }
    }

    updateItemList() {
        this.itemList = new Map<string, {id: number, name: string, count: number, text: string}>
        let inventory: number;
        this.trainer.items.forEach( (item) => {
            if (this.itemList.has(item.name)) {
                inventory = this.itemList.get(item.name)!.count + 1;
            } else {
                inventory = 1;
            }
            this.itemList.set(item.name, {
                id: item.id,
                name: item.name,
                count: inventory,
                text: item.text
            });
        });
    }

    useItem(itemID: number) {
        this.serverService.deleteItems(this.trainer.id, itemID)
            .then((res) => {
                console.log("Item removed.")
            }).catch((err) => {
                console.error(err);
            });
        this.exitBackpack();
    }

    async sellItem(itemID: number) {
        this.trainer.items.forEach(async (item) => {
            if (item.id == itemID){
                await this.trainer.sellItem(item)
                    .then(async () => {
                        await this.trainer.reloadItems()
                            .then(() => {
                                this.updateItemList();
                            });
                    });
                return;
            }
        });
    }

    exitBackpack() {
        this.menuService.setNewView("defaultView");
    }

}
