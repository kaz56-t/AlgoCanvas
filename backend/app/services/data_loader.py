"""価格データ取得・保存サービス"""

import asyncio
import os
from pathlib import Path

import pandas as pd
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.market_data import MarketDataFile


async def fetch_ticker(
    symbol: str,
    timeframe: str,
    start_date: str,
    end_date: str,
    refresh: bool,
    db: AsyncSession,
) -> MarketDataFile:
    filename = f"{symbol}_{timeframe}.csv"
    dest = Path(settings.data_dir) / filename

    # キャッシュがあって refresh=False ならDBレコードをそのまま返す
    if not refresh and dest.exists():
        result = await db.execute(
            select(MarketDataFile).where(MarketDataFile.filename == filename)
        )
        record = result.scalar_one_or_none()
        if record:
            return record

    # yfinance でダウンロード（同期処理を asyncio.to_thread でラップ）
    import yfinance as yf

    df = await asyncio.to_thread(
        yf.download,
        symbol,
        start=start_date,
        end=end_date,
        interval=timeframe,
        progress=False,
        auto_adjust=True,
    )
    if df is None or df.empty:
        raise HTTPException(status_code=502, detail="yfinance returned no data")

    # MultiIndex カラムをフラット化（yfinance >= 0.2.38 で発生する場合がある）
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)

    # OHLCV に整形して保存
    df = df[["Open", "High", "Low", "Close", "Volume"]].copy()
    df = df.reset_index()
    df.columns = ["Date", "Open", "High", "Low", "Close", "Volume"]

    os.makedirs(settings.data_dir, exist_ok=True)
    df.to_csv(dest, index=False)

    start = df["Date"].min()
    end = df["Date"].max()
    row_count = len(df)

    # display_name を yfinance から取得
    try:
        ticker_info = await asyncio.to_thread(lambda: yf.Ticker(symbol).info)
        display_name = ticker_info.get("longName") or ticker_info.get("shortName") or symbol
    except Exception:
        display_name = symbol

    # DB upsert
    result = await db.execute(
        select(MarketDataFile).where(MarketDataFile.filename == filename)
    )
    record = result.scalar_one_or_none()

    if record:
        record.symbol = symbol
        record.display_name = display_name
        record.start_date = start.date() if hasattr(start, "date") else start
        record.end_date = end.date() if hasattr(end, "date") else end
        record.row_count = row_count
        record.timeframe = timeframe
    else:
        record = MarketDataFile(
            symbol=symbol,
            display_name=display_name,
            filename=filename,
            start_date=start.date() if hasattr(start, "date") else start,
            end_date=end.date() if hasattr(end, "date") else end,
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
