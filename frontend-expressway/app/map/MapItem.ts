interface ExpresswayItem {
    ExpresswayId: number;
    NameExpressway: string;
    Symbol: string;
    Description?: string;
    Tag?: string;
    MapData?: string;
}

interface SectionItem {
    SectionId: number;
    ExpresswayId: number;
    NameSection: string;
    MapData: string;
    SpeedSign?: string;
    SpeedLimit?: string;
    lat?: number;
    lng?: number;
    interchange?: InterchangeItem[];
    restStop?: RestStopItem[];
}

interface InterchangeItem {
    InterchangeId: number;
    SectionId: number;
    NameInterchange: string;
    Location: string;
    Latitude: number | null;
    Longitude: number | null;
    Type?: string;
    Connection?: string;
    Status?: string;
}

interface RestStopItem {
    RestStopId: number;
    SectionId: number;
    NameRestStop: string;
    Location: string;
    Latitude: number | null;
    Longitude: number | null;
    HasPetrol: boolean;
    HasFood: boolean;
    HasToilet: boolean;
    Status?: string;
}