import pytest
from fastapi.testclient import TestClient
from main import app
from synthetic_data import PROPERTY_ALPHA_CORPUS, PROPERTY_BETA_CORPUS
from parser import deterministic_regex_parse
from signer import sign_asset_passport_vc

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

def test_deterministic_alpha_extraction():
    combined = "\n".join(PROPERTY_ALPHA_CORPUS["documents"].values())
    specs = deterministic_regex_parse(combined, "US-CA-ONT-001")
    assert specs.clear_height_ft == 40.0
    assert specs.floor_slab_psi == 650
    assert specs.power_capacity_kva == 4000
    assert specs.phase_1_esa_clean is True

def test_deterministic_beta_extraction_catches_defect():
    combined = "\n".join(PROPERTY_BETA_CORPUS["documents"].values())
    specs = deterministic_regex_parse(combined, "US-OH-CMH-002")
    assert specs.power_capacity_kva == 500
    assert specs.phase_1_esa_clean is False
    assert specs.rec_count == 1

def test_vc_ecdsa_signing():
    combined = "\n".join(PROPERTY_ALPHA_CORPUS["documents"].values())
    specs = deterministic_regex_parse(combined, "US-CA-ONT-001")
    vc = sign_asset_passport_vc(specs)
    assert vc.credentialSubject.assetCode == "US-CA-ONT-001"
    assert len(vc.proof.proofValue) > 64
    assert vc.ipfsCid.startswith("bafybeic")
