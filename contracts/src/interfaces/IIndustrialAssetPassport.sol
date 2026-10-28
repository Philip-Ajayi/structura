// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IIndustrialAssetPassport {
    struct AssetSpecifications {
        uint256 clearHeightFtScaled; // e.g. 400 = 40.0 ft
        uint256 floorSlabPsi;        // e.g. 650 psf
        uint256 powerCapacityKva;    // e.g. 4000 kVA
        bool phase1EsaClean;         // true = 0 RECs
        string credentialIpfsCid;    // IPFS CID of signed W3C Verifiable Credential
        address inspectorSigner;     // Licensed engineer ECDSA address
        uint256 timestamp;
    }

    event PassportMinted(uint256 indexed assetId, string assetCode, string credentialIpfsCid);
    event PassportUpdated(uint256 indexed assetId, string credentialIpfsCid);

    function mintPassport(
        address to,
        string calldata assetCode,
        AssetSpecifications calldata specs,
        bytes calldata inspectorSignature
    ) external returns (uint256);

    function getAssetSpecifications(uint256 assetId) external view returns (AssetSpecifications memory);
    function verifyPassportSigner(uint256 assetId) external view returns (bool);
}
