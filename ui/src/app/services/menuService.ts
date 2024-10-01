
export class MenuService {
    public views = new Map<string, boolean>;

    constructor() {
        this.views.set("defaultView", true);
        this.views.set("infoView", false);
        this.views.set("activeView", false);
        this.views.set("dexView", false);
        this.views.set("encounterView", false);
        this.views.set("shopView", false);
        this.views.set("backpackView", false);
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