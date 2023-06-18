import { Component, Input, OnInit } from '@angular/core';
import { PokeItemsTemplate } from 'src/app/interfaces/pokeItems';
import { PokemonMaster } from 'src/app/interfaces/pokeMaster';
import { TrackerService } from 'src/app/services/trackingService';

@Component({
    selector: 'app-shop',
    templateUrl: './shop.component.html',
    styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit {
    @Input() trainerTracker: TrackerService;
    public trainer: PokemonMaster;
    public shop: Array<PokeItemsTemplate>;

    ngOnInit() {
        if (this.trainerTracker?.isMasterSet()){
            this.trainer = this.trainerTracker.getMaster();
            this.getNewShop(5);
        }
    }

    async getNewShop(shelfSpace: number) {
       this.shop = await this.trainer.getShop(shelfSpace);
    }

    async purchaseItem(item: PokeItemsTemplate) {
        this.trainer.buyItem(item);
        this.returnView();
    }

    async randomItem() {
        const item = await this.trainer.getRandomItem();
        alert(`Got Item: ${item.name}`);
        this.returnView();
    }

    returnView() {
        this.trainerTracker.setNewView("defaultView");
    }

}
