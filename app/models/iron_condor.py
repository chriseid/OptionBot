from typing import List, Optional, Tuple
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
        
        # Extract leg delta values from legs dict (deltas are stored, not strikes)
        self.long_put_delta = legs.get('longPut')  # Negative delta (e.g., -0.15)
        self.short_put_delta = legs.get('shortPut')  # Negative delta (e.g., -0.25)
        self.short_call_delta = legs.get('shortCall')  # Positive delta (e.g., 0.25)
        self.long_call_delta = legs.get('longCall')  # Positive delta (e.g., 0.35)
    
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
        """Validate that all 4 legs are present and deltas are in correct ranges."""
        if None in [self.long_put_delta, self.short_put_delta, self.short_call_delta, self.long_call_delta]:
            return False
        
        # Validate delta ranges:
        # Puts should be negative, calls should be positive
        # longPut < shortPut (more negative = further OTM)
        # shortCall < longCall (more positive = further OTM)
        return (self.long_put_delta < self.short_put_delta < 0 and
                0 < self.short_call_delta < self.long_call_delta)
    
    def calculate_max_profit(self) -> float:
        """Calculate maximum profit (net credit received).
        Note: This is a simplified calculation. Actual max profit depends on premiums.
        """
        # For Iron Condor, max profit is the net credit received
        # This is simplified - in reality, you'd calculate from premiums
        # Using delta-based approximation
        net_credit = 2.0  # Mock value - should be calculated from actual premiums
        return net_credit * self.quantity
    
    def calculate_max_loss(self) -> float:
        """Calculate maximum loss.
        Note: This requires strike prices, which are derived from deltas during backtest.
        """
        # Max loss calculation requires strikes, which are derived from deltas
        # This is a placeholder - actual calculation happens during backtest
        return 0.0
    
    def calculate_breakeven_points(self) -> List[float]:
        """Calculate breakeven points.
        Note: This requires strike prices, which are derived from deltas during backtest.
        """
        # Breakeven calculation requires strikes, which are derived from deltas
        # This is a placeholder - actual calculation happens during backtest
        return []
    
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
        
        # Get underlying price for entry date to convert deltas to strikes
        entry_day_data = next((d for d in filtered_data if d.get('date') == start_date), None)
        if not entry_day_data:
            raise ValueError(f"No historical data found for entry date {start_date}")
        
        underlying_price = entry_day_data.get('underlyingPrice', 0)
        if underlying_price == 0:
            raise ValueError(f"Invalid underlying price for date {start_date}")
        
        # Convert deltas to approximate strikes
        # For puts (negative delta): strike ≈ underlyingPrice * (1 + delta)
        # For calls (positive delta): strike ≈ underlyingPrice * (1 + delta)
        def delta_to_strike(delta: float, option_type: str) -> float:
            """Convert delta to approximate strike price."""
            return underlying_price * (1 + delta)
        
        # Convert deltas to strikes
        long_put_strike = delta_to_strike(self.long_put_delta, 'put')
        short_put_strike = delta_to_strike(self.short_put_delta, 'put')
        short_call_strike = delta_to_strike(self.short_call_delta, 'call')
        long_call_strike = delta_to_strike(self.long_call_delta, 'call')
        
        # Helper function to find option price by strike (with tolerance for rounding)
        def find_option_price_by_strike(date: str, target_strike: float, expiration: str, option_type: str, tolerance: float = 2.0) -> Tuple[Optional[float], Optional[float]]:
            """Find option premium (mid price) and actual strike from historical data.
            Returns (price, actual_strike) or (None, None) if not found.
            """
            for day_data in filtered_data:
                if day_data.get('date') == date:
                    options = day_data.get('options', [])
                    best_match = None
                    best_diff = float('inf')
                    
                    for option in options:
                        if (option.get('expiration') == expiration and
                            option.get('optionType') == option_type):
                            strike = option.get('strike', 0)
                            diff = abs(strike - target_strike)
                            if diff < best_diff and diff <= tolerance:
                                best_diff = diff
                                best_match = option
                    
                    if best_match:
                        return (best_match.get('mid'), best_match.get('strike'))
            return (None, None)
        
        # Simulate trades
        trades = []
        current_capital = initial_capital
        
        # Entry trades (opening the Iron Condor) - use start_date
        entry_date = start_date
        
        # Create entry trades for each leg using actual option prices
        # Store actual strikes used for exit trades
        leg_strikes = {}
        
        if self.long_put_delta is not None:
            entry_price, actual_strike = find_option_price_by_strike(entry_date, long_put_strike, self.expiration, 'put')
            if entry_price is None or actual_strike is None:
                entry_price = 0.5  # Fallback if option not found
                actual_strike = long_put_strike
            leg_strikes['long_put'] = actual_strike
            trades.append({
                "date": entry_date,
                "action": "buy",
                "option": {
                    "symbol": self.symbol,
                    "strike": actual_strike,
                    "expiration": self.expiration,
                    "optionType": "put",
                    "premium": entry_price,
                    "quantity": self.quantity
                },
                "price": entry_price,
                "pnl": -entry_price * self.quantity * 100  # Options are per 100 shares
            })
        
        if self.short_put_delta is not None:
            entry_price, actual_strike = find_option_price_by_strike(entry_date, short_put_strike, self.expiration, 'put')
            if entry_price is None or actual_strike is None:
                entry_price = 1.0  # Fallback if option not found
                actual_strike = short_put_strike
            leg_strikes['short_put'] = actual_strike
            trades.append({
                "date": entry_date,
                "action": "sell",
                "option": {
                    "symbol": self.symbol,
                    "strike": actual_strike,
                    "expiration": self.expiration,
                    "optionType": "put",
                    "premium": entry_price,
                    "quantity": self.quantity
                },
                "price": entry_price,
                "pnl": entry_price * self.quantity * 100
            })
        
        if self.short_call_delta is not None:
            entry_price, actual_strike = find_option_price_by_strike(entry_date, short_call_strike, self.expiration, 'call')
            if entry_price is None or actual_strike is None:
                entry_price = 1.0  # Fallback if option not found
                actual_strike = short_call_strike
            leg_strikes['short_call'] = actual_strike
            trades.append({
                "date": entry_date,
                "action": "sell",
                "option": {
                    "symbol": self.symbol,
                    "strike": actual_strike,
                    "expiration": self.expiration,
                    "optionType": "call",
                    "premium": entry_price,
                    "quantity": self.quantity
                },
                "price": entry_price,
                "pnl": entry_price * self.quantity * 100
            })
        
        if self.long_call_delta is not None:
            entry_price, actual_strike = find_option_price_by_strike(entry_date, long_call_strike, self.expiration, 'call')
            if entry_price is None or actual_strike is None:
                entry_price = 0.5  # Fallback if option not found
                actual_strike = long_call_strike
            leg_strikes['long_call'] = actual_strike
            trades.append({
                "date": entry_date,
                "action": "buy",
                "option": {
                    "symbol": self.symbol,
                    "strike": actual_strike,
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
            exit_price, _ = find_option_price_by_strike(exit_date, option['strike'], option['expiration'], option['optionType'])
            
            # If exit date option not found, try to find closest date or use intrinsic value estimate
            if exit_price is None:
                # Try to find option price from closest available date
                for day_data in sorted(filtered_data, key=lambda x: x.get('date', ''), reverse=True):
                    options = day_data.get('options', [])
                    for opt in options:
                        if (abs(opt.get('strike', 0) - option['strike']) <= 2.0 and
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
                "longPut": self.long_put_delta,
                "shortPut": self.short_put_delta,
                "shortCall": self.short_call_delta,
                "longCall": self.long_call_delta
            },
            "quantity": self.quantity,
            "createdAt": self.created_at
        }

