.PHONY: setup test dev contracts-test build-all

setup:
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Installing backend dependencies..."
	cd backend && pip install -r requirements.txt

test:
	@echo "Running Smart Contract Tests..."
	cd contracts && forge test -v
	@echo "Running Backend Unit Tests..."
	cd backend && pytest -v

dev:
	@echo "Starting full Structura stack..."
	docker-compose up --build

anvil:
	anvil --port 8545 --chain-id 31337
