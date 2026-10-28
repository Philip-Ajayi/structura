from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from schemas import ExtractedPropertySpecs, VerifiableCredential, DiscrepancyCheckRequest, DiscrepancyReport
from parser import extract_with_groq_or_fallback
from signer import sign_asset_passport_vc
from synthetic_data import PROPERTY_ALPHA_CORPUS, PROPERTY_BETA_CORPUS
from contracts_bridge import initialize_blockchain_environment, deposit_escrow, settle_escrow, get_onchain_status

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize contracts on Anvil at startup
    try:
        initialize_blockchain_environment()
    except Exception as e:
        print(f"[!] Warning: Could not initialize Anvil bridge immediately: {e}")
    yield

app = FastAPI(
    title="Structura Property Intelligence Protocol API",
    version="1.0.0",
    description="Deterministic ingestion, extraction, and live EVM escrow execution.",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "service": "Structura Live Node Engine", "version": "1.0.0"}

@app.get("/api/blockchain/status")
def blockchain_status():
    """Returns real-time balances and block numbers from the running Anvil EVM node."""
    return get_onchain_status()

@app.post("/api/escrow/deposit/{asset_code}")
def api_escrow_deposit(asset_code: str):
    """Broadcasts a live deposit transaction on the EVM node."""
    return deposit_escrow(asset_code)

@app.post("/api/escrow/settle/{asset_code}")
def api_escrow_settle(asset_code: str):
    """Executes live settlement or returns the actual EVM revert error."""
    return settle_escrow(asset_code)

@app.get("/api/properties/{asset_code}/corpus")
def get_property_corpus(asset_code: str):
    if asset_code == "US-CA-ONT-001":
        return PROPERTY_ALPHA_CORPUS
    elif asset_code == "US-OH-CMH-002":
        return PROPERTY_BETA_CORPUS
    raise HTTPException(status_code=404, detail="Asset not found")

@app.post("/api/extract/{asset_code}", response_model=ExtractedPropertySpecs)
async def extract_specifications(asset_code: str):
    if asset_code == "US-CA-ONT-001":
        docs = PROPERTY_ALPHA_CORPUS["documents"]
    elif asset_code == "US-OH-CMH-002":
        docs = PROPERTY_BETA_CORPUS["documents"]
    else:
        raise HTTPException(status_code=404, detail="Asset not found")

    return await extract_with_groq_or_fallback(docs, asset_code)

@app.post("/api/passport/issue/{asset_code}", response_model=VerifiableCredential)
async def issue_passport(asset_code: str):
    if asset_code == "US-CA-ONT-001":
        docs = PROPERTY_ALPHA_CORPUS["documents"]
    elif asset_code == "US-OH-CMH-002":
        docs = PROPERTY_BETA_CORPUS["documents"]
    else:
        raise HTTPException(status_code=404, detail="Asset code not supported")

    specs = await extract_with_groq_or_fallback(docs, asset_code)
    return sign_asset_passport_vc(specs)

@app.post("/api/discrepancy/check", response_model=DiscrepancyReport)
def check_discrepancy(req: DiscrepancyCheckRequest):
    details = []
    has_discrepancy = False

    if req.broker_claimed_power_kva > req.verified_specs.power_capacity_kva:
        has_discrepancy = True
        deficit = req.broker_claimed_power_kva - req.verified_specs.power_capacity_kva
        details.append(
            f"CRITICAL POWER DEFICIT: Broker claimed {req.broker_claimed_power_kva} kVA, "
            f"utility interconnection limits capacity to {req.verified_specs.power_capacity_kva} kVA "
            f"({deficit} kVA deficit)."
        )

    if not req.verified_specs.phase_1_esa_clean:
        has_discrepancy = True
        details.append(
            f"ENVIRONMENTAL REC DEFECT: Site exhibits {req.verified_specs.rec_count} active condition(s). "
            f"Escrow requires 0 RECs."
        )

    if req.broker_claimed_clear_height > req.verified_specs.clear_height_ft:
        has_discrepancy = True
        details.append(
            f"CLEAR HEIGHT DEFICIT: Broker claimed {req.broker_claimed_clear_height} ft, "
            f"verified engineering report confirms {req.verified_specs.clear_height_ft} ft."
        )

    return DiscrepancyReport(
        status="NON_COMPLIANT_DEFICIT" if has_discrepancy else "PASS",
        has_discrepancies=has_discrepancy,
        discrepancy_details=details,
        can_proceed_to_escrow=not has_discrepancy
    )
