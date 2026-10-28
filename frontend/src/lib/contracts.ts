export const CONTRACT_ADDRESSES = {
  USDC: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  IDENTITY_REGISTRY: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  ASSET_PASSPORT: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  SECURITY_TOKEN: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
  CONTINGENT_ESCROW: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"
};

export const CONTINGENT_ESCROW_ABI = [
  "function depositPurchaseFunds() external",
  "function executeContingentSettlement() external",
  "function refundBuyer() external",
  "function currentState() external view returns (uint8)",
  "error ContingentEscrow__SpecificationDeficit(string spec, uint256 expected, uint256 actual)",
  "error ContingentEscrow__EnvironmentalDefect()",
  "error ContingentEscrow__InvestorNotVerified()"
];
