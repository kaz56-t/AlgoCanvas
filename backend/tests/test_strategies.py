import pytest
from httpx import AsyncClient

BASE = "/api/v1/strategies"

SAMPLE_DEFINITION = {
    "version": "1.0",
    "name": "ゴールデンクロス",
    "nodes": [
        {"id": "node_1", "type": "Indicator", "indicator": "SMA", "params": {"period": 25}},
        {"id": "node_2", "type": "Indicator", "indicator": "SMA", "params": {"period": 75}},
        {"id": "node_3", "type": "Condition", "operator": "crossover"},
        {"id": "node_4", "type": "Signal", "action": "BUY"},
    ],
    "edges": [
        {"source": "node_1", "target": "node_3"},
        {"source": "node_2", "target": "node_3"},
        {"source": "node_3", "target": "node_4"},
    ],
}

SAMPLE_BODY = {
    "name": "テスト戦略",
    "description": "ゴールデンクロス戦略",
    "definition": SAMPLE_DEFINITION,
    "is_favorite": False,
    "tags": "SMA,クロス",
}


async def test_list_empty(client: AsyncClient):
    res = await client.get(BASE)
    assert res.status_code == 200
    assert res.json() == []


async def test_create(client: AsyncClient):
    res = await client.post(BASE, json=SAMPLE_BODY)
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "テスト戦略"
    assert data["id"] == 1
    assert data["definition"]["version"] == "1.0"


async def test_get(client: AsyncClient):
    created = (await client.post(BASE, json=SAMPLE_BODY)).json()
    res = await client.get(f"{BASE}/{created['id']}")
    assert res.status_code == 200
    assert res.json()["name"] == "テスト戦略"


async def test_get_not_found(client: AsyncClient):
    res = await client.get(f"{BASE}/9999")
    assert res.status_code == 404


async def test_list_after_create(client: AsyncClient):
    await client.post(BASE, json=SAMPLE_BODY)
    await client.post(BASE, json={**SAMPLE_BODY, "name": "戦略2"})
    res = await client.get(BASE)
    assert res.status_code == 200
    assert len(res.json()) == 2


async def test_update(client: AsyncClient):
    created = (await client.post(BASE, json=SAMPLE_BODY)).json()
    res = await client.put(
        f"{BASE}/{created['id']}",
        json={"name": "更新後の戦略", "is_favorite": True},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "更新後の戦略"
    assert data["is_favorite"] is True


async def test_update_not_found(client: AsyncClient):
    res = await client.put(f"{BASE}/9999", json={"name": "x"})
    assert res.status_code == 404


async def test_delete(client: AsyncClient):
    created = (await client.post(BASE, json=SAMPLE_BODY)).json()
    res = await client.delete(f"{BASE}/{created['id']}")
    assert res.status_code == 204
    res = await client.get(f"{BASE}/{created['id']}")
    assert res.status_code == 404


async def test_delete_not_found(client: AsyncClient):
    res = await client.delete(f"{BASE}/9999")
    assert res.status_code == 404
