from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.market_data import MarketDataFile
from app.schemas.market_data import MarketDataFetch, MarketDataResponse

router = APIRouter(prefix="/market-data", tags=["market-data"])


@router.get("", response_model=list[MarketDataResponse])
async def list_market_data(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(MarketDataFile).order_by(MarketDataFile.fetched_at.desc())
    )
    return result.scalars().all()


@router.get("/{market_data_id}", response_model=MarketDataResponse)
async def get_market_data(market_data_id: int, db: AsyncSession = Depends(get_db)):
    record = await db.get(MarketDataFile, market_data_id)
    if not record:
        raise HTTPException(status_code=404, detail="Market data not found")
    return record


@router.post("/fetch", response_model=MarketDataResponse, status_code=status.HTTP_201_CREATED)
async def fetch_market_data(body: MarketDataFetch, db: AsyncSession = Depends(get_db)):
    from app.services.data_loader import fetch_ticker

    return await fetch_ticker(
        symbol=body.symbol,
        timeframe=body.timeframe,
        start_date=body.start_date,
        end_date=body.end_date,
        refresh=body.refresh,
        db=db,
    )


@router.get("/{market_data_id}/preview")
async def preview_market_data(market_data_id: int, db: AsyncSession = Depends(get_db)):
    record = await db.get(MarketDataFile, market_data_id)
    if not record:
        raise HTTPException(status_code=404, detail="Market data not found")

    import pandas as pd

    path = Path(settings.data_dir) / record.filename
    if not path.exists():
        raise HTTPException(status_code=404, detail="CSV file not found")

    df = pd.read_csv(path, nrows=10)
    return {"columns": list(df.columns), "rows": df.to_dict(orient="records")}


@router.delete("/{market_data_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_market_data(market_data_id: int, db: AsyncSession = Depends(get_db)):
    record = await db.get(MarketDataFile, market_data_id)
    if not record:
        raise HTTPException(status_code=404, detail="Market data not found")

    # CSVファイルも削除
    csv_path = Path(settings.data_dir) / record.filename
    if csv_path.exists():
        csv_path.unlink()

    await db.delete(record)
    await db.commit()
