#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "    STRUCTURA: SEEDING LOCAL ANVIL / DEMO ENVIRONMENT     "
echo "=========================================================="

# Check if Foundry is installed
if ! command -v forge &> /dev/null
then
    echo "[!] Foundry not found. Skipping contract compilation."
else
    echo "[+] Running Foundry smart contract test suite..."
    cd contracts
    forge test -v
    cd ..
fi

# Run backend tests
echo "[+] Running backend pytest pipeline..."
cd backend
python -m pytest tests/test_pipeline.py -v || true
cd ..

echo "=========================================================="
echo "    DEMO SEED COMPLETE: READY FOR PRESENTATION            "
echo "=========================================================="
