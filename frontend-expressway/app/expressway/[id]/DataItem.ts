interface InterchangeItem {
    InterchangeId: number;
    SectionId: number;
    NameInterchange: string;
    Type?: string;
    Location: string;
    Longitude: number | null;
    Latitude: number | null;
    BOT: string;
    Connection?: string;
    Status?: string;
}

interface RestStopItem {
    RestStopId: number;
    SectionId: number;
    NameRestStop: string;
    Location: string;
    Longitude: number | null;
    Latitude: number | null;
    HasPetrol: boolean;
    HasFood: boolean;
    HasToilet: boolean;
    Status?: string;
}

interface BridgeItem {
    BridgeId?: number;
    NameBridge?: string;
    Location?: string;
    LengthMeter?: number;
}

interface TunnelItem {
    TunnelId?: number;
    NameTunnel?: string;
    Location?: string;
    LengthMeter?: number;
}

interface ProvinceItem {
    ProvinceId: number;
    ProvinceName: string;
    Region: string;
}

interface SectionDetail {
    SectionId: number;
    ExpresswayId: number;
    NameSection: string;
    Image: string;
    Length: number;
    StartLocation: string;
    StartKm: number;
    EndLocation: string;
    EndKm: number;
    SpeedSign: string | null;
    SpeedLimit: string | null;
    TrafficLand: number;
    HasEmergencyLand: boolean;
    Status: string;
    MapData: string;
    restStop?: RestStopItem[];
    interchange?: InterchangeItem[];
    bridge?: BridgeItem[];
    tunnel?: TunnelItem[];
    province?: ProvinceItem[];
}