import os
from typing import List, Optional
from uuid import uuid4
from datetime import datetime
from fastapi import HTTPException, status

from .file_service import read_json_file, write_json_file
from schemas import (
    CreateStrategyRequest,
    UpdateStrategyRequest
)
from models.strategy_base import Strategy

# File paths
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
STRATEGIES_FILE = os.path.join(DATA_DIR, "strategies.json")
BACKTESTS_FILE = os.path.join(DATA_DIR, "backtests.json")
HISTORICAL_DATA_FILE = os.path.join(DATA_DIR, "historical_data.json")

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)


def generate_id() -> str:
    """Generate a unique UUID4 string."""
    return str(uuid4())


def get_all_strategies() -> List[dict]:
    """Get all strategies."""
    return read_json_file(STRATEGIES_FILE)


def get_strategy_by_id(strategy_id: str) -> Optional[dict]:
    """Get a strategy by ID."""
    strategies = get_all_strategies()
    for strategy in strategies:
        if strategy.get('id') == strategy_id:
            return strategy
    return None


def create_strategy(request: CreateStrategyRequest) -> dict:
    """Create a new strategy."""
    strategies = get_all_strategies()
    
    # Generate unique ID and create strategy
    strategy_id = generate_id()
    strategy_name = f"{request.strategy} - {request.symbol} {request.expiration}"
    
    new_strategy = {
        "id": strategy_id,
        "name": strategy_name,
        "symbol": request.symbol,
        "strategy": request.strategy,
        "expiration": request.expiration,
        "legs": request.legs.model_dump(),
        "quantity": request.quantity,
        "createdAt": datetime.utcnow().isoformat()
    }
    
    strategies.append(new_strategy)
    write_json_file(STRATEGIES_FILE, strategies)
    
    return new_strategy


def update_strategy(strategy_id: str, request: UpdateStrategyRequest) -> dict:
    """Update an existing strategy."""
    strategies = get_all_strategies()
    strategy = get_strategy_by_id(strategy_id)
    
    if not strategy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Strategy with id {strategy_id} not found"
        )
    
    # Update fields if provided
    if request.symbol is not None:
        strategy['symbol'] = request.symbol
    if request.strategy is not None:
        strategy['strategy'] = request.strategy
    if request.expiration is not None:
        strategy['expiration'] = request.expiration
    if request.legs is not None:
        strategy['legs'] = request.legs.model_dump()
    if request.quantity is not None:
        strategy['quantity'] = request.quantity
    
    # Update name if symbol, strategy, or expiration changed
    if any([request.symbol, request.strategy, request.expiration]):
        strategy['name'] = f"{strategy['strategy']} - {strategy['symbol']} {strategy['expiration']}"
    
    write_json_file(STRATEGIES_FILE, strategies)
    
    return strategy


def delete_strategy(strategy_id: str) -> bool:
    """Delete a strategy."""
    strategies = get_all_strategies()
    strategy = get_strategy_by_id(strategy_id)
    
    if not strategy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Strategy with id {strategy_id} not found"
        )
    
    strategies.remove(strategy)
    write_json_file(STRATEGIES_FILE, strategies)
    
    return True


def get_strategy_instance(strategy_id: str) -> Optional[Strategy]:
    """Get a Strategy instance from stored data by ID."""
    strategy_data = get_strategy_by_id(strategy_id)
    if not strategy_data:
        return None
    
    try:
        return Strategy.from_dict(strategy_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid strategy type: {str(e)}"
        )


def get_historical_data(symbol: str, start_date: str, end_date: str) -> List[dict]:
    """Fetch historical price data for symbol within date range.
    
    Reads from historical_data.json file and filters by symbol and date range.
    """
    # Read historical data from JSON file
    all_data = read_json_file(HISTORICAL_DATA_FILE)
    
    # Filter by symbol and date range
    filtered_data = [
        entry for entry in all_data
        if entry.get('symbol', '').upper() == symbol.upper()
        and start_date <= entry.get('date', '') <= end_date
    ]
    
    # Sort by date
    filtered_data.sort(key=lambda x: x.get('date', ''))
    
    # If no data found, return empty list (or could return mock data as fallback)
    return filtered_data


def run_backtest(
    strategy_id: str,
    start_date: str,
    end_date: str,
    initial_capital: float
) -> dict:
    """Run a backtest for a strategy."""
    # Get strategy instance
    strategy = get_strategy_instance(strategy_id)
    if not strategy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Strategy with id {strategy_id} not found"
        )
    
    # Fetch historical data
    historical_data = get_historical_data(
        strategy.symbol,
        start_date,
        end_date
    )
    
    if not historical_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No historical data found for {strategy.symbol} between {start_date} and {end_date}"
        )
    
    # Run backtest using strategy's backtest method
    try:
        backtest_result = strategy.backtest(
            start_date=start_date,
            end_date=end_date,
            initial_capital=initial_capital,
            historical_data=historical_data
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    # Save backtest result
    backtests = get_all_backtests()
    backtests.append(backtest_result)
    write_json_file(BACKTESTS_FILE, backtests)
    
    return backtest_result


def get_all_backtests() -> List[dict]:
    """Get all backtest results."""
    return read_json_file(BACKTESTS_FILE)


def get_backtest_by_id(backtest_id: str) -> Optional[dict]:
    """Get a backtest result by ID."""
    backtests = get_all_backtests()
    for backtest in backtests:
        if backtest.get('backtestId') == backtest_id:
            return backtest
    return None

