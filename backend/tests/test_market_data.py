import io

from httpx import AsyncClient

BASE = "/api/v1/market-data"

SAMPLE_CSV = b"""Date,Open,High,Low,Close,Volume
2024-01-04,33288,33491,33027,33377,1234567890
2024-01-05,33377,33750,33290,33706,987654321
2024-01-09,33706,34000,33600,33900,800000000
"""


async def test_list_empty(client: AsyncClient):
    res = await client.get(BASE)
    assert res.status_code == 200
    assert res.json() == []


async def test_upload(client: AsyncClient):
    res = await client.post(
        BASE,
        params={"symbol": "N225", "timeframe": "1d"},
        files={"file": ("N225_1d.csv", io.BytesIO(SAMPLE_CSV), "text/csv")},
    )
    assert res.status_code == 201
    data = res.json()
    assert data["symbol"] == "N225"
    assert data["timeframe"] == "1d"
    assert data["row_count"] == 3
    assert data["start_date"] == "2024-01-04"
    assert data["end_date"] == "2024-01-09"


async def test_upload_missing_column(client: AsyncClient):
    bad_csv = b"Date,Open,High\n2024-01-04,100,110\n"
    res = await client.post(
        BASE,
        params={"symbol": "TEST", "timeframe": "1d"},
        files={"file": ("bad.csv", io.BytesIO(bad_csv), "text/csv")},
    )
    assert res.status_code == 422


async def test_get(client: AsyncClient):
    created = (
        await client.post(
            BASE,
            params={"symbol": "N225", "timeframe": "1d"},
            files={"file": ("N225_1d.csv", io.BytesIO(SAMPLE_CSV), "text/csv")},
        )
    ).json()
    res = await client.get(f"{BASE}/{created['id']}")
    assert res.status_code == 200
    assert res.json()["symbol"] == "N225"


async def test_get_not_found(client: AsyncClient):
    res = await client.get(f"{BASE}/9999")
    assert res.status_code == 404


async def test_delete(client: AsyncClient):
    created = (
        await client.post(
            BASE,
            params={"symbol": "N225", "timeframe": "1d"},
            files={"file": ("N225_1d.csv", io.BytesIO(SAMPLE_CSV), "text/csv")},
        )
    ).json()
    res = await client.delete(f"{BASE}/{created['id']}")
    assert res.status_code == 204
