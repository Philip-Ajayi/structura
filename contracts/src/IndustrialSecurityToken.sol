// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IERC3643.sol";
import "./interfaces/IIdentityRegistry.sol";

/**
 * @title IndustrialSecurityToken
 * @notice ERC-3643 compliant permissioned industrial real estate equity token.
 */
contract IndustrialSecurityToken is IERC3643 {
    string public name;
    string public symbol;
    uint8 public constant decimals = 0; // Fractional unit tokens (Class A Units)
    uint256 public override balanceOfTotal;

    address public owner;
    address public escrowAgent;
    IIdentityRegistry public identityRegistry;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    modifier onlyOwner() {
        require(msg.sender == owner, "SecurityToken: caller is not owner");
        _;
    }

    modifier onlyAgent() {
        require(msg.sender == escrowAgent || msg.sender == owner, "SecurityToken: not authorized agent");
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        address _identityRegistry
    ) {
        name = _name;
        symbol = _symbol;
        owner = msg.sender;
        identityRegistry = IIdentityRegistry(_identityRegistry);
    }

    function setEscrowAgent(address _agent) external onlyOwner {
        escrowAgent = _agent;
    }

    function mint(address to, uint256 amount) external override onlyAgent {
        require(identityRegistry.isVerified(to), "SecurityToken: receiver not KYC verified");
        _balances[to] += amount;
        balanceOfTotal += amount;
        emit TokensMinted(to, amount);
        emit Transfer(address(0), to, amount);
    }

    function burn(address from, uint256 amount) external override onlyAgent {
        require(_balances[from] >= amount, "SecurityToken: insufficient balance");
        _balances[from] -= amount;
        balanceOfTotal -= amount;
        emit Transfer(from, address(0), amount);
    }

    function canTransfer(address from, address to, uint256 amount) public view override returns (bool) {
        if (!identityRegistry.isVerified(to)) return false;
        if (!identityRegistry.isVerified(from)) return false;
        if (_balances[from] < amount) return false;
        return true;
    }

    function transfer(address to, uint256 amount) external override returns (bool) {
        require(canTransfer(msg.sender, to, amount), "SecurityToken: transfer compliance failed");
        _balances[msg.sender] -= amount;
        _balances[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external override returns (bool) {
        require(canTransfer(from, to, amount), "SecurityToken: transfer compliance failed");
        require(_allowances[from][msg.sender] >= amount, "SecurityToken: allowance exceeded");
        _allowances[from][msg.sender] -= amount;
        _balances[from] -= amount;
        _balances[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }

    function balanceOf(address account) external view override returns (uint256) {
        return _balances[account];
    }
}
