import { Component, Input } from '@angular/core';
import { PokemonTemplate } from 'src/app/interfaces/pokemon';

import { ServerService } from 'src/app/services/serverService';
import { TrainerTracker } from 'src/app/services/trainerTracker';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent{
    @Input() trainerTracker: TrainerTracker;
    @Input() serverService: ServerService;
    public username: string;
    public newPlayerMenu = false;
    public starters: Array<PokemonTemplate> = [];

    public async login() {
        console.log(this.username);
        if (!this.username) {
            console.error("No username sent.")
        }
        await this.serverService.findPlayerByName(this.username)
            .then( (res) => {
                this.trainerTracker.setTrainer(res.id!, this.serverService!)
            }).catch( (err) => {
                console.error(err);
            });
    }

    public async newPlayer() {
        this.newPlayerMenu = true;
        await this.serverService.encounterStarters(0)
            .then( (res) => {
                this.starters = res;
                console.log(this.starters);
            }).catch( (err) => {
                console.error(err);
            });
    }

    public async createPlayer(chosen: PokemonTemplate) {
        if (!this.username) {
            return;
        }
        console.log(`Choosing ${chosen.base.name}`);
        await this.serverService.createPlayer(this.username)
            .then( (res) => {
                console.log(res);
                this.trainerTracker.setTrainer(res.id!, this.serverService!);
                chosen.owner = res.id!;
                this.serverService.catchStarters(res.id!, chosen);
                this.serverService.starterItems(res.id!);
            }).catch( (err) => {
                console.error(err);
            });
    }
}
