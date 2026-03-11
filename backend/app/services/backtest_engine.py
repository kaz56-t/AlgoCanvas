"""バックテストエンジン（Phase 4 で実装）"""

from __future__ import annotations

import json
from datetime import date

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.backtest import BacktestResult
from app.models.market_data import MarketDataFile
from app.models.strategy import Strategy
from app.services import data_loader, metrics as metrics_svc


async def run_backtest(backtest_id: int, session_factory) -> None:
    """BackgroundTask として呼び出されるエントリポイント（Phase 4 で実装）"""
    async with session_factory() as db:
        backtest: BacktestResult = await db.get(BacktestResult, backtest_id)
        if not backtest:
            return

        backtest.status = "running"
        await db.commit()

        try:
            strategy: Strategy = await db.get(Strategy, backtest.strategy_id)
            market: MarketDataFile = await db.get(MarketDataFile, backtest.market_data_id)

            df = data_loader.load_csv(db_record=market)

            # 期間フィルタ
            if backtest.start_date:
                df = df[df["Date"].dt.date >= backtest.start_date]
            if backtest.end_date:
                df = df[df["Date"].dt.date <= backtest.end_date]

            definition = json.loads(strategy.definition)

            eq_curve, trade_log = _simulate(
                df=df,
                definition=definition,
                initial_capital=backtest.initial_capital,
                commission_rate=backtest.commission_rate,
                slippage=backtest.slippage,
            )

            m = metrics_svc.calc_metrics(eq_curve, trade_log)

            backtest.metrics = json.dumps(m)
            backtest.equity_curve = json.dumps(
                [{"date": str(df["Date"].iloc[i].date()), "equity": eq_curve[i]}
                 for i in range(len(eq_curve))]
            )
            backtest.trade_log = json.dumps(trade_log)
            backtest.status = "done"

        except Exception as e:
            backtest.status = "error"
            backtest.metrics = json.dumps({"error": str(e)})

        await db.commit()


def _simulate(
    df,
    definition: dict,
    initial_capital: float,
    commission_rate: float,
    slippage: float,
) -> tuple[list[float], list[dict]]:
    """Phase 4 で戦略定義JSONを解釈する本格実装に置き換える"""
    equity = initial_capital
    equity_curve = [equity] * len(df)
    trade_log: list[dict] = []
    return equity_curve, trade_log
