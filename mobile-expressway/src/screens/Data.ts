export interface ExpresswayItem {
    ExpresswayId: number;
    NameExpressway: string;
    Symbol: string;
    Description?: string;
    Tag?: string;
    MapData?: string;
}

export interface SectionItem {
    SectionId: number;
    ExpresswayId: number;
    NameSection: string;
    MapData: string;
    SpeedSign?: string;
    SpeedLimit?: string;
    MaxSpeed?: number;
    MinSpeed?: number;
    lat?: number;
    lng?: number;
    interchange?: InterchangeItem[];
    restStop?: RestStopItem[];
    Status?: string;
}

export interface InterchangeItem {
    InterchangeId: number;
    SectionId: number;
    NameInterchange: string;
    Type?: string | null;
    Location?: string | null;
    Longitude?: number | null;
    Latitude?: number | null;
    BOT?: string | null;
    Connection?: string | null;
    Status?: string | null;
}

export interface RestStopItem {
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

export interface TunnelItem {
    TunnelId: number;
    SectionId: number;
    NameTunnel: string;
    Length: number;
    Height: number;
    Longitude?: number | null;
    Latitude?: number | null;
    MaxSpeed?: number;
    MinSpeed?: number;
    HasLighting: boolean;
}