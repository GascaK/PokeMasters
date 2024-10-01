import { PokemonMaster } from '../interfaces/pokeMaster';
import { ServerService } from './serverService';

export class TrainerTracker{
    private trainer: PokemonMaster;
    private loggedIn: boolean = false;

    constructor() {}

    setTrainer(id: number, serverService: ServerService){
        this.trainer = new PokemonMaster(id, serverService);
        this.loggedIn = true;
    }

    async getTrainer(){
        await this.trainer.reloadItems();
        await this.trainer.reloadPlayer();
        await this.trainer.reloadPokemon();
        return this.trainer;
    }

    isLoggedIn(): Boolean{
        return this.loggedIn;
    }
}