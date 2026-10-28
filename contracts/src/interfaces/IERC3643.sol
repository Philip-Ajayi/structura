// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC3643 {
    event IdentityRegistryAdded(address indexed registry);
    event ComplianceAdded(address indexed compliance);
    event TokensMinted(address indexed to, uint256 amount);
    event TokensFrozen(address indexed wallet, uint256 amount);

    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;
    function canTransfer(address from, address to, uint256 amount) external view returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}
