from eth_account import Account
from eth_account.messages import encode_defunct
from datetime import datetime, timezone
import hashlib
import json
from config import INSPECTOR_PRIVATE_KEY
from schemas import ExtractedPropertySpecs, VerifiableCredential, VerifiableCredentialSubject, VerifiableCredentialProof

def compute_mock_ipfs_cid(content: str) -> str:
    """Computes a deterministic multihash representation for synthetic IPFS pinning."""
    sha256 = hashlib.sha256(content.encode("utf-8")).hexdigest()
    return f"bafybeic{sha256[:44]}"

def sign_asset_passport_vc(specs: ExtractedPropertySpecs) -> VerifiableCredential:
    account = Account.from_key(INSPECTOR_PRIVATE_KEY)
    issuance_date = datetime.now(timezone.utc).isoformat()

    subject = VerifiableCredentialSubject(
        id=f"urn:structura:asset:{specs.asset_code}",
        assetCode=specs.asset_code,
        clearHeightFt=specs.clear_height_ft,
        floorSlabPsi=specs.floor_slab_psi,
        powerCapacityKva=specs.power_capacity_kva,
        phase1EsaClean=specs.phase_1_esa_clean,
        recCount=specs.rec_count
    )

    # Payload to sign conforming to EIP-191
    canonical_payload = (
        f"{specs.asset_code}:"
        f"{int(specs.clear_height_ft * 10)}:"
        f"{specs.floor_slab_psi}:"
        f"{specs.power_capacity_kva}:"
        f"{'1' if specs.phase_1_esa_clean else '0'}"
    )

    encoded_message = encode_defunct(text=canonical_payload)
    signed_message = account.sign_message(encoded_message)

    credential_json = json.dumps(subject.model_dump(), sort_keys=True)
    ipfs_cid = compute_mock_ipfs_cid(credential_json)

    proof = VerifiableCredentialProof(
        created=issuance_date,
        verificationMethod=account.address,
        proofValue=signed_message.signature.hex()
    )

    return VerifiableCredential(
        id=f"urn:uuid:{specs.asset_code}-{int(datetime.now().timestamp())}",
        issuer=f"did:ethr:{account.address}",
        issuanceDate=issuance_date,
        credentialSubject=subject,
        proof=proof,
        ipfsCid=ipfs_cid
    )
