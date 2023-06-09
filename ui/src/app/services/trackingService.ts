import { PokemonMaster } from "../interfaces/pokeMaster";


export class TrackerService {
    public master: PokemonMaster;
    public defaultView: boolean;
    public infoView: boolean;

    constructor() {
        this.defaultView = true;
        this.infoView = false;
    }

    setMaster(pMaster: PokemonMaster): void {
        this.master = pMaster;
    }

    getMaster(): PokemonMaster{
        return this.master;
    }

    isMasterSet(): Boolean {
        return this.master != null;
    }

    setNewView(view: string) {
        this.setViewsOff();
        if (view == "infoView") {
            this.infoView = true;
        } else {
            this.defaultView = true;
        }
    }

    setViewsOff(): void {
        this.defaultView = false;
        this.infoView = false;
    }
}