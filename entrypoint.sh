#!/usr/bin/env bash
set -e

PORT="${PORT:-10000}"

echo "=========================================================="
echo "    STRUCTURA: BOOTING EMBEDDED EVM & PROTOCOL STACK      "
echo "=========================================================="

# 1. Start Anvil EVM Node locally
echo "[1/3] Starting Anvil Ethereum node on 127.0.0.1:8545..."
anvil --host 127.0.0.1 --port 8545 --block-time 1 --silent &
ANVIL_PID=$!

# Wait for Anvil to accept connections
while ! curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"net_version","params":[],"id":1}' http://127.0.0.1:8545 > /dev/null; do
    sleep 0.5
done
echo ">>> Anvil EVM Node is LIVE and mining blocks."

# 2. Start FastAPI Backend (Auto-deploys contracts & initializes relayer)
echo "[2/3] Starting FastAPI backend on 127.0.0.1:8000..."
cd /app/backend
python3 -m uvicorn main:app --host 127.0.0.1 --port 8000 &
FASTAPI_PID=$!

# Wait for FastAPI health check
while ! curl -s http://127.0.0.1:8000/health > /dev/null; do
    sleep 0.5
done
echo ">>> FastAPI Intelligence & Relayer Engine is LIVE."

# 3. Start Next.js Frontend
echo "[3/3] Starting Next.js frontend on 0.0.0.0:$PORT..."
cd /app/frontend
PORT=$PORT HOSTNAME="0.0.0.0" node server.js &
NEXT_PID=$!

trap "kill -TERM $ANVIL_PID $FASTAPI_PID $NEXT_PID; exit 0" SIGINT SIGTERM

wait -n
