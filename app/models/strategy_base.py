from abc import ABC, abstractmethod
from typing import List


class Strategy(ABC):
    """Abstract base class for option trading strategies."""
    
    def __init__(
        self,
        id: str,
        name: str,
        symbol: str,
        strategy_type: str,
        expiration: str,
        legs: dict,
        quantity: int,
        created_at: str
    ):
        self.id = id
        self.name = name
        self.symbol = symbol
        self.strategy_type = strategy_type
        self.expiration = expiration
        self.legs = legs
        self.quantity = quantity
        self.created_at = created_at
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Strategy':
        """Factory method to create Strategy instance from dictionary.
        
        Determines the appropriate Strategy subclass based on strategy_type
        and returns an instance of that class.
        """
        strategy_type = data.get('strategy', '').lower()
        
        if strategy_type == 'iron condor':
            from .iron_condor import IronCondor
            return IronCondor.from_dict(data)
        else:
            raise ValueError(f"Unknown strategy type: {strategy_type}")
    
    @abstractmethod
    def validate_legs(self) -> bool:
        """Validate strategy-specific leg requirements."""
        pass
    
    @abstractmethod
    def calculate_max_profit(self) -> float:
        """Calculate maximum profit for the strategy."""
        pass
    
    @abstractmethod
    def calculate_max_loss(self) -> float:
        """Calculate maximum loss for the strategy."""
        pass
    
    @abstractmethod
    def calculate_breakeven_points(self) -> List[float]:
        """Calculate breakeven points for the strategy."""
        pass
    
    @abstractmethod
    def backtest(
        self,
        start_date: str,
        end_date: str,
        initial_capital: float,
        historical_data: List[dict]
    ) -> dict:
        """Run backtest simulation with historical data.
        
        Args:
            start_date: Start date of backtest period (ISO format)
            end_date: End date of backtest period (ISO format)
            initial_capital: Starting capital for backtest
            historical_data: List of historical price data dicts with date, price, etc.
        
        Returns:
            Dictionary matching BacktestResult schema format
        """
        pass
    
    @abstractmethod
    def to_dict(self) -> dict:
        """Convert strategy instance to dictionary format for storage."""
        pass

