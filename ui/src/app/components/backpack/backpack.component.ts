import { Component, Input, OnInit } from '@angular/core';
import { PokeItemsTemplate } from 'src/app/interfaces/pokeItems';
import { PokemonMaster } from 'src/app/interfaces/pokeMaster';
import { TrackerService } from 'src/app/services/trackingService';

@Component({
    selector: 'app-backpack',
    templateUrl: './backpack.component.html',
    styleUrls: ['./backpack.component.css']
})
export class BackpackComponent implements OnInit{
    @Input() trainerTracker: TrackerService;
    public trainer: PokemonMaster;
    public itemList = new Map<string, {id: number, name: string, count: number, text: string}>; 

    ngOnInit() {
        if (this.trainerTracker?.isMasterSet())
        {
            this.trainer = this.trainerTracker.getMaster();
            let inventory: number;
            this.trainer.items.forEach( (item) => {
                console.log(item);
                if (this.itemList.has(item.name)) {
                    inventory = this.itemList.get(item.name)!.count + 1;
                } else {
                    inventory = 1;
                }
                this.itemList.set(item.name, {
                    id: item._id,
                    name: item.name,
                    count: inventory,
                    text: item.text
                })

            });
        }
    }

    useItem(itemID: number) {
        this.trainer.removeItem(itemID);
        this.exitBackpack();
    }

    exitBackpack() {
        this.trainerTracker.setNewView("defaultView");
    }

}
