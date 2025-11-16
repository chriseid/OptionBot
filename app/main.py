from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from schemas import (
    CreateStrategyRequest,
    UpdateStrategyRequest,
    BacktestRequest
)
from services import strategy_service

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Strategy Endpoints
@app.get("/strategies")
async def get_all_strategies():
    """Get all strategies."""
    return strategy_service.get_all_strategies()


@app.get("/strategies/{strategy_id}")
async def get_strategy(strategy_id: str):
    """Get a strategy by ID."""
    strategy = strategy_service.get_strategy_by_id(strategy_id)
    
    if not strategy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Strategy with id {strategy_id} not found"
        )
    
    return strategy


@app.post("/strategies", status_code=status.HTTP_201_CREATED)
async def create_strategy(request: CreateStrategyRequest):
    """Create a new strategy."""
    return strategy_service.create_strategy(request)


@app.put("/strategies/{strategy_id}")
async def update_strategy(strategy_id: str, request: UpdateStrategyRequest):
    """Update an existing strategy."""
    return strategy_service.update_strategy(strategy_id, request)


@app.delete("/strategies/{strategy_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_strategy(strategy_id: str):
    """Delete a strategy."""
    strategy_service.delete_strategy(strategy_id)
    return None


# Backtest Endpoints
@app.post("/backtest/{strategy_id}")
async def run_backtest(strategy_id: str, request: BacktestRequest):
    """Run a backtest for a strategy."""
    return strategy_service.run_backtest(
        strategy_id=strategy_id,
        start_date=request.startDate,
        end_date=request.endDate,
        initial_capital=request.initialCapital
    )


@app.get("/backtest/results/{backtest_id}")
async def get_backtest_results(backtest_id: str):
    """Get backtest results by ID."""
    backtest = strategy_service.get_backtest_by_id(backtest_id)
    
    if not backtest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Backtest with id {backtest_id} not found"
        )
    
    return backtest


@app.get("/")
async def root():
    return {"message": "OptionBot API"}
