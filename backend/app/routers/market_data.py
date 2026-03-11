from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.market_data import MarketDataFile
from app.schemas.market_data import MarketDataResponse

router = APIRouter(prefix="/market-data", tags=["market-data"])


@router.get("", response_model=list[MarketDataResponse])
async def list_market_data(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(MarketDataFile).order_by(MarketDataFile.uploaded_at.desc())
    )
    return result.scalars().all()


@router.get("/{market_data_id}", response_model=MarketDataResponse)
async def get_market_data(market_data_id: int, db: AsyncSession = Depends(get_db)):
    record = await db.get(MarketDataFile, market_data_id)
    if not record:
        raise HTTPException(status_code=404, detail="Market data not found")
    return record


@router.post("", response_model=MarketDataResponse, status_code=status.HTTP_201_CREATED)
async def upload_market_data(
    file: UploadFile,
    symbol: str,
    timeframe: str = "1d",
    db: AsyncSession = Depends(get_db),
):
    # Phase 2 で data_loader サービスを組み込む
    # 現状はファイルメタ情報のみ登録するスタブ
    from app.services.data_loader import save_csv

    record = await save_csv(file=file, symbol=symbol, timeframe=timeframe, db=db)
    return record


@router.delete("/{market_data_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_market_data(market_data_id: int, db: AsyncSession = Depends(get_db)):
    record = await db.get(MarketDataFile, market_data_id)
    if not record:
        raise HTTPException(status_code=404, detail="Market data not found")
    await db.delete(record)
    await db.commit()
