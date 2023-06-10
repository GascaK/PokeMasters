import { PokemonMaster } from "../interfaces/pokeMaster";


export class TrackerService {
    public master: PokemonMaster;
    public views = new Map<string, boolean>;

    constructor() {
        this.views.set("defaultView", true);
        this.views.set("infoView", false);
        this.views.set("activeView", false);
        this.views.set("dexView", false);
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
        if (this.views.has(view)) {
            this.setViewsOff();
            this.views.set(view, true);
        }
    }

    setViewsOff(): void {
        for (let [key, value] of this.views) {
            this.views.set(key, false);
        }
    }
}