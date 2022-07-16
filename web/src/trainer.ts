
export interface Trainers {
    trainers: Array<Trainer>;
}

export interface Trainer {
    id: number;
    name: string;
    dollars: number;
    badges: number;
    // team: Array<Pokemon>;
    // items: Array<PokeItem>;
}