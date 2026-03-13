# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workflow Orchestration

### 1. Plan Node Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately – don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes – don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests – then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.

## 開発ルール

- 大きな実装を行うときは `main` ブランチからブランチを切って実装する。ブランチ名は `feature/<機能名>` の形式を推奨。


## テスト

```bash
# コンテナ内でテスト実行（推奨）
docker compose exec backend pytest

# 単一ファイルのみ
docker compose exec backend pytest tests/test_strategies.py -v

# ローカル実行（uv 環境）
cd backend
uv pip install --system .[dev]
pytest
```

テスト構成: `backend/tests/`
- `conftest.py` — インメモリ SQLite + `httpx.AsyncClient` フィクスチャ
- `test_health.py` — ヘルスチェック
- `test_strategies.py` — 戦略 CRUD 全ケース
- `test_market_data.py` — Ticker取得・バリデーション（yfinanceはモック）
- `test_backtests.py` — バックテスト作成・ステータス取得

## 開発コマンド

```bash
# 起動
docker compose up --build

# バックグラウンド起動
docker compose up -d --build

# 停止
docker compose down

# バックエンドのみ再起動
docker compose restart backend

# バックエンドのログ確認
docker compose logs -f backend

# Alembicマイグレーション実行（コンテナ内）
docker compose exec backend alembic upgrade head

# マイグレーションファイル生成
docker compose exec backend alembic revision --autogenerate -m "description"

# バックエンドのシェルに入る
docker compose exec backend bash
```

### パッケージ管理（uv）

バックエンドのパッケージ管理には [uv](https://docs.astral.sh/uv/) を使用する。Dockerイメージ内では `uv pip install --system` で `/usr/local` 直下にインストールする。

```bash
# パッケージを追加するには pyproject.toml の dependencies を編集してからリビルド
docker compose up --build backend

# ローカル開発時（devも含む）
uv pip install --system -e backend/[dev]
```

## アーキテクチャ

ローカル動作専用のシングルユーザー投資アルゴバックテストプラットフォーム。認証なし。

```
React SPA (localhost:3000)
    ↓ REST API (/api/v1/...)
FastAPI (localhost:8000)
    ↓
SQLite (backend/data/db/algocanvas.db)  +  CSV (backend/data/market/*.csv)
```

**コンテナ**: `algocanvas-backend` / `algocanvas-frontend`
**ホットリロード**: `backend/app/` と `frontend/src/` はバインドマウント済み

## バックエンド構造（FastAPI）

- `app/main.py` — FastAPIインスタンス、CORS（localhost:3000許可）、全ルーターを `/api/v1` プレフィックスで登録
- `app/config.py` — Pydantic Settingsで環境変数を管理
- `app/database.py` — SQLAlchemy接続、セッション管理
- `app/models/` — SQLAlchemyモデル（strategy / backtest / market_data）
- `app/schemas/` — Pydantic v2スキーマ（リクエスト/レスポンス）
- `app/routers/` — APIエンドポイント（strategies / backtests / market_data / nl_generator）
- `app/services/` — ビジネスロジック（backtest_engine / nl_parser / data_loader / metrics）

**戦略定義はJSONカラムで保存**（`strategies.definition`）。スキーマは `nodes[]` + `edges[]` のグラフ構造（仕様書 §8.2参照）。

**バックテスト非同期実行**: `POST /api/v1/backtests` でBackgroundTasksに登録 → `GET /api/v1/backtests/{id}/status` を2秒ポーリング。

**LLM連携**: `LLM_ENDPOINT`（デフォルト: Ollama `http://host.docker.internal:11434`）にOpenAI互換APIでリクエスト。`NL_PARSER_MODE=rule_based` でキーワードパーサーにフォールバック。

## フロントエンド構造（React + Vite）

- `src/api/client.ts` — Axiosインスタンス（`VITE_API_BASE_URL` ベース）
- `src/store/` — Zustand（strategyStore / backtestStore）
- `src/routes/` — ページコンポーネント（React Router v6）
- `src/components/editor/` — React Flowノードコンポーネント
- `src/components/backtest/` — Rechartsチャートコンポーネント
- `src/types/` — TypeScript型定義（バックエンドスキーマと対応）

## 主要環境変数

| 変数 | デフォルト | 説明 |
|------|----------|------|
| `DATABASE_URL` | `sqlite:////app/data/db/algocanvas.db` | SQLite接続文字列 |
| `DATA_DIR` | `/app/data/market` | CSV保存先 |
| `LLM_ENDPOINT` | `http://host.docker.internal:11434` | Ollama等のLLMエンドポイント |
| `LLM_MODEL` | `llama3` | 使用モデル名 |
| `CORS_ORIGINS` | `http://localhost:3000` | 許可オリジン |
| `VITE_API_BASE_URL` | `http://localhost:8000` | フロントからのAPIベースURL |

## 価格データ

yfinanceでTicker指定→Yahoo Financeから取得→ローカルCSVキャッシュ保存。

- APIエンドポイント: `POST /api/v1/market-data/fetch`
- キャッシュ保存先: `backend/data/market/{symbol}_{timeframe}.csv`
- 対応Ticker例: `7203.T`（トヨタ）, `AAPL`, `^N225`（日経平均）, `BTC-USD`

## 開発フェーズ（進捗管理用）

- **Phase 1** — Docker + FastAPI骨格 + SQLite + React初期化 + レイアウト ✅
- **Phase 2** — yfinance Ticker取得・価格データ管理
- **Phase 3** — 戦略CRUD + ビジュアルエディタ（React Flow）
- **Phase 4** — バックテストエンジン + 結果画面
- **Phase 5** — 自然言語アルゴ生成（LLM連携）
- **Phase 6** — ダッシュボード・比較機能等
