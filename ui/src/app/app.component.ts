import { Component } from '@angular/core';
import { TrainerTracker } from './services/trainerTracker';
import ServerService from './services/serverService';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    public trainerTracker: TrainerTracker;
    public serverService: ServerService;

    constructor(){
        this.serverService = new ServerService();
        this.trainerTracker = new TrainerTracker();
    }

    public login(id: number): void {
        this.trainerTracker.setTrainer(id, this.serverService);
    }

    public isLoggedIn() {
        if (this.trainerTracker && this.trainerTracker.isLoggedIn()){
            return true;
        }else{
            return false;
        }
    }
}
