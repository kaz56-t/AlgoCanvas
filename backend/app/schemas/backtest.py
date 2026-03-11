import json
from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, field_validator


class BacktestCreate(BaseModel):
    strategy_id: int
    market_data_id: int
    start_date: date | None = None
    end_date: date | None = None
    initial_capital: float = 1_000_000.0
    commission_rate: float = 0.001
    slippage: float = 0.0005


class BacktestResponse(BaseModel):
    id: int
    strategy_id: int
    market_data_id: int
    start_date: date | None
    end_date: date | None
    initial_capital: float
    commission_rate: float
    slippage: float
    metrics: dict[str, Any] | None
    equity_curve: list[dict[str, Any]] | None
    trade_log: list[dict[str, Any]] | None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}

    @field_validator("metrics", "equity_curve", "trade_log", mode="before")
    @classmethod
    def parse_json_fields(cls, v: Any) -> Any:
        if isinstance(v, str):
            return json.loads(v)
        return v


class BacktestStatusResponse(BaseModel):
    id: int
    status: str
    metrics: dict[str, Any] | None

    model_config = {"from_attributes": True}

    @field_validator("metrics", mode="before")
    @classmethod
    def parse_metrics(cls, v: Any) -> Any:
        if isinstance(v, str):
            return json.loads(v)
        return v
