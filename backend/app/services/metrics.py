"""パフォーマンス指標算出（Phase 4 で実装）"""

from __future__ import annotations

import numpy as np
import pandas as pd


def calc_metrics(equity_curve: list[float], trade_log: list[dict]) -> dict:
    """
    Parameters
    ----------
    equity_curve : 各時点の資産額リスト
    trade_log    : 取引ログ（各要素は {"date", "action", "price", "pnl"} を含む）

    Returns
    -------
    dict : パフォーマンス指標
    """
    eq = np.array(equity_curve, dtype=float)
    if len(eq) < 2:
        return {}

    total_return = (eq[-1] / eq[0] - 1) * 100

    returns = pd.Series(eq).pct_change().dropna()
    annual_factor = 252
    annual_return = returns.mean() * annual_factor * 100
    sharpe = (
        (returns.mean() / returns.std() * np.sqrt(annual_factor))
        if returns.std() > 0
        else 0.0
    )

    # 最大ドローダウン
    peak = np.maximum.accumulate(eq)
    drawdown = (eq - peak) / peak * 100
    max_drawdown = drawdown.min()

    # 勝率・PF
    pnls = [t.get("pnl", 0) for t in trade_log if "pnl" in t]
    wins = [p for p in pnls if p > 0]
    losses = [p for p in pnls if p < 0]
    win_rate = len(wins) / len(pnls) * 100 if pnls else 0.0
    profit_factor = (
        sum(wins) / abs(sum(losses)) if losses and sum(losses) != 0 else float("inf")
    )
    avg_trade = sum(pnls) / len(pnls) if pnls else 0.0

    return {
        "total_return": round(total_return, 2),
        "annual_return": round(annual_return, 2),
        "sharpe_ratio": round(sharpe, 3),
        "max_drawdown": round(max_drawdown, 2),
        "win_rate": round(win_rate, 2),
        "profit_factor": round(profit_factor, 3),
        "total_trades": len(pnls),
        "average_trade": round(avg_trade, 2),
    }
