from pydantic import BaseModel
from typing import Optional, List


class IronCondorLegs(BaseModel):
    longPut: Optional[float] = None
    shortPut: Optional[float] = None
    shortCall: Optional[float] = None
    longCall: Optional[float] = None


class Strategy(BaseModel):
    id: str
    name: str
    symbol: str
    strategy: str  # 'Iron Condor'
    expiration: str  # '0DTE' | 'Next Day'
    legs: IronCondorLegs
    quantity: int
    createdAt: str


class CreateStrategyRequest(BaseModel):
    symbol: str
    strategy: str
    expiration: str
    legs: IronCondorLegs
    quantity: int


class UpdateStrategyRequest(BaseModel):
    symbol: Optional[str] = None
    strategy: Optional[str] = None
    expiration: Optional[str] = None
    legs: Optional[IronCondorLegs] = None
    quantity: Optional[int] = None


class Option(BaseModel):
    symbol: str
    strike: float
    expiration: str
    optionType: str  # 'call' | 'put'
    premium: float
    quantity: int


class Trade(BaseModel):
    date: str
    action: str  # 'buy' | 'sell'
    option: Option
    price: float
    pnl: float


class BacktestRequest(BaseModel):
    startDate: str
    endDate: str
    initialCapital: float


class BacktestResult(BaseModel):
    strategyId: str
    backtestId: str
    startDate: str
    endDate: str
    initialCapital: float
    finalCapital: float
    totalReturn: float
    maxDrawdown: float
    sharpeRatio: float
    trades: List[Trade]
    createdAt: str

