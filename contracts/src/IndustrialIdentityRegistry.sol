// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IIdentityRegistry.sol";

/**
 * @title IndustrialIdentityRegistry
 * @notice ONCHAINID-compliant Identity Registry that holds verification status of institutional investors.
 */
contract IndustrialIdentityRegistry is IIdentityRegistry {
    address public owner;
    mapping(address => bool) private _verifiedInvestors;
    mapping(address => string) private _identityHashes;

    modifier onlyOwner() {
        require(msg.sender == owner, "IdentityRegistry: caller is not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerIdentity(address _user, string calldata _identityHash) external override onlyOwner {
        require(_user != address(0), "IdentityRegistry: zero address");
        _verifiedInvestors[_user] = true;
        _identityHashes[_user] = _identityHash;
        emit IdentityRegistered(_user, _identityHash);
    }

    function removeIdentity(address _user) external override onlyOwner {
        _verifiedInvestors[_user] = false;
        delete _identityHashes[_user];
        emit IdentityRemoved(_user);
    }

    function isVerified(address _user) external view override returns (bool) {
        return _verifiedInvestors[_user];
    }
}
