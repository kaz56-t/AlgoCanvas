# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
# コンテナ内でパッケージを追加（requirements.txt も手動で更新すること）
docker compose exec backend uv pip install --system <package>

# requirements.txt からの一括インストール（ローカル開発時）
uv pip install -r backend/requirements.txt
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

## 価格データCSV形式

```csv
Date,Open,High,Low,Close,Volume
2024-01-04,33288,33491,33027,33377,1234567890
```

保存先: `backend/data/market/{symbol}_{timeframe}.csv`

## 開発フェーズ（進捗管理用）

- **Phase 1** — Docker + FastAPI骨格 + SQLite + React初期化 + レイアウト
- **Phase 2** — CSVアップロード・価格データ管理
- **Phase 3** — 戦略CRUD + ビジュアルエディタ（React Flow）
- **Phase 4** — バックテストエンジン + 結果画面
- **Phase 5** — 自然言語アルゴ生成（LLM連携）
- **Phase 6** — ダッシュボード・比較機能等
