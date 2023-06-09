import { Component, Input } from '@angular/core';
import ServerService from 'src/app/services/serverService';
import { TrackerService } from 'src/app/services/trackingService';

@Component({
    selector: 'app-homepage',
    templateUrl: './homepage.component.html',
    styleUrls: ['./homepage.component.css']
})
export class HomepageComponent {
    @Input() trainerTracker: TrackerService;
    public serverService = new ServerService();

    viewInfo(): void {
        this.trainerTracker.setNewView("infoView");
    }
}
