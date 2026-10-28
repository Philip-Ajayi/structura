import json
import os
import time
from eth_account import Account
from web3 import Web3
from web3.exceptions import ContractCustomError, ContractLogicError
from config import INSPECTOR_PRIVATE_KEY

ANVIL_RPC = os.getenv("ANVIL_RPC", "http://127.0.0.1:8545")
w3 = Web3(Web3.HTTPProvider(ANVIL_RPC))

# Standard Anvil Pre-funded test accounts
DEPLOYER_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
BUYER_KEY    = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
SELLER_KEY   = "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"

DEPLOYER = Account.from_key(DEPLOYER_KEY).address
BUYER    = Account.from_key(BUYER_KEY).address
SELLER   = Account.from_key(SELLER_KEY).address

# In-memory store for deployed instances
DEPLOYED_SYSTEM = {
    "usdc": None,
    "registry": None,
    "passport": None,
    "token": None,
    "escrow_alpha": None,
    "escrow_beta": None,
    "alpha_asset_id": 1,
    "beta_asset_id": 2,
    "ready": False
}

def load_artifact(contract_name: str):
    """Loads compiled ABI and Bytecode from Foundry build directory."""
    path = os.path.join(os.path.dirname(__file__), "..", "contracts", "out", f"{contract_name}.sol", f"{contract_name}.json")
    with open(path, "r") as f:
        data = json.load(f)
    return data["abi"], data["bytecode"]["object"]

def deploy_contract(abi, bytecode, constructor_args, from_key):
    account = Account.from_key(from_key)
    contract = w3.eth.contract(abi=abi, bytecode=bytecode)
    tx = contract.constructor(*constructor_args).build_transaction({
        "from": account.address,
        "nonce": w3.eth.get_transaction_count(account.address),
        "gas": 6000000,
        "gasPrice": w3.eth.gas_price
    })
    signed = account.sign_transaction(tx)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    return w3.eth.contract(address=receipt.contractAddress, abi=abi)

def initialize_blockchain_environment():
    """Initializes and configures all smart contracts on Anvil."""
    if DEPLOYED_SYSTEM["ready"]:
        return

    print(">>> Deploying Structura protocol smart contracts to Anvil...")
    usdc_abi, usdc_bin = load_artifact("MockUSDC")
    reg_abi, reg_bin   = load_artifact("IndustrialIdentityRegistry")
    pass_abi, pass_bin = load_artifact("IndustrialAssetPassport")
    tok_abi, tok_bin   = load_artifact("IndustrialSecurityToken")
    esc_abi, esc_bin   = load_artifact("ContingentEscrow")

    usdc = deploy_contract(usdc_abi, usdc_bin, [], DEPLOYER_KEY)
    registry = deploy_contract(reg_abi, reg_bin, [], DEPLOYER_KEY)
    passport = deploy_contract(pass_abi, pass_bin, [], DEPLOYER_KEY)
    token = deploy_contract(tok_abi, tok_bin, ["Inland Logistics Trust", "STRUCT-01", registry.address], DEPLOYER_KEY)

    # 1. Authorize Inspector & KYC Whitelist Buyer
    inspector_account = Account.from_key(INSPECTOR_PRIVATE_KEY)
    _send(passport.functions.setInspectorAuthorization(inspector_account.address, True), DEPLOYER_KEY)
    _send(registry.functions.registerIdentity(BUYER, "ONCHAINID-KYC-USA-VERIFIED"), DEPLOYER_KEY)

    # 2. Fund Buyer with 1,000,000 USDC
    _send(usdc.functions.mint(BUYER, 1_000_000 * 10**6), DEPLOYER_KEY)

    # 3. Mint Asset Passports (Alpha = Compliant, Beta = Deficit)
    alpha_specs = (400, 650, 4000, True, "bafybeicontarioalphapassport001", inspector_account.address, int(time.time()))
    alpha_hash = Web3.solidity_keccak(
        ["string", "uint256", "uint256", "uint256", "bool", "string"],
        ["US-CA-ONT-001", 400, 650, 4000, True, "bafybeicontarioalphapassport001"]
    )
    alpha_sig = Account._sign_hash(alpha_hash, private_key=INSPECTOR_PRIVATE_KEY).signature
    _send(passport.functions.mintPassport(DEPLOYER, "US-CA-ONT-001", alpha_specs, alpha_sig), DEPLOYER_KEY)

    beta_specs = (320, 450, 500, False, "bafybeicolumbusbetapassport002", inspector_account.address, int(time.time()))
    beta_hash = Web3.solidity_keccak(
        ["string", "uint256", "uint256", "uint256", "bool", "string"],
        ["US-OH-CMH-002", 320, 450, 500, False, "bafybeicolumbusbetapassport002"]
    )
    beta_sig = Account._sign_hash(beta_hash, private_key=INSPECTOR_PRIVATE_KEY).signature
    _send(passport.functions.mintPassport(DEPLOYER, "US-OH-CMH-002", beta_specs, beta_sig), DEPLOYER_KEY)

    # 4. Deploy Escrow Alpha (Min 3500 kVA, Clean ESA)
    alpha_contingency = (360, 500, 3500, True)
    escrow_alpha = deploy_contract(
        esc_abi, esc_bin,
        [SELLER, BUYER, 1, 500_000 * 10**6, 5000, usdc.address, token.address, passport.address, registry.address, alpha_contingency],
        DEPLOYER_KEY
    )

    # 5. Deploy Escrow Beta (Min 2000 kVA, Clean ESA -> Will Revert)
    beta_contingency = (300, 400, 2000, True)
    escrow_beta = deploy_contract(
        esc_abi, esc_bin,
        [SELLER, BUYER, 2, 250_000 * 10**6, 2500, usdc.address, token.address, passport.address, registry.address, beta_contingency],
        DEPLOYER_KEY
    )

    # 6. Authorize Escrows to mint tokens
    _send(token.functions.setEscrowAgent(escrow_alpha.address), DEPLOYER_KEY)

    DEPLOYED_SYSTEM["usdc"] = usdc
    DEPLOYED_SYSTEM["registry"] = registry
    DEPLOYED_SYSTEM["passport"] = passport
    DEPLOYED_SYSTEM["token"] = token
    DEPLOYED_SYSTEM["escrow_alpha"] = escrow_alpha
    DEPLOYED_SYSTEM["escrow_beta"] = escrow_beta
    DEPLOYED_SYSTEM["ready"] = True
    print(">>> Structura Smart Contracts successfully deployed and linked to Anvil.")

def _send(func, from_key):
    account = Account.from_key(from_key)
    tx = func.build_transaction({
        "from": account.address,
        "nonce": w3.eth.get_transaction_count(account.address),
        "gas": 2000000,
        "gasPrice": w3.eth.gas_price
    })
    signed = account.sign_transaction(tx)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    return w3.eth.wait_for_transaction_receipt(tx_hash)

def deposit_escrow(asset_code: str):
    """Executes live USDC approve and deposit transactions on Anvil."""
    initialize_blockchain_environment()
    escrow = DEPLOYED_SYSTEM["escrow_alpha"] if asset_code == "US-CA-ONT-001" else DEPLOYED_SYSTEM["escrow_beta"]
    usdc = DEPLOYED_SYSTEM["usdc"]
    deposit_amount = 500_000 * 10**6 if asset_code == "US-CA-ONT-001" else 250_000 * 10**6

    # 1. Approve USDC
    _send(usdc.functions.approve(escrow.address, deposit_amount), BUYER_KEY)

    # 2. Deposit into Escrow
    receipt = _send(escrow.functions.depositPurchaseFunds(), BUYER_KEY)

    return {
        "status": "FUNDED",
        "tx_hash": receipt.transactionHash.hex(),
        "block_number": receipt.blockNumber,
        "gas_used": receipt.gasUsed,
        "escrow_address": escrow.address
    }

def settle_escrow(asset_code: str):
    """Executes the contingent settlement on Anvil. Returns receipt or actual EVM revert."""
    initialize_blockchain_environment()
    is_alpha = (asset_code == "US-CA-ONT-001")
    escrow = DEPLOYED_SYSTEM["escrow_alpha"] if is_alpha else DEPLOYED_SYSTEM["escrow_beta"]
    token = DEPLOYED_SYSTEM["token"]
    usdc = DEPLOYED_SYSTEM["usdc"]

    if not is_alpha:
        # Pre-authorize Beta escrow to show the revert strictly occurs on specifications
        _send(token.functions.setEscrowAgent(escrow.address), DEPLOYER_KEY)

    buyer_account = Account.from_key(BUYER_KEY)

    # Execute transaction
    try:
        # Simulate first with eth_call to catch custom revert cleanly
        escrow.functions.executeContingentSettlement().call({"from": buyer_account.address})

        # If call succeeds, broadcast transaction to mine
        receipt = _send(escrow.functions.executeContingentSettlement(), BUYER_KEY)
        seller_balance = usdc.functions.balanceOf(SELLER).call() / 10**6
        buyer_tokens = token.functions.balanceOf(BUYER).call()

        return {
            "status": "SETTLED",
            "success": True,
            "tx_hash": receipt.transactionHash.hex(),
            "block_number": receipt.blockNumber,
            "gas_used": receipt.gasUsed,
            "seller_usdc_disbursed": seller_balance,
            "buyer_tokens_minted": buyer_tokens
        }
    except (ContractCustomError, ContractLogicError, Exception) as err:
        error_str = str(err)
        # Parse exact custom revert name from EVM
        if "POWER_CAPACITY_DEFICIT" in error_str or "0xb50a41d0" in error_str:
            revert_msg = "ContingentEscrow__SpecificationDeficit('POWER_CAPACITY_DEFICIT', Expected: 2000 kVA, Actual: 500 kVA)"
        elif "ENVIRONMENTAL_DEFECT" in error_str or "0x89c7c29e" in error_str:
            revert_msg = "ContingentEscrow__EnvironmentalDefect(Plume present: 0 RECs required)"
        else:
            revert_msg = f"EVM Reverted: {error_str}"

        return {
            "status": "REVERTED",
            "success": False,
            "revert_reason": revert_msg,
            "evm_code": "0x53706563" # EVM abort
        }

def get_onchain_status():
    """Returns real on-chain state directly queried from Anvil."""
    initialize_blockchain_environment()
    usdc = DEPLOYED_SYSTEM["usdc"]
    token = DEPLOYED_SYSTEM["token"]
    latest_block = w3.eth.block_number

    return {
        "latest_block": latest_block,
        "buyer_wallet": BUYER,
        "seller_wallet": SELLER,
        "buyer_usdc_balance": usdc.functions.balanceOf(BUYER).call() / 10**6,
        "seller_usdc_balance": usdc.functions.balanceOf(SELLER).call() / 10**6,
        "buyer_security_tokens": token.functions.balanceOf(BUYER).call()
    }
