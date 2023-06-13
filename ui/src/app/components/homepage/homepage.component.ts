import { Component, Input, OnInit } from '@angular/core';
import { PokemonMaster } from 'src/app/interfaces/pokeMaster';
import ServerService from 'src/app/services/serverService';
import { TrackerService } from 'src/app/services/trackingService';

@Component({
    selector: 'app-homepage',
    templateUrl: './homepage.component.html',
    styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
    @Input() trainerTracker: TrackerService;
    public serverService = new ServerService();
    public trainer: PokemonMaster;

    ngOnInit(): void {
        this.trainer = this.trainerTracker.getMaster();
    }

    setView(view: string) {
        this.trainerTracker.setNewView(view);
    }
}
