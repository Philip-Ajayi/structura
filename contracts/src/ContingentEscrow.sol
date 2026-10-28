// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./MockUSDC.sol";
import "./IndustrialSecurityToken.sol";
import "./IndustrialAssetPassport.sol";
import "./IndustrialIdentityRegistry.sol";

error ContingentEscrow__Unauthorized();
error ContingentEscrow__InvalidState();
error ContingentEscrow__InvestorNotVerified();
error ContingentEscrow__EnvironmentalDefect();
error ContingentEscrow__SpecificationDeficit(string spec, uint256 expected, uint256 actual);

/**
 * @title ContingentEscrow
 * @notice Programmatic closing engine that verifies physical & environmental requirements before releasing funds.
 */
contract ContingentEscrow {
    enum EscrowState { Created, Funded, Settled, Refunded }

    struct ContingencyParameters {
        uint256 minClearHeightFtScaled; // e.g. 360 (36.0 ft)
        uint256 minFloorSlabPsi;        // e.g. 500 psf
        uint256 minPowerCapacityKva;    // e.g. 3500 kVA
        bool requireCleanEsa;           // Must be true (0 RECs)
    }

    address public immutable owner;
    address public immutable seller;
    address public immutable buyer;
    uint256 public immutable assetId;
    uint256 public immutable purchaseAmountUSDC;
    uint256 public immutable tokenMintAmount;

    MockUSDC public immutable usdcToken;
    IndustrialSecurityToken public immutable securityToken;
    IndustrialAssetPassport public immutable assetPassport;
    IndustrialIdentityRegistry public immutable identityRegistry;
    ContingencyParameters public contingencies;

    EscrowState public currentState;

    event EscrowFunded(address indexed buyer, uint256 amount);
    event ContingenciesVerified(uint256 indexed assetId);
    event EscrowSettled(address indexed seller, address indexed buyer, uint256 usdcDisbursed, uint256 tokensMinted);
    event EscrowRefunded(address indexed buyer, uint256 amount);

    constructor(
        address _seller,
        address _buyer,
        uint256 _assetId,
        uint256 _purchaseAmountUSDC,
        uint256 _tokenMintAmount,
        address _usdcToken,
        address _securityToken,
        address _assetPassport,
        address _identityRegistry,
        ContingencyParameters memory _contingencies
    ) {
        owner = msg.sender;
        seller = _seller;
        buyer = _buyer;
        assetId = _assetId;
        purchaseAmountUSDC = _purchaseAmountUSDC;
        tokenMintAmount = _tokenMintAmount;
        usdcToken = MockUSDC(_usdcToken);
        securityToken = IndustrialSecurityToken(_securityToken);
        assetPassport = IndustrialAssetPassport(_assetPassport);
        identityRegistry = IndustrialIdentityRegistry(_identityRegistry);
        contingencies = _contingencies;
        currentState = EscrowState.Created;
    }

    function depositPurchaseFunds() external {
        if (msg.sender != buyer) revert ContingentEscrow__Unauthorized();
        if (currentState != EscrowState.Created) revert ContingentEscrow__InvalidState();

        currentState = EscrowState.Funded;
        bool success = usdcToken.transferFrom(msg.sender, address(this), purchaseAmountUSDC);
        require(success, "Escrow: USDC transfer failed");

        emit EscrowFunded(buyer, purchaseAmountUSDC);
    }

    function executeContingentSettlement() external {
        if (currentState != EscrowState.Funded) revert ContingentEscrow__InvalidState();
        if (!identityRegistry.isVerified(buyer)) revert ContingentEscrow__InvestorNotVerified();

        // 1. Fetch physical specifications from passport
        IIndustrialAssetPassport.AssetSpecifications memory specs = assetPassport.getAssetSpecifications(assetId);

        // 2. Programmatic Contingency Verification
        if (contingencies.requireCleanEsa && !specs.phase1EsaClean) {
            revert ContingentEscrow__EnvironmentalDefect();
        }

        if (specs.clearHeightFtScaled < contingencies.minClearHeightFtScaled) {
            revert ContingentEscrow__SpecificationDeficit(
                "CLEAR_HEIGHT_DEFICIT",
                contingencies.minClearHeightFtScaled,
                specs.clearHeightFtScaled
            );
        }

        if (specs.powerCapacityKva < contingencies.minPowerCapacityKva) {
            revert ContingentEscrow__SpecificationDeficit(
                "POWER_CAPACITY_DEFICIT",
                contingencies.minPowerCapacityKva,
                specs.powerCapacityKva
            );
        }

        if (specs.floorSlabPsi < contingencies.minFloorSlabPsi) {
            revert ContingentEscrow__SpecificationDeficit(
                "FLOOR_SLAB_DEFICIT",
                contingencies.minFloorSlabPsi,
                specs.floorSlabPsi
            );
        }

        emit ContingenciesVerified(assetId);

        // 3. Atomic Dual Execution
        currentState = EscrowState.Settled;

        // Disburse USDC to seller
        bool paid = usdcToken.transfer(seller, purchaseAmountUSDC);
        require(paid, "Escrow: Seller payout failed");

        // Mint ERC-3643 tokens directly to verified buyer
        securityToken.mint(buyer, tokenMintAmount);

        emit EscrowSettled(seller, buyer, purchaseAmountUSDC, tokenMintAmount);
    }

    function refundBuyer() external {
        if (msg.sender != buyer && msg.sender != owner) revert ContingentEscrow__Unauthorized();
        if (currentState != EscrowState.Funded) revert ContingentEscrow__InvalidState();

        currentState = EscrowState.Refunded;
        bool refunded = usdcToken.transfer(buyer, purchaseAmountUSDC);
        require(refunded, "Escrow: Refund transfer failed");

        emit EscrowRefunded(buyer, purchaseAmountUSDC);
    }
}
