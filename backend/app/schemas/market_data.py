from datetime import date, datetime

from pydantic import BaseModel


class MarketDataResponse(BaseModel):
    id: int
    symbol: str
    filename: str
    start_date: date | None
    end_date: date | None
    row_count: int | None
    timeframe: str | None
    uploaded_at: datetime

    model_config = {"from_attributes": True}
