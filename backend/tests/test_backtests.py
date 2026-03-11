from unittest.mock import MagicMock, patch

import pandas as pd
from httpx import AsyncClient

STRATEGY_BASE = "/api/v1/strategies"
MARKET_BASE = "/api/v1/market-data"
BACKTEST_BASE = "/api/v1/backtests"

SAMPLE_DF = pd.DataFrame(
    {
        "Open": [33288.0, 33377.0],
        "High": [33491.0, 33750.0],
        "Low": [33027.0, 33290.0],
        "Close": [33377.0, 33706.0],
        "Volume": [1234567890.0, 987654321.0],
    },
    index=pd.DatetimeIndex(["2024-01-04", "2024-01-05"], name="Date"),
)

SAMPLE_DEFINITION = {
    "version": "1.0",
    "name": "テスト戦略",
    "nodes": [{"id": "node_1", "type": "Signal", "action": "BUY"}],
    "edges": [],
}


def _make_ticker_mock():
    ticker = MagicMock()
    ticker.info = {"longName": "Nikkei 225"}
    return ticker


async def _create_strategy(client: AsyncClient) -> int:
    res = await client.post(
        STRATEGY_BASE,
        json={"name": "テスト戦略", "definition": SAMPLE_DEFINITION},
    )
    return res.json()["id"]


async def _fetch_market_data(client: AsyncClient) -> int:
    with (
        patch("yfinance.download", return_value=SAMPLE_DF),
        patch("yfinance.Ticker", return_value=_make_ticker_mock()),
    ):
        res = await client.post(
            f"{MARKET_BASE}/fetch",
            json={"symbol": "N225", "timeframe": "1d", "start_date": "2024-01-01", "end_date": "2024-01-31"},
        )
    return res.json()["id"]


async def test_create_backtest(client: AsyncClient):
    strategy_id = await _create_strategy(client)
    market_id = await _fetch_market_data(client)

    res = await client.post(
        BACKTEST_BASE,
        json={
            "strategy_id": strategy_id,
            "market_data_id": market_id,
            "initial_capital": 1_000_000,
            "commission_rate": 0.001,
            "slippage": 0.0005,
        },
    )
    assert res.status_code == 201
    data = res.json()
    assert data["status"] == "pending"
    assert data["strategy_id"] == strategy_id
    assert data["market_data_id"] == market_id


async def test_get_backtest_status(client: AsyncClient):
    strategy_id = await _create_strategy(client)
    market_id = await _fetch_market_data(client)

    bt = (
        await client.post(
            BACKTEST_BASE,
            json={"strategy_id": strategy_id, "market_data_id": market_id},
        )
    ).json()

    res = await client.get(f"{BACKTEST_BASE}/{bt['id']}/status")
    assert res.status_code == 200
    assert res.json()["status"] == "pending"


async def test_list_backtests(client: AsyncClient):
    strategy_id = await _create_strategy(client)
    market_id = await _fetch_market_data(client)

    await client.post(
        BACKTEST_BASE,
        json={"strategy_id": strategy_id, "market_data_id": market_id},
    )

    res = await client.get(BACKTEST_BASE)
    assert res.status_code == 200
    assert len(res.json()) == 1


async def test_list_filter_by_strategy(client: AsyncClient):
    strategy_id = await _create_strategy(client)
    market_id = await _fetch_market_data(client)

    await client.post(
        BACKTEST_BASE,
        json={"strategy_id": strategy_id, "market_data_id": market_id},
    )

    res = await client.get(BACKTEST_BASE, params={"strategy_id": strategy_id})
    assert res.status_code == 200
    assert len(res.json()) == 1

    res = await client.get(BACKTEST_BASE, params={"strategy_id": 9999})
    assert res.status_code == 200
    assert len(res.json()) == 0


async def test_delete_backtest(client: AsyncClient):
    strategy_id = await _create_strategy(client)
    market_id = await _fetch_market_data(client)

    bt = (
        await client.post(
            BACKTEST_BASE,
            json={"strategy_id": strategy_id, "market_data_id": market_id},
        )
    ).json()

    res = await client.delete(f"{BACKTEST_BASE}/{bt['id']}")
    assert res.status_code == 204

    res = await client.get(f"{BACKTEST_BASE}/{bt['id']}")
    assert res.status_code == 404
