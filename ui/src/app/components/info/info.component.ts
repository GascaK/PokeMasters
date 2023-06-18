import { Component, Input, OnInit } from '@angular/core';

import { TrackerService } from 'src/app/services/trackingService';
import { PokemonMaster } from 'src/app/interfaces/pokeMaster';

@Component({
    selector: 'app-info',
    templateUrl: './info.component.html',
    styleUrls: ['./info.component.css']
})
export class InfoComponent implements OnInit {
    @Input() trainerTracker: TrackerService;
    public trainer: PokemonMaster;

    ngOnInit() {
        if (this.trainerTracker?.isMasterSet())
        {
            this.trainer = this.trainerTracker.getMaster();
        }
    }

    onSubmit(badges: string, tier: string) {
        const checkedBadge = parseInt(badges);
        const checkedTier = parseInt(tier);
        
        if (!isNaN(checkedBadge) && checkedBadge >= 0 && checkedBadge <= 8) {
            this.trainer.badges = checkedBadge;
        } else {
            alert(`Invalid Value for badge: ${badges}`);
        }
        if(!isNaN(checkedTier) && checkedTier >= 1 && checkedTier <= 3) {
            this.trainer.currentTier = checkedTier;
        } else {
            alert(`Invalid Value for tier: ${tier}`);
        }
        this.trainerTracker.getMaster().saveAll();
        this.trainerTracker.setNewView("defaultView");
    }
}
