// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/MockUSDC.sol";
import "../src/IndustrialIdentityRegistry.sol";
import "../src/IndustrialAssetPassport.sol";
import "../src/IndustrialSecurityToken.sol";
import "../src/ContingentEscrow.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80));
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        MockUSDC usdc = new MockUSDC();
        IndustrialIdentityRegistry registry = new IndustrialIdentityRegistry();
        IndustrialAssetPassport passport = new IndustrialAssetPassport();
        IndustrialSecurityToken token = new IndustrialSecurityToken(
            "Ontario Logistics Trust Class A",
            "STRUCT-ONT",
            address(registry)
        );

        // Pre-authorize deployer as inspector for live hackathon testing
        passport.setInspectorAuthorization(deployer, true);
        registry.registerIdentity(deployer, "ONCHAINID-KYC-VERIFIED-SEPOLIA");

        // Mint test tokens for demo
        usdc.mint(deployer, 10_000_000 * 10**6);

        vm.stopBroadcast();

        console.log("=== STRUCTURA DEPLOYED ADDRESSES ===");
        console.log("MockUSDC:", address(usdc));
        console.log("IdentityRegistry:", address(registry));
        console.log("AssetPassport:", address(passport));
        console.log("SecurityToken:", address(token));
    }
}
