export interface PropertyData {
  id: string;
  assetCode: string;
  name: string;
  location: string;
  sqft: number;
  brokerClaims: {
    clearHeight: number;
    powerKva: number;
    slabPsi: number;
    environmental: string;
  };
  verifiedSpecs: {
    clearHeight: number;
    powerKva: number;
    slabPsi: number;
    environmentalClean: boolean;
    recCount: number;
    recDetails?: string;
  };
  documents: {
    title: string;
    type: string;
    cid: string;
    excerpt: string;
    page: number;
    highlightMatch: string;
  }[];
}

export const PROPERTIES: Record<string, PropertyData> = {
  "US-CA-ONT-001": {
    id: "alpha",
    assetCode: "US-CA-ONT-001",
    name: "Inland Empire Logistics Center IV",
    location: "Ontario, California",
    sqft: 385000,
    brokerClaims: {
      clearHeight: 40.0,
      powerKva: 4000,
      slabPsi: 650,
      environmental: "Clean ASTM E1527-21"
    },
    verifiedSpecs: {
      clearHeight: 40.0,
      powerKva: 4000,
      slabPsi: 650,
      environmentalClean: true,
      recCount: 0
    },
    documents: [
      {
        title: "Structural Engineering & Slab Load Schedule",
        type: "STRUCTURAL_REPORT",
        cid: "bafybeicz7structuralontario44820",
        page: 18,
        highlightMatch: "40.0 feet measured from finished slab to bottom of steel truss",
        excerpt: "The finished floor system consists of an 8-inch reinforced concrete slab. Minimum verified slab load capacity is 650 pounds per square foot (psf). Interior minimum clear height was surveyed at 40.0 feet measured from finished slab to bottom of steel truss."
      },
      {
        title: "SCE Electric Interconnection Schedule",
        type: "UTILITY_AGREEMENT",
        cid: "bafybeicelectricinterconnectsce9921",
        page: 4,
        highlightMatch: "Total Allocated Capacity: 4,000 kVA @ 12kV 3-Phase",
        excerpt: "Service ID: SCE-IND-884920. Connected Tariff: Schedule TOU-8 General Service Large. Total Allocated Capacity: 4,000 kVA @ 12kV 3-Phase. Status: ACTIVE / PERMANENT INTERCONNECTION COMPLETE."
      },
      {
        title: "ASTM E1527-21 Phase I Environmental Assessment",
        type: "PHASE_I_ESA",
        cid: "bafybeicphase1esaapexenvironmental003",
        page: 2,
        highlightMatch: "Recognized Environmental Conditions (RECs): NONE (0)",
        excerpt: "Apex Environmental Specialists conducted this Phase I ESA in conformance with ASTM Practice E1527-21. Table 1: Identified Environmental Conditions: Recognized Environmental Conditions (RECs): NONE (0). Conclusion: No further investigation required."
      }
    ]
  },
  "US-OH-CMH-002": {
    id: "beta",
    assetCode: "US-OH-CMH-002",
    name: "Columbus Cold & Logistics Hub",
    location: "Groveport, Ohio",
    sqft: 240000,
    brokerClaims: {
      clearHeight: 36.0,
      powerKva: 2500, // Broker claims 2,500 kVA
      slabPsi: 500,
      environmental: "Reported Clean"
    },
    verifiedSpecs: {
      clearHeight: 32.0,
      powerKva: 500,  // Verified actual tariff: 500 kVA
      slabPsi: 450,
      environmentalClean: false, // Solvent plume detected
      recCount: 1,
      recDetails: "Historical degreaser chlorinated solvent plume (TCE/PCE) in shallow groundwater."
    },
    documents: [
      {
        title: "American Electric Power (AEP) Tariff Schedule",
        type: "UTILITY_AGREEMENT",
        cid: "bafybeicaeputilityschedulecolumbusdeficit88",
        page: 6,
        highlightMatch: "energized service allocation is limited to 500 kVA",
        excerpt: "Account: 940-209-112. Substation Feed Status: Current energized service allocation is limited to 500 kVA. Note: Pending application for 2,500 kVA upgrade is deferred pending capital utility contribution payment of $1.4M."
      },
      {
        title: "Phase I ESA Executive Summary Table",
        type: "PHASE_I_ESA",
        cid: "bafybeicphase1esatoxicplumedetectedohio11",
        page: 3,
        highlightMatch: "ACTIVE RECOGNIZED ENVIRONMENTAL CONDITION (REC)",
        excerpt: "Table 1: Identified REC 1: Historical degreaser chlorinated solvent plume (TCE/PCE) in shallow groundwater along north lot line. Status: ACTIVE RECOGNIZED ENVIRONMENTAL CONDITION (REC)."
      }
    ]
  }
};
