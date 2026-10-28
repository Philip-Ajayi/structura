// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IIdentityRegistry {
    event IdentityRegistered(address indexed investorAddress, string identityHash);
    event IdentityRemoved(address indexed investorAddress);

    function registerIdentity(address _user, string calldata _identityHash) external;
    function removeIdentity(address _user) external;
    function isVerified(address _user) external view returns (bool);
}
