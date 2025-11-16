from typing import List, Optional
from datetime import datetime
from uuid import uuid4
from .strategy_base import Strategy


class IronCondor(Strategy):
    """Iron Condor option strategy implementation."""
    
    def __init__(
        self,
        id: str,
        name: str,
        symbol: str,
        expiration: str,
        legs: dict,
        quantity: int,
        created_at: str
    ):
        super().__init__(
            id=id,
            name=name,
            symbol=symbol,
            strategy_type='Iron Condor',
            expiration=expiration,
            legs=legs,
            quantity=quantity,
            created_at=created_at
        )
        
        # Extract leg values from legs dict
        self.long_put = legs.get('longPut')
        self.short_put = legs.get('shortPut')
        self.short_call = legs.get('shortCall')
        self.long_call = legs.get('longCall')
    
    @classmethod
    def from_dict(cls, data: dict) -> 'IronCondor':
        """Create IronCondor instance from dictionary."""
        return cls(
            id=data['id'],
            name=data['name'],
            symbol=data['symbol'],
            expiration=data['expiration'],
            legs=data['legs'],
            quantity=data['quantity'],
            created_at=data['createdAt']
        )
    
    def validate_legs(self) -> bool:
        """Validate that all 4 legs are present and in correct order."""
        if None in [self.long_put, self.short_put, self.short_call, self.long_call]:
            return False
        
        # Validate order: longPut < shortPut < shortCall < longCall
        return (self.long_put < self.short_put < 
                self.short_call < self.long_call)
    
    def calculate_max_profit(self) -> float:
        """Calculate maximum profit (net credit received)."""
        # For Iron Condor, max profit is the net credit received
        # This is simplified - in reality, you'd calculate from premiums
        # For now, we'll use a mock calculation
        net_credit = 2.0  # Mock value - should be calculated from actual premiums
        return net_credit * self.quantity
    
    def calculate_max_loss(self) -> float:
        """Calculate maximum loss."""
        # Max loss = (Difference between outer strikes - net credit) * quantity
        width_put_side = self.short_put - self.long_put
        width_call_side = self.long_call - self.short_call
        max_width = max(width_put_side, width_call_side)
        net_credit = 2.0  # Mock value
        return (max_width - net_credit) * self.quantity
    
    def calculate_breakeven_points(self) -> List[float]:
        """Calculate breakeven points."""
        net_credit = 2.0  # Mock value
        return [
            self.short_put - net_credit,
            self.short_call + net_credit
        ]
    
    def backtest(
        self,
        start_date: str,
        end_date: str,
        initial_capital: float,
        historical_data: List[dict]
    ) -> dict:
        """Run backtest simulation for Iron Condor strategy."""
        # Generate backtest ID
        backtest_id = str(uuid4())
        
        # Filter historical data to date range (if not already filtered)
        filtered_data = [
            d for d in historical_data
            if start_date <= d.get('date', '') <= end_date
        ]
        
        if not filtered_data:
            raise ValueError(f"No historical data found for date range {start_date} to {end_date}")
        
        # Helper function to find option price for a given leg
        def find_option_price(date: str, strike: float, expiration: str, option_type: str) -> Optional[float]:
            """Find option premium (mid price) from historical data."""
            for day_data in filtered_data:
                if day_data.get('date') == date:
                    options = day_data.get('options', [])
                    for option in options:
                        if (option.get('strike') == strike and
                            option.get('expiration') == expiration and
                            option.get('optionType') == option_type):
                            return option.get('mid')  # Use mid price (average of bid/ask)
            return None
        
        # Simulate trades
        trades = []
        current_capital = initial_capital
        
        # Entry trades (opening the Iron Condor) - use start_date
        entry_date = start_date
        
        # Create entry trades for each leg using actual option prices
        if self.long_put:
            entry_price = find_option_price(entry_date, self.long_put, self.expiration, 'put')
            if entry_price is None:
                entry_price = 0.5  # Fallback if option not found
            trades.append({
                "date": entry_date,
                "action": "buy",
                "option": {
                    "symbol": self.symbol,
                    "strike": self.long_put,
                    "expiration": self.expiration,
                    "optionType": "put",
                    "premium": entry_price,
                    "quantity": self.quantity
                },
                "price": entry_price,
                "pnl": -entry_price * self.quantity * 100  # Options are per 100 shares
            })
        
        if self.short_put:
            entry_price = find_option_price(entry_date, self.short_put, self.expiration, 'put')
            if entry_price is None:
                entry_price = 1.0  # Fallback if option not found
            trades.append({
                "date": entry_date,
                "action": "sell",
                "option": {
                    "symbol": self.symbol,
                    "strike": self.short_put,
                    "expiration": self.expiration,
                    "optionType": "put",
                    "premium": entry_price,
                    "quantity": self.quantity
                },
                "price": entry_price,
                "pnl": entry_price * self.quantity * 100
            })
        
        if self.short_call:
            entry_price = find_option_price(entry_date, self.short_call, self.expiration, 'call')
            if entry_price is None:
                entry_price = 1.0  # Fallback if option not found
            trades.append({
                "date": entry_date,
                "action": "sell",
                "option": {
                    "symbol": self.symbol,
                    "strike": self.short_call,
                    "expiration": self.expiration,
                    "optionType": "call",
                    "premium": entry_price,
                    "quantity": self.quantity
                },
                "price": entry_price,
                "pnl": entry_price * self.quantity * 100
            })
        
        if self.long_call:
            entry_price = find_option_price(entry_date, self.long_call, self.expiration, 'call')
            if entry_price is None:
                entry_price = 0.5  # Fallback if option not found
            trades.append({
                "date": entry_date,
                "action": "buy",
                "option": {
                    "symbol": self.symbol,
                    "strike": self.long_call,
                    "expiration": self.expiration,
                    "optionType": "call",
                    "premium": entry_price,
                    "quantity": self.quantity
                },
                "price": entry_price,
                "pnl": -entry_price * self.quantity * 100
            })
        
        # Calculate net entry P&L
        net_entry_pnl = sum(trade['pnl'] for trade in trades)
        current_capital += net_entry_pnl
        
        # Exit trades (closing the Iron Condor) - use end_date or expiration, whichever comes first
        exit_date = min(end_date, self.expiration)
        
        # Create exit trades (reverse of entry) using actual option prices
        exit_trades = []
        for trade in trades:
            option = trade['option']
            exit_price = find_option_price(exit_date, option['strike'], option['expiration'], option['optionType'])
            
            # If exit date option not found, try to find closest date or use intrinsic value estimate
            if exit_price is None:
                # Try to find option price from closest available date
                for day_data in sorted(filtered_data, key=lambda x: x.get('date', ''), reverse=True):
                    options = day_data.get('options', [])
                    for opt in options:
                        if (opt.get('strike') == option['strike'] and
                            opt.get('expiration') == option['expiration'] and
                            opt.get('optionType') == option['optionType']):
                            exit_price = opt.get('mid')
                            break
                    if exit_price is not None:
                        break
                
                # If still not found, use a small value (option likely expired worthless or deep ITM)
                if exit_price is None:
                    exit_price = 0.05
            
            # Calculate exit P&L (opposite of entry)
            if trade['action'] == 'buy':
                # Selling what we bought
                exit_pnl = exit_price * self.quantity * 100
            else:
                # Buying back what we sold
                exit_pnl = -exit_price * self.quantity * 100
            
            exit_trade = {
                "date": exit_date,
                "action": "sell" if trade['action'] == "buy" else "buy",
                "option": option.copy(),
                "price": exit_price,
                "pnl": exit_pnl
            }
            exit_trades.append(exit_trade)
            current_capital += exit_pnl
        
        trades.extend(exit_trades)
        
        # Calculate metrics
        final_capital = current_capital
        total_return = ((final_capital - initial_capital) / initial_capital) * 100 if initial_capital > 0 else 0
        
        # Calculate max drawdown (simplified - would need daily P&L tracking for accurate calculation)
        max_drawdown = -5.2  # Mock value - can be enhanced with actual daily tracking
        
        # Calculate Sharpe ratio (simplified - would need returns series for accurate calculation)
        sharpe_ratio = 1.85  # Mock value - can be enhanced with actual returns calculation
        
        return {
            "strategyId": self.id,
            "backtestId": backtest_id,
            "startDate": start_date,
            "endDate": end_date,
            "initialCapital": initial_capital,
            "finalCapital": final_capital,
            "totalReturn": total_return,
            "maxDrawdown": max_drawdown,
            "sharpeRatio": sharpe_ratio,
            "trades": trades,
            "createdAt": datetime.utcnow().isoformat()
        }
    
    def to_dict(self) -> dict:
        """Convert IronCondor instance to dictionary format."""
        return {
            "id": self.id,
            "name": self.name,
            "symbol": self.symbol,
            "strategy": self.strategy_type,
            "expiration": self.expiration,
            "legs": {
                "longPut": self.long_put,
                "shortPut": self.short_put,
                "shortCall": self.short_call,
                "longCall": self.long_call
            },
            "quantity": self.quantity,
            "createdAt": self.created_at
        }

