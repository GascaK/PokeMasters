import { Component } from '@angular/core';

import { TrackerService } from './services/trackingService';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    public trackerService = new TrackerService();
    constructor(){}
    
    public loggedIn() {
        return this.trackerService.isMasterSet();
    }
}
