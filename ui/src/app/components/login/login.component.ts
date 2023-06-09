import { Component, Input } from '@angular/core';

import { TrackerService } from 'src/app/services/trackingService';
import { ServerService } from 'src/app/services/serverService';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent{
    private instance = new ServerService();
    @Input() trainerTracker: TrackerService | null = null;

    public async login(id: number) {
        this.trainerTracker!.setMaster(await this.instance.getPokemonMaster(id));
    }
}
