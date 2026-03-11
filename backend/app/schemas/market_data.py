from datetime import date, datetime

from pydantic import BaseModel


class MarketDataResponse(BaseModel):
    id: int
    symbol: str
    display_name: str | None
    filename: str
    start_date: date | None
    end_date: date | None
    row_count: int | None
    timeframe: str | None
    fetched_at: datetime

    model_config = {"from_attributes": True}


class MarketDataFetch(BaseModel):
    symbol: str
    timeframe: str = "1d"
    start_date: str
    end_date: str
    refresh: bool = False
