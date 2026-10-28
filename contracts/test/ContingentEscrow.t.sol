// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/MockUSDC.sol";
import "../src/IndustrialIdentityRegistry.sol";
import "../src/IndustrialAssetPassport.sol";
import "../src/IndustrialSecurityToken.sol";
import "../src/ContingentEscrow.sol";

contract ContingentEscrowTest is Test {
    MockUSDC usdc;
    IndustrialIdentityRegistry identityRegistry;
    IndustrialAssetPassport assetPassport;
    IndustrialSecurityToken securityToken;
    ContingentEscrow escrow;

    address seller = address(0x1111);
    address buyer = address(0x2222);
    uint256 inspectorPrivateKey = 0xA11CE;
    address inspector;

    uint256 compliantAssetId;
    uint256 discrepantAssetId;

    function setUp() public {
        inspector = vm.addr(inspectorPrivateKey);

        // 1. Deploy Infrastructure
        usdc = new MockUSDC();
        identityRegistry = new IndustrialIdentityRegistry();
        assetPassport = new IndustrialAssetPassport();
        securityToken = new IndustrialSecurityToken(
            "Inland Empire Logistics Token",
            "IELT-01",
            address(identityRegistry)
        );

        // Whitelist inspector
        assetPassport.setInspectorAuthorization(inspector, true);

        // Register buyer identity
        identityRegistry.registerIdentity(buyer, "KYC-AML-VERIFIED-USA-DST");

        // 2. Mint Compliant Asset (Property Alpha)
        IIndustrialAssetPassport.AssetSpecifications memory alphaSpecs = IIndustrialAssetPassport.AssetSpecifications({
            clearHeightFtScaled: 400, // 40.0 ft
            floorSlabPsi: 650,        // 650 psf
            powerCapacityKva: 4000,   // 4,000 kVA
            phase1EsaClean: true,     // 0 RECs
            credentialIpfsCid: "QmAlphaHashVerifiableCredentialOntarioCA001",
            inspectorSigner: inspector,
            timestamp: block.timestamp
        });

        bytes32 alphaHash = keccak256(
            abi.encodePacked(
                "US-CA-ONT-001",
                alphaSpecs.clearHeightFtScaled,
                alphaSpecs.floorSlabPsi,
                alphaSpecs.powerCapacityKva,
                alphaSpecs.phase1EsaClean,
                alphaSpecs.credentialIpfsCid
            )
        );
        bytes32 ethSignedAlpha = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", alphaHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(inspectorPrivateKey, ethSignedAlpha);
        bytes memory alphaSig = abi.encodePacked(r, s, v);

        compliantAssetId = assetPassport.mintPassport(address(this), "US-CA-ONT-001", alphaSpecs, alphaSig);

        // 3. Mint Discrepant Asset (Property Beta: 500 kVA power deficit, toxic plume)
        IIndustrialAssetPassport.AssetSpecifications memory betaSpecs = IIndustrialAssetPassport.AssetSpecifications({
            clearHeightFtScaled: 320, // 32.0 ft
            floorSlabPsi: 450,        // 450 psf
            powerCapacityKva: 500,    // Only 500 kVA (broker claimed 2,500)
            phase1EsaClean: false,    // Historical degreaser plume (Active REC)
            credentialIpfsCid: "QmBetaHashVerifiableCredentialColumbusOH002",
            inspectorSigner: inspector,
            timestamp: block.timestamp
        });

        bytes32 betaHash = keccak256(
            abi.encodePacked(
                "US-OH-CMH-002",
                betaSpecs.clearHeightFtScaled,
                betaSpecs.floorSlabPsi,
                betaSpecs.powerCapacityKva,
                betaSpecs.phase1EsaClean,
                betaSpecs.credentialIpfsCid
            )
        );
        bytes32 ethSignedBeta = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", betaHash));
        (v, r, s) = vm.sign(inspectorPrivateKey, ethSignedBeta);
        bytes memory betaSig = abi.encodePacked(r, s, v);

        discrepantAssetId = assetPassport.mintPassport(address(this), "US-OH-CMH-002", betaSpecs, betaSig);

        // Fund Buyer with USDC
        usdc.mint(buyer, 1_000_000 * 10**6);
    }

    function test_AtomicSettlementHappyPath() public {
        ContingentEscrow.ContingencyParameters memory params = ContingentEscrow.ContingencyParameters({
            minClearHeightFtScaled: 360, // 36.0 ft
            minFloorSlabPsi: 500,
            minPowerCapacityKva: 3500,
            requireCleanEsa: true
        });

        escrow = new ContingentEscrow(
            seller,
            buyer,
            compliantAssetId,
            500_000 * 10**6,
            5000,
            address(usdc),
            address(securityToken),
            address(assetPassport),
            address(identityRegistry),
            params
        );

        securityToken.setEscrowAgent(address(escrow));

        // Buyer deposits USDC
        vm.startPrank(buyer);
        usdc.approve(address(escrow), 500_000 * 10**6);
        escrow.depositPurchaseFunds();
        vm.stopPrank();

        assertEq(usdc.balanceOf(address(escrow)), 500_000 * 10**6);

        // Execute Settlement
        escrow.executeContingentSettlement();

        // Validate Atomic Dual Settlement
        assertEq(usdc.balanceOf(seller), 500_000 * 10**6);
        assertEq(securityToken.balanceOf(buyer), 5000);
        assertTrue(uint256(escrow.currentState()) == uint256(ContingentEscrow.EscrowState.Settled));
    }

    function test_RevertOnPowerCapacityDeficit() public {
        ContingentEscrow.ContingencyParameters memory params = ContingentEscrow.ContingencyParameters({
            minClearHeightFtScaled: 300,
            minFloorSlabPsi: 400,
            minPowerCapacityKva: 2000, // Requires 2,000 kVA, Beta only has 500 kVA
            requireCleanEsa: false
        });

        escrow = new ContingentEscrow(
            seller,
            buyer,
            discrepantAssetId,
            250_000 * 10**6,
            2500,
            address(usdc),
            address(securityToken),
            address(assetPassport),
            address(identityRegistry),
            params
        );

        securityToken.setEscrowAgent(address(escrow));

        vm.startPrank(buyer);
        usdc.approve(address(escrow), 250_000 * 10**6);
        escrow.depositPurchaseFunds();
        vm.stopPrank();

        // Expect custom error revert
        vm.expectRevert(
            abi.encodeWithSelector(
                ContingentEscrow__SpecificationDeficit.selector,
                "POWER_CAPACITY_DEFICIT",
                2000,
                500
            )
        );
        escrow.executeContingentSettlement();
    }

    function test_RevertOnEnvironmentalDefect() public {
        ContingentEscrow.ContingencyParameters memory params = ContingentEscrow.ContingencyParameters({
            minClearHeightFtScaled: 300,
            minFloorSlabPsi: 400,
            minPowerCapacityKva: 400,
            requireCleanEsa: true // Beta has active toxic degreaser plume
        });

        escrow = new ContingentEscrow(
            seller,
            buyer,
            discrepantAssetId,
            250_000 * 10**6,
            2500,
            address(usdc),
            address(securityToken),
            address(assetPassport),
            address(identityRegistry),
            params
        );

        securityToken.setEscrowAgent(address(escrow));

        vm.startPrank(buyer);
        usdc.approve(address(escrow), 250_000 * 10**6);
        escrow.depositPurchaseFunds();
        vm.stopPrank();

        vm.expectRevert(ContingentEscrow__EnvironmentalDefect.selector);
        escrow.executeContingentSettlement();
    }

    function test_RevertOnUnverifiedInvestor() public {
        address unverifiedBuyer = address(0x9999);
        usdc.mint(unverifiedBuyer, 100_000 * 10**6);

        ContingentEscrow.ContingencyParameters memory params = ContingentEscrow.ContingencyParameters({
            minClearHeightFtScaled: 360,
            minFloorSlabPsi: 500,
            minPowerCapacityKva: 3500,
            requireCleanEsa: true
        });

        escrow = new ContingentEscrow(
            seller,
            unverifiedBuyer,
            compliantAssetId,
            100_000 * 10**6,
            1000,
            address(usdc),
            address(securityToken),
            address(assetPassport),
            address(identityRegistry),
            params
        );

        vm.startPrank(unverifiedBuyer);
        usdc.approve(address(escrow), 100_000 * 10**6);
        escrow.depositPurchaseFunds();
        vm.stopPrank();

        vm.expectRevert(ContingentEscrow__InvestorNotVerified.selector);
        escrow.executeContingentSettlement();
    }
}
