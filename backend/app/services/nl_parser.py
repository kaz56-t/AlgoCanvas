"""自然言語→戦略JSON変換サービス（Phase 5 で実装）"""

from app.config import settings

SYSTEM_PROMPT = """あなたは投資アルゴリズム設計の専門家です。
ユーザーの自然言語による戦略説明を、以下のJSONスキーマに変換してください。
スキーマ以外の出力は行わないでください。

スキーマ:
{
  "version": "1.0",
  "name": "<戦略名>",
  "nodes": [
    { "id": "node_1", "type": "<DataSource|Indicator|Condition|Logic|Signal|RiskControl>", ... }
  ],
  "edges": [
    { "source": "node_1", "target": "node_2" }
  ]
}
"""


async def parse_natural_language(text: str) -> dict:
    if settings.nl_parser_mode == "rule_based":
        return _rule_based_parse(text)

    try:
        return await _llm_parse(text)
    except Exception:
        return _rule_based_parse(text)


async def _llm_parse(text: str) -> dict:
    import json

    from openai import AsyncOpenAI

    client = AsyncOpenAI(
        base_url=f"{settings.llm_endpoint}/v1",
        api_key=settings.llm_api_key or "ollama",
    )
    response = await client.chat.completions.create(
        model=settings.llm_model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": text},
        ],
        temperature=0.2,
    )
    raw = response.choices[0].message.content or "{}"
    return json.loads(raw)


def _rule_based_parse(text: str) -> dict:
    """キーワードベースの簡易パーサー（LLM利用不可時のフォールバック）"""
    nodes = []
    edges = []
    node_id = 1

    def nid() -> str:
        nonlocal node_id
        _id = f"node_{node_id}"
        node_id += 1
        return _id

    # SMAクロス検出
    if "移動平均" in text or "SMA" in text or "EMA" in text:
        short_id = nid()
        long_id = nid()
        cond_id = nid()
        signal_id = nid()
        nodes += [
            {"id": short_id, "type": "Indicator", "indicator": "SMA", "params": {"period": 25}, "label": "短期SMA"},
            {"id": long_id, "type": "Indicator", "indicator": "SMA", "params": {"period": 75}, "label": "長期SMA"},
            {"id": cond_id, "type": "Condition", "operator": "crossover", "label": "クロス条件"},
            {"id": signal_id, "type": "Signal", "action": "BUY", "label": "買いシグナル"},
        ]
        edges += [
            {"source": short_id, "target": cond_id},
            {"source": long_id, "target": cond_id},
            {"source": cond_id, "target": signal_id},
        ]

    # リスク管理
    risk_id = nid()
    stop_loss = 5.0
    take_profit = 15.0
    if "損切" in text or "ストップ" in text:
        import re
        m = re.search(r"損切.*?(\d+\.?\d*)%", text)
        if m:
            stop_loss = float(m.group(1))
    if "利確" in text or "テイクプロフィット" in text:
        import re
        m = re.search(r"利確.*?(\d+\.?\d*)%", text)
        if m:
            take_profit = float(m.group(1))

    nodes.append({
        "id": risk_id,
        "type": "RiskControl",
        "stop_loss_pct": stop_loss,
        "take_profit_pct": take_profit,
        "position_size_pct": 100.0,
        "label": "リスク管理",
    })
    if nodes and nodes[-2]["type"] == "Signal":
        edges.append({"source": nodes[-2]["id"], "target": risk_id})

    return {
        "version": "1.0",
        "name": "自動生成戦略",
        "nodes": nodes,
        "edges": edges,
    }
