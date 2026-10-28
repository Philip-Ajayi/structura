// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IIndustrialAssetPassport.sol";

/**
 * @title IndustrialAssetPassport
 * @notice Stores verified physical, structural, and environmental engineering specs tied to W3C VCs.
 */
contract IndustrialAssetPassport is IIndustrialAssetPassport {
    address public immutable owner;
    uint256 public nextAssetId = 1;

    mapping(uint256 => AssetSpecifications) private _specifications;
    mapping(uint256 => string) public assetCodes;
    mapping(address => bool) public authorizedInspectors;

    modifier onlyOwner() {
        require(msg.sender == owner, "AssetPassport: not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setInspectorAuthorization(address inspector, bool status) external onlyOwner {
        authorizedInspectors[inspector] = status;
    }

    function mintPassport(
        address to,
        string calldata assetCode,
        AssetSpecifications calldata specs,
        bytes calldata inspectorSignature
    ) external override returns (uint256) {
        require(authorizedInspectors[specs.inspectorSigner], "AssetPassport: unauthorized inspector");

        // Verify ECDSA signature against hash of the specs
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                assetCode,
                specs.clearHeightFtScaled,
                specs.floorSlabPsi,
                specs.powerCapacityKva,
                specs.phase1EsaClean,
                specs.credentialIpfsCid
            )
        );
        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );

        address recovered = recoverSigner(ethSignedMessageHash, inspectorSignature);
        require(recovered == specs.inspectorSigner, "AssetPassport: invalid cryptographic signature");

        uint256 assetId = nextAssetId++;
        _specifications[assetId] = specs;
        assetCodes[assetId] = assetCode;

        emit PassportMinted(assetId, assetCode, specs.credentialIpfsCid);
        return assetId;
    }

    function getAssetSpecifications(uint256 assetId) external view override returns (AssetSpecifications memory) {
        require(_specifications[assetId].inspectorSigner != address(0), "AssetPassport: non-existent asset");
        return _specifications[assetId];
    }

    function verifyPassportSigner(uint256 assetId) external view override returns (bool) {
        return authorizedInspectors[_specifications[assetId].inspectorSigner];
    }

    function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _sig) internal pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_sig);
        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function splitSignature(bytes memory sig) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "AssetPassport: invalid signature length");
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }
}
