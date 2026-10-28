# STRUCTURA: Verifiable Property Intelligence & Contingent Capital Protocol

Structura transforms industrial real estate due diligence from a passive, unindexed data room into an **active on-chain transaction gatekeeper**. 

It cryptographically attests structural load capacity, power tariff schedules, and ASTM E1527-21 environmental reports into **W3C Verifiable Credentials**, enforcing them directly in **ERC-3643 permissioned investment tokens** and **Contingent Closing Escrow contracts**.

---

## Live Judge Testing Guide (Zero Configuration Needed)

Judges and reviewers can immediately run and test the complete protocol without needing a funded testnet wallet or external API keys:

1. **Launch the Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open `http://localhost:3000` in any browser.

2. **Test Happy Path (Property Alpha - Inland Empire Logistics Center IV)**:
   - Select **Property Alpha** in the top navigation.
   - Inspect the **Discrepancy Breaker**: All metrics (40.0 ft clear height, 4,000 kVA substation feed, 0 RECs) are verified green.
   - Inspect the **Document Audit Console**: View split-screen text references highlighted directly from the underlying engineering reports.
   - In the **Contingent Escrow Console**: Click **"Step 1: Deposit $500,000 USDC"**, followed by **"Step 2: Execute Contingent Settlement"**. Observe the atomic closing settling the seller payout and minting 5,000 Class A tokens into the KYC-whitelisted wallet in 1 block.

3. **Test On-Chain Fraud / Discrepancy Revert (Property Beta - Columbus Cold Hub)**:
   - Switch to **Property Beta** in the header.
   - The **Discrepancy Breaker** immediately triggers amber alerts:
     * Broker claims **2,500 kVA**, but the verified utility agreement reveals a cap of **500 kVA**.
     * Broker claims clean environmental status, but the Phase I ESA identifies an **Active REC (chlorinated solvent plume)**.
   - Attempt to execute the settlement in the Escrow Terminal. The smart contract programmatically aborts with:
     `ContingentEscrow__SpecificationDeficit(Power: Expected >= 2000, Actual: 500)`.
   - Investor capital is automatically protected on-chain from misrepresentation.

---

## Smart Contract Test Suite (Foundry)

Run the formal fuzz and unit test suite verifying atomic settlements and defect reverts:
