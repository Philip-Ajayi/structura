from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class ExtractedPropertySpecs(BaseModel):
    asset_code: str = Field(..., example="US-CA-ONT-001")
    property_name: str = Field(..., example="Inland Empire Logistics Center IV")
    clear_height_ft: float = Field(..., description="Clear ceiling height in feet", example=40.0)
    floor_slab_psi: int = Field(..., description="Floor slab load capacity in psf/psi", example=650)
    power_capacity_kva: int = Field(..., description="Utility substation capacity in kVA", example=4000)
    phase_1_esa_clean: bool = Field(..., description="True if 0 RECs found", example=True)
    rec_count: int = Field(default=0, example=0)
    identified_recs: List[str] = Field(default_factory=list)
    source_snippets: Dict[str, str] = Field(default_factory=dict)

class VerifiableCredentialSubject(BaseModel):
    id: str
    assetCode: str
    clearHeightFt: float
    floorSlabPsi: int
    powerCapacityKva: int
    phase1EsaClean: bool
    recCount: int

class VerifiableCredentialProof(BaseModel):
    type: str = "EthereumSecp256k1Signature2024"
    created: str
    verificationMethod: str
    proofValue: str

class VerifiableCredential(BaseModel):
    context: List[str] = ["https://www.w3.org/2018/credentials/v1", "https://structura.io/schema/v1"]
    id: str
    type: List[str] = ["VerifiableCredential", "IndustrialAssetPassportCredential"]
    issuer: str
    issuanceDate: str
    credentialSubject: VerifiableCredentialSubject
    proof: VerifiableCredentialProof
    ipfsCid: Optional[str] = None

class DiscrepancyCheckRequest(BaseModel):
    broker_claimed_power_kva: int
    broker_claimed_clear_height: float
    verified_specs: ExtractedPropertySpecs

class DiscrepancyReport(BaseModel):
    status: str # "PASS" or "NON_COMPLIANT_DEFICIT"
    has_discrepancies: bool
    discrepancy_details: List[str]
    can_proceed_to_escrow: bool
