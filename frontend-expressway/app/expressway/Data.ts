interface RestStop {
    RestStopId: number;
    NameRestStop: string;
    Status?: string;
}

interface Interchange {
    InterchangeId: number;
    NameInterchange: string;
}

interface Section {
    SectionId: number;
    NameSection: string;
    Image?: string;
    Length: number;
    StartLocation: string;
    StartKm?: number;
    EndLocation: string;
    EndKm?: number;
    Status?: string;
    restStops?: RestStop[];
    restStop?: RestStop[];
    interchange?: Interchange[];
    interchangeCount?: number;
    restStopCount?: number;
}