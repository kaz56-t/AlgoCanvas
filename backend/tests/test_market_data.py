from unittest.mock import MagicMock, patch

import pandas as pd
from httpx import AsyncClient

BASE = "/api/v1/market-data"

# yfinance returns a DataFrame with a DatetimeIndex named "Date"
SAMPLE_DF = pd.DataFrame(
    {
        "Open": [33288.0, 33377.0, 33706.0],
        "High": [33491.0, 33750.0, 34000.0],
        "Low": [33027.0, 33290.0, 33600.0],
        "Close": [33377.0, 33706.0, 33900.0],
        "Volume": [1234567890.0, 987654321.0, 800000000.0],
    },
    index=pd.DatetimeIndex(["2024-01-04", "2024-01-05", "2024-01-09"], name="Date"),
)

SAMPLE_INFO = {"longName": "Nikkei 225", "shortName": "N225"}

FETCH_BODY = {
    "symbol": "N225",
    "timeframe": "1d",
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "refresh": False,
}


def _make_ticker_mock():
    ticker = MagicMock()
    ticker.info = SAMPLE_INFO
    return ticker


async def test_list_empty(client: AsyncClient):
    res = await client.get(BASE)
    assert res.status_code == 200
    assert res.json() == []


async def test_fetch(client: AsyncClient):
    with (
        patch("yfinance.download", return_value=SAMPLE_DF) as mock_dl,
        patch("yfinance.Ticker", return_value=_make_ticker_mock()),
    ):
        res = await client.post(f"{BASE}/fetch", json=FETCH_BODY)

    assert res.status_code == 201, res.text
    data = res.json()
    assert data["symbol"] == "N225"
    assert data["display_name"] == "Nikkei 225"
    assert data["timeframe"] == "1d"
    assert data["row_count"] == 3
    assert data["start_date"] == "2024-01-04"
    assert data["end_date"] == "2024-01-09"
    mock_dl.assert_called_once()


async def test_fetch_empty_returns_502(client: AsyncClient):
    with (
        patch("yfinance.download", return_value=pd.DataFrame()),
        patch("yfinance.Ticker", return_value=_make_ticker_mock()),
    ):
        res = await client.post(f"{BASE}/fetch", json=FETCH_BODY)

    assert res.status_code == 502


async def test_fetch_refresh(client: AsyncClient):
    with (
        patch("yfinance.download", return_value=SAMPLE_DF),
        patch("yfinance.Ticker", return_value=_make_ticker_mock()),
    ):
        # 1回目取得
        await client.post(f"{BASE}/fetch", json=FETCH_BODY)
        # refresh=True で再取得
        body = {**FETCH_BODY, "refresh": True}
        res = await client.post(f"{BASE}/fetch", json=body)

    assert res.status_code == 201
    assert res.json()["row_count"] == 3


async def test_get(client: AsyncClient):
    with (
        patch("yfinance.download", return_value=SAMPLE_DF),
        patch("yfinance.Ticker", return_value=_make_ticker_mock()),
    ):
        created = (await client.post(f"{BASE}/fetch", json=FETCH_BODY)).json()

    res = await client.get(f"{BASE}/{created['id']}")
    assert res.status_code == 200
    assert res.json()["symbol"] == "N225"


async def test_get_not_found(client: AsyncClient):
    res = await client.get(f"{BASE}/9999")
    assert res.status_code == 404


async def test_delete(client: AsyncClient):
    with (
        patch("yfinance.download", return_value=SAMPLE_DF),
        patch("yfinance.Ticker", return_value=_make_ticker_mock()),
    ):
        created = (await client.post(f"{BASE}/fetch", json=FETCH_BODY)).json()

    res = await client.delete(f"{BASE}/{created['id']}")
    assert res.status_code == 204
