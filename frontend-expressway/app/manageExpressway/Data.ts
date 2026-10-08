interface SectionType {
    SectionId: number;
    ExpresswayId?: number;
    NameSection: string;
    expresswayName?: string;
    Length: number;
    StartLocation?: string;
    StartKm?: number;
    EndLocation?: string;
    EndKm?: number;
    SpeedImage?: string;
    SpeedLimit?: string;
    TrafficLand?: number;
    HasEmergencyLane?: boolean;
    Status?: string;
    bridgeCount?: number;
    tunnelCount?: number;
    interchangeCount?: number;
    totalSectionLength?: number;
}
interface ExpresswayStatistics {
    totalExpressways: number;
    totalSections: number;
    totalSystemLength: number;
    totalSectionsCompleted: number;
    totalSectionsNotYetUnderConstruction: number;
    totalSectionsUnderConstruction: number;
    totalSectionsExtendConstruction: number;
    totalSectionsIncident: number;
    totalSectionsMaintenance: number;
    totalRestStops: number;
    restStopUnderConstruction: number;
    restStopNotYetConstruction: number;
    restStopOperating: number;
    totalUniqueInterchanges: number;
    interchangeUnderConstruction: number;
    interchangeNotYetConstruction: number;
    interchangeComplete: number;
    totalBridges: number;
    totalTunnels: number;
    totalSigns: number;
}