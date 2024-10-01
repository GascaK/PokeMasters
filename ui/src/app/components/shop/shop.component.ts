import { Component, Input, OnInit } from '@angular/core';
import { PokeItemsTemplate } from 'src/app/interfaces/pokeItems';
import { PokemonMaster } from 'src/app/interfaces/pokeMaster';
import { MenuService } from 'src/app/services/menuService';
import ServerService from 'src/app/services/serverService';
import { TrainerTracker } from 'src/app/services/trainerTracker';

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

    async ngOnInit() {
        if (this.trainerTracker?.isLoggedIn()){
            this.trainer = await this.trainerTracker.getTrainer();
            this.getNewShop(6);
        }
    }

    async getNewShop(shelfSpace: number) {
        await this.serverService.getItemsShop(this.trainer.id, this.trainer.getCurrentTier(), shelfSpace)
            .then((res) => {
                this.shop = res;
                this.shop.sort((a, b): number => { return a.cost-b.cost })
            });
    }

    async purchaseItem(item: PokeItemsTemplate) {
        this.trainer.buyItem(item)
            .then((res) => {
                console.log(res);
                const index = this.shop.indexOf(item, 0);
                console.log(index);
                if (index > -1){
                    this.shop.splice(index, 1);
                }
            }).catch((err) => {
                console.error(err);
            });
    }

    async randomItem() {
        const item = await this.trainer.getRandomItem(this.trainer.getCurrentTier());
        alert(`Got Item: ${item.name}`);
        this.returnView();
    }

    returnView() {
        this.menuService.setNewView("defaultView");
    }

}
