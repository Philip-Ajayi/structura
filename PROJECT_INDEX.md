# structura — Project Index

Assembled from the supplied implementation notes.

## Files

- `Dockerfile`
- `Makefile`
- `README.md`
- `backend/Dockerfile`
- `backend/config.py`
- `backend/contracts_bridge.py`
- `backend/main.py`
- `backend/parser.py`
- `backend/requirements.txt`
- `backend/schemas.py`
- `backend/signer.py`
- `backend/synthetic_data.py`
- `backend/tests/test_pipeline.py`
- `contracts/foundry.toml`
- `contracts/script/Deploy.s.sol`
- `contracts/src/ContingentEscrow.sol`
- `contracts/src/IndustrialAssetPassport.sol`
- `contracts/src/IndustrialIdentityRegistry.sol`
- `contracts/src/IndustrialSecurityToken.sol`
- `contracts/src/MockUSDC.sol`
- `contracts/src/interfaces/IERC3643.sol`
- `contracts/src/interfaces/IIdentityRegistry.sol`
- `contracts/src/interfaces/IIndustrialAssetPassport.sol`
- `contracts/test/ContingentEscrow.t.sol`
- `docker-compose.yml`
- `entrypoint.sh`
- `frontend/Dockerfile`
- `frontend/next.config.mjs`
- `frontend/package.json`
- `frontend/src/app/globals.css`
- `frontend/src/app/layout.tsx`
- `frontend/src/app/page.tsx`
- `frontend/src/components/DiscrepancyBreaker.tsx`
- `frontend/src/components/DocumentViewer.tsx`
- `frontend/src/components/EscrowConsole.tsx`
- `frontend/src/components/Navbar.tsx`
- `frontend/src/lib/contracts.ts`
- `frontend/src/lib/mockData.ts`
- `frontend/tailwind.config.js`
- `scripts/generate_synthetic_pdfs.py`
- `scripts/seed_demo.sh`

## Formatting and validation

Trailing whitespace and excessive blank lines were cleaned up. Source indentation was retained to avoid changing program semantics. The projects have not been built, tested, deployed, or security-audited as part of this packaging step; review and run their tests before production use.
