"""CSVアップロード・バリデーション・保存サービス（Phase 2 で実装）"""

import os
from pathlib import Path

import pandas as pd
from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.market_data import MarketDataFile

REQUIRED_COLUMNS = {"Date", "Open", "High", "Low", "Close", "Volume"}


async def save_csv(
    file: UploadFile,
    symbol: str,
    timeframe: str,
    db: AsyncSession,
) -> MarketDataFile:
    content = await file.read()
    filename = f"{symbol}_{timeframe}.csv"
    dest = Path(settings.data_dir) / filename

    # カラムバリデーション
    import io
    df = pd.read_csv(io.BytesIO(content))
    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=422,
            detail=f"Missing columns: {', '.join(sorted(missing))}",
        )

    df["Date"] = pd.to_datetime(df["Date"])
    start_date = df["Date"].min().date()
    end_date = df["Date"].max().date()
    row_count = len(df)

    # ファイル保存
    os.makedirs(settings.data_dir, exist_ok=True)
    dest.write_bytes(content)

    # DB登録（upsert は既存レコードを更新）
    from sqlalchemy import select
    result = await db.execute(
        select(MarketDataFile).where(MarketDataFile.filename == filename)
    )
    record = result.scalar_one_or_none()

    if record:
        record.symbol = symbol
        record.start_date = start_date
        record.end_date = end_date
        record.row_count = row_count
        record.timeframe = timeframe
    else:
        record = MarketDataFile(
            symbol=symbol,
            filename=filename,
            start_date=start_date,
            end_date=end_date,
            row_count=row_count,
            timeframe=timeframe,
        )
        db.add(record)

    await db.commit()
    await db.refresh(record)
    return record


def load_csv(market_data_id_or_filename: str | int, db_record: MarketDataFile | None = None) -> pd.DataFrame:
    """バックテストエンジンから呼ばれるCSV読み込み（Phase 4 で利用）"""
    filename = db_record.filename if db_record else str(market_data_id_or_filename)
    path = Path(settings.data_dir) / filename
    df = pd.read_csv(path, parse_dates=["Date"])
    df = df.sort_values("Date").reset_index(drop=True)
    return df
