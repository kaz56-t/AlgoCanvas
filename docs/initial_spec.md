# AlgoCanvas 仕様書

> 投資アルゴリズムのバックテスト・作成・編集を一元管理するローカル動作プラットフォーム

---

## 目次

1. [プロジェクト概要](#1-プロジェクト概要)
2. [システムアーキテクチャ](#2-システムアーキテクチャ)
3. [技術スタック](#3-技術スタック)
4. [ディレクトリ構成](#4-ディレクトリ構成)
5. [Docker構成](#5-docker構成)
6. [バックエンド仕様（FastAPI）](#6-バックエンド仕様fastapi)
7. [フロントエンド仕様（React）](#7-フロントエンド仕様react)
8. [データ設計](#8-データ設計)
9. [機能仕様](#9-機能仕様)
10. [画面仕様](#10-画面仕様)
11. [API仕様](#11-api仕様)
12. [非機能要件](#12-非機能要件)
13. [開発フェーズ](#13-開発フェーズ)

---

## 1. プロジェクト概要

### 1.1 アプリ名

**AlgoCanvas**

### 1.2 コンセプト

コーディング不要で投資アルゴリズムを「描く」ように作成・検証できるローカル動作プラットフォーム。自然言語による戦略生成、ビジュアルUIによる編集、および高精度バックテストを統合して提供する。

### 1.3 主要機能

| 機能 | 説明 |
|------|------|
| **バックテスト** | 作成したアルゴを過去の価格データで検証し、パフォーマンス指標を算出する |
| **自然言語アルゴ生成** | 日本語・英語の自然言語で投資戦略を記述するとアルゴ定義に変換する |
| **ビジュアルエディタ** | GUIでシグナル条件・フィルタ・注文ロジックをノーコードで組み立てる |

### 1.4 動作環境

- ローカルマシン上でDocker Composeにより完結動作
- インターネット接続不要（価格データは手動インポートまたはローカルキャッシュ）
- 対応OS: macOS / Windows（WSL2）/ Linux

---

## 2. システムアーキテクチャ

```
┌─────────────────────────────────────────────────────┐
│                   ブラウザ (localhost:3000)            │
│                   React SPA                          │
└────────────────────┬────────────────────────────────┘
                     │ HTTP / REST API
┌────────────────────▼────────────────────────────────┐
│               FastAPI (localhost:8000)               │
│  ┌────────────┐ ┌──────────────┐ ┌───────────────┐  │
│  │ Strategy   │ │  Backtest    │ │  NL Parser    │  │
│  │ CRUD       │ │  Engine      │ │  (LLM Bridge) │  │
│  └────────────┘ └──────────────┘ └───────────────┘  │
└────────────────────┬────────────────────────────────┘
                     │
         ┌───────────┴────────────┐
         │                        │
┌────────▼──────────┐   ┌────────▼──────────┐
│  SQLite DB        │   │  CSVファイル       │
│  (戦略/結果保存)   │   │  (価格データ)     │
└───────────────────┘   └───────────────────┘
```

### コンテナ構成

| コンテナ名 | 役割 | ポート |
|-----------|------|--------|
| `frontend` | React開発サーバー | 3000 |
| `backend` | FastAPI APIサーバー | 8000 |

---

## 3. 技術スタック

### フロントエンド

| カテゴリ | 採用技術 | バージョン目安 |
|---------|---------|--------------|
| フレームワーク | React | 18.x |
| 言語 | TypeScript | 5.x |
| UIライブラリ | shadcn/ui + Tailwind CSS | latest |
| 状態管理 | Zustand | 4.x |
| チャート | Recharts | 2.x |
| ノードエディタ | React Flow | 11.x |
| HTTPクライアント | Axios | 1.x |
| ルーティング | React Router | 6.x |
| フォーム | React Hook Form + Zod | latest |

### バックエンド

| カテゴリ | 採用技術 | バージョン目安 |
|---------|---------|--------------|
| フレームワーク | FastAPI | 0.110.x |
| 言語 | Python | 3.11.x |
| ORM | SQLAlchemy | 2.x |
| DB | SQLite | 3.x（ファイルDB） |
| バックテスト | backtrader / カスタム実装 | latest |
| データ処理 | pandas / numpy | latest |
| LLMブリッジ | OpenAI API互換（ローカルLLM対応） | - |
| バリデーション | Pydantic v2 | 2.x |
| マイグレーション | Alembic | latest |

### インフラ

| カテゴリ | 採用技術 |
|---------|---------|
| コンテナ | Docker + Docker Compose |
| リバースプロキシ | なし（開発時はそのままポート公開） |
| データ永続化 | Dockerボリューム（SQLiteファイル・CSVファイル） |

---

## 4. ディレクトリ構成

```
algocanvas/
├── docker-compose.yml
├── README.md
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/
│   ├── app/
│   │   ├── main.py                  # FastAPIアプリ起動点
│   │   ├── config.py                # 設定（パス・DB URL等）
│   │   ├── database.py              # SQLAlchemy接続
│   │   ├── models/
│   │   │   ├── strategy.py          # 戦略モデル
│   │   │   ├── backtest.py          # バックテスト結果モデル
│   │   │   └── market_data.py       # 価格データメタモデル
│   │   ├── schemas/
│   │   │   ├── strategy.py          # Pydanticスキーマ
│   │   │   ├── backtest.py
│   │   │   └── market_data.py
│   │   ├── routers/
│   │   │   ├── strategies.py        # 戦略CRUD API
│   │   │   ├── backtests.py         # バックテスト実行API
│   │   │   ├── market_data.py       # 価格データ管理API
│   │   │   └── nl_generator.py      # 自然言語変換API
│   │   ├── services/
│   │   │   ├── backtest_engine.py   # バックテストエンジン
│   │   │   ├── nl_parser.py         # 自然言語→戦略変換
│   │   │   ├── data_loader.py       # CSVローダー
│   │   │   └── metrics.py           # パフォーマンス指標算出
│   │   └── utils/
│   │       ├── logger.py
│   │       └── exceptions.py
│   └── data/
│       ├── db/
│       │   └── algocanvas.db        # SQLiteファイル
│       └── market/
│           └── *.csv                # 価格データCSV
│
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.ts
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── routes/
        │   ├── index.tsx            # ルーティング定義
        │   ├── Dashboard.tsx        # ダッシュボード
        │   ├── StrategyList.tsx     # 戦略一覧
        │   ├── StrategyEditor.tsx   # ビジュアルエディタ
        │   ├── NLGenerator.tsx      # 自然言語生成
        │   ├── BacktestRun.tsx      # バックテスト実行
        │   └── BacktestResult.tsx   # バックテスト結果
        ├── components/
        │   ├── layout/
        │   │   ├── Sidebar.tsx
        │   │   └── Header.tsx
        │   ├── editor/
        │   │   ├── StrategyNode.tsx  # React Flowノード
        │   │   ├── ConditionBlock.tsx
        │   │   └── ParameterPanel.tsx
        │   ├── backtest/
        │   │   ├── EquityCurve.tsx
        │   │   ├── MetricsCard.tsx
        │   │   └── TradeLog.tsx
        │   └── common/
        │       ├── FileUploader.tsx
        │       └── LoadingSpinner.tsx
        ├── store/
        │   ├── strategyStore.ts     # Zustand戦略ストア
        │   └── backtestStore.ts     # Zustandバックテストストア
        ├── api/
        │   ├── client.ts            # Axiosインスタンス
        │   ├── strategies.ts
        │   ├── backtests.ts
        │   └── marketData.ts
        └── types/
            ├── strategy.ts
            ├── backtest.ts
            └── marketData.ts
```

---

## 5. Docker構成

### docker-compose.yml

```yaml
version: "3.9"

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: algocanvas-backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend/app:/app/app          # ホットリロード用コードマウント
      - ./backend/data:/app/data        # DBとCSVデータ永続化
    environment:
      - DATABASE_URL=sqlite:////app/data/db/algocanvas.db
      - DATA_DIR=/app/data/market
      - LLM_ENDPOINT=http://host.docker.internal:11434  # ローカルLLM（Ollama等）
      - LLM_MODEL=llama3
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: algocanvas-frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend/src:/app/src         # ホットリロード用コードマウント
    environment:
      - VITE_API_BASE_URL=http://localhost:8000
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  backend-data:
```

### backend/Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

### frontend/Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json .
RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

---

## 6. バックエンド仕様（FastAPI）

### 6.1 アプリ起動点（main.py）

- FastAPIインスタンス生成
- CORS設定（`http://localhost:3000` を許可）
- 全ルーターを `/api/v1` プレフィックスで登録
- 起動時にSQLiteのテーブルを自動作成（Alembicマイグレーション）

### 6.2 バックテストエンジン（services/backtest_engine.py）

バックテストはPython内で同期実行（小〜中規模データ）またはバックグラウンドタスク（大規模データ）として処理する。

**処理フロー:**

```
1. 価格CSVを読み込み（pandas DataFrame）
2. 戦略定義（JSONスキーマ）を解析
3. 時系列ループでシグナル評価
4. 売買執行シミュレーション（手数料・スリッページ考慮）
5. パフォーマンス指標を算出
6. 結果をSQLiteに保存
```

**算出する主要指標:**

| 指標 | 説明 |
|------|------|
| Total Return | 総リターン（%） |
| Annual Return | 年率リターン（%） |
| Sharpe Ratio | シャープレシオ |
| Max Drawdown | 最大ドローダウン（%） |
| Win Rate | 勝率（%） |
| Profit Factor | プロフィットファクター |
| Total Trades | 総取引数 |
| Average Trade | 平均損益 |

### 6.3 自然言語パーサー（services/nl_parser.py）

**処理フロー:**

```
1. ユーザーの自然言語入力を受け取る
2. LLMエンドポイントにプロンプトを送信
3. LLMが戦略JSONスキーマを出力
4. スキーマをバリデーション（Pydantic）
5. 戦略オブジェクトとして返却
```

**LLM連携:**

- ローカルLLM（Ollama + llama3 等）をデフォルトとして使用
- OpenAI API互換のエンドポイントに対応（環境変数で切り替え）
- LLMが利用不可の場合はキーワードベースのルールパーサーにフォールバック

### 6.4 データローダー（services/data_loader.py）

**対応フォーマット:**

```
Date, Open, High, Low, Close, Volume
2024-01-01, 100.0, 105.0, 99.0, 103.0, 1000000
```

- CSVファイルのバリデーション（カラム名・型チェック）
- 日時パース（複数フォーマット対応）
- 欠損値処理（前日終値補完 or エラー）
- メタ情報（銘柄名・期間・件数）をSQLiteに登録

---

## 7. フロントエンド仕様（React）

### 7.1 ルーティング構成

| パス | コンポーネント | 説明 |
|------|--------------|------|
| `/` | Dashboard | ダッシュボード（サマリー） |
| `/strategies` | StrategyList | 戦略一覧 |
| `/strategies/new` | StrategyEditor | 新規戦略作成（ビジュアルエディタ） |
| `/strategies/:id/edit` | StrategyEditor | 戦略編集 |
| `/strategies/generate` | NLGenerator | 自然言語で戦略生成 |
| `/backtests/run` | BacktestRun | バックテスト設定・実行 |
| `/backtests/:id` | BacktestResult | バックテスト結果詳細 |
| `/data` | DataManager | 価格データ管理 |

### 7.2 状態管理（Zustand）

**strategyStore:**
- 戦略一覧のキャッシュ
- 現在編集中の戦略
- ビジュアルエディタのノード・エッジ状態

**backtestStore:**
- バックテスト実行状態（idle / running / done / error）
- 結果データキャッシュ
- ポーリングインターバル管理

### 7.3 ビジュアルエディタ（React Flow）

戦略をノード＆エッジのグラフとして表現する。

**ノード種別:**

| ノード | 説明 | プロパティ |
|--------|------|-----------|
| `DataSource` | 価格データ源泉 | 銘柄・時間足 |
| `Indicator` | テクニカル指標 | 指標種別・パラメータ |
| `Condition` | 条件評価 | 演算子・閾値 |
| `Logic` | 論理演算 | AND / OR / NOT |
| `Signal` | エントリー・エグジットシグナル | 売買方向 |
| `RiskControl` | リスク管理 | 損切り・利確・ポジションサイズ |

**接続ルール:**
- `DataSource` → `Indicator` → `Condition` → `Logic` → `Signal`
- `Signal` → `RiskControl` → 実行

---

## 8. データ設計

### 8.1 SQLiteテーブル定義

#### strategies（戦略テーブル）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | INTEGER PK | 自動採番 |
| name | TEXT NOT NULL | 戦略名 |
| description | TEXT | 説明文 |
| definition | TEXT NOT NULL | 戦略定義JSON（後述） |
| created_at | DATETIME | 作成日時 |
| updated_at | DATETIME | 更新日時 |
| is_favorite | BOOLEAN | お気に入りフラグ |
| tags | TEXT | タグ（カンマ区切り） |

#### backtest_results（バックテスト結果テーブル）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | INTEGER PK | 自動採番 |
| strategy_id | INTEGER FK | 戦略ID |
| market_data_id | INTEGER FK | 使用価格データID |
| start_date | DATE | バックテスト開始日 |
| end_date | DATE | バックテスト終了日 |
| initial_capital | REAL | 初期資金 |
| commission_rate | REAL | 手数料率 |
| slippage | REAL | スリッページ |
| metrics | TEXT | 指標JSON |
| equity_curve | TEXT | 資産推移JSON |
| trade_log | TEXT | 取引ログJSON |
| created_at | DATETIME | 実行日時 |
| status | TEXT | pending / running / done / error |

#### market_data_files（価格データファイルテーブル）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | INTEGER PK | 自動採番 |
| symbol | TEXT NOT NULL | 銘柄コード・名称 |
| filename | TEXT NOT NULL | CSVファイル名 |
| start_date | DATE | データ開始日 |
| end_date | DATE | データ終了日 |
| row_count | INTEGER | データ件数 |
| timeframe | TEXT | 時間足（1d / 1h 等） |
| uploaded_at | DATETIME | アップロード日時 |

### 8.2 戦略定義JSONスキーマ

```json
{
  "version": "1.0",
  "name": "ゴールデンクロス戦略",
  "nodes": [
    {
      "id": "node_1",
      "type": "Indicator",
      "indicator": "SMA",
      "params": { "period": 25 },
      "label": "短期SMA"
    },
    {
      "id": "node_2",
      "type": "Indicator",
      "indicator": "SMA",
      "params": { "period": 75 },
      "label": "長期SMA"
    },
    {
      "id": "node_3",
      "type": "Condition",
      "operator": "crossover",
      "label": "ゴールデンクロス"
    },
    {
      "id": "node_4",
      "type": "Signal",
      "action": "BUY",
      "label": "買いシグナル"
    },
    {
      "id": "node_5",
      "type": "RiskControl",
      "stop_loss_pct": 5.0,
      "take_profit_pct": 15.0,
      "position_size_pct": 100.0,
      "label": "リスク管理"
    }
  ],
  "edges": [
    { "source": "node_1", "target": "node_3" },
    { "source": "node_2", "target": "node_3" },
    { "source": "node_3", "target": "node_4" },
    { "source": "node_4", "target": "node_5" }
  ]
}
```

### 8.3 価格データCSV形式

```csv
Date,Open,High,Low,Close,Volume
2024-01-04,33288,33491,33027,33377,1234567890
2024-01-05,33377,33750,33290,33706,987654321
```

- ファイル保存先: `backend/data/market/{symbol}_{timeframe}.csv`
- 文字コード: UTF-8
- 日付フォーマット: YYYY-MM-DD（または YYYY/MM/DD）

---

## 9. 機能仕様

### 9.1 機能①：バックテスト

#### バックテスト設定項目

| 設定項目 | 型 | デフォルト | 説明 |
|---------|-----|----------|------|
| 戦略選択 | 選択 | - | 実行する戦略 |
| 価格データ選択 | 選択 | - | 使用する銘柄データ |
| 開始日 | 日付 | データ最初日 | バックテスト開始日 |
| 終了日 | 日付 | データ最終日 | バックテスト終了日 |
| 初期資金 | 数値 | 1,000,000 | 初期資産（円） |
| 手数料率 | 数値 | 0.1 | 片道手数料（%） |
| スリッページ | 数値 | 0.05 | スリッページ（%） |

#### 実行フロー

```
1. ユーザーが設定を入力して「実行」ボタンをクリック
2. フロントエンドがPOST /api/v1/backtests を呼び出す
3. バックエンドがバックテストを非同期実行（BackgroundTasks）
4. フロントエンドが GET /api/v1/backtests/{id}/status をポーリング（2秒間隔）
5. status が "done" になったら結果画面に遷移
```

### 9.2 機能②：自然言語アルゴ生成

#### 入力例

```
「25日移動平均線が75日移動平均線を上抜けたら買い、
下抜けたら売り。損切りは5%、利確は15%に設定する」
```

#### 処理フロー

```
1. ユーザーがテキストエリアに戦略を日本語で記述
2. POST /api/v1/nl-generate を呼び出す
3. バックエンドがLLMにプロンプトを送信
4. LLMが戦略JSONを返却
5. バックエンドがJSONをバリデーション
6. フロントエンドがビジュアルエディタにプレビュー表示
7. ユーザーが確認・修正後に「保存」
```

#### LLMへのシステムプロンプト骨子

```
あなたは投資アルゴリズム設計の専門家です。
ユーザーの自然言語による戦略説明を、以下のJSONスキーマに変換してください。
スキーマ以外の出力は行わないでください。

[JSONスキーマ定義を挿入]
```

### 9.3 機能③：ビジュアルエディタ

#### 操作仕様

| 操作 | 方法 |
|------|------|
| ノード追加 | 左パネルからドラッグ＆ドロップ |
| ノード接続 | ノードのポートをドラッグして別ノードへ接続 |
| ノード設定 | ノードをクリックして右パネルでパラメータ編集 |
| ノード削除 | ノード選択後にDeleteキー or 右クリックメニュー |
| キャンバス移動 | パン（ドラッグ）・ズーム（スクロール）対応 |
| 保存 | 「保存」ボタンでSQLiteに戦略定義JSONを保存 |

#### 対応テクニカル指標

| カテゴリ | 指標 |
|---------|------|
| トレンド系 | SMA, EMA, WMA, MACD, ADX |
| オシレーター | RSI, Stochastic, CCI, Williams %R |
| ボラティリティ系 | Bollinger Bands, ATR, 標準偏差 |
| ボリューム系 | OBV, Volume SMA |
| 価格 | 始値, 高値, 安値, 終値, 前日比 |

---

## 10. 画面仕様

### 10.1 ダッシュボード（/）

- 登録戦略数・実行バックテスト数のサマリーカード
- 直近バックテスト結果のリスト（戦略名・リターン・シャープレシオ）
- お気に入り戦略へのクイックリンク

### 10.2 戦略一覧（/strategies）

- カード形式で戦略を表示（名前・説明・最終バックテスト日・タグ）
- 検索・タグフィルタ・並び替え機能
- 各カードから「編集」「バックテスト実行」「複製」「削除」操作

### 10.3 ビジュアルエディタ（/strategies/new, /strategies/:id/edit）

- 左パネル: ノードパレット（ドラッグ可能）
- 中央: React Flowキャンバス
- 右パネル: 選択ノードのパラメータ設定フォーム
- 上部ツールバー: 保存・元に戻す・やり直し・検証ボタン

### 10.4 自然言語生成（/strategies/generate）

- 大きなテキストエリア（プレースホルダーで入力例を表示）
- 「生成」ボタン
- 生成結果のビジュアルプレビュー（React Flowミニマップ）
- 「エディタで開く」「そのまま保存」ボタン

### 10.5 バックテスト実行（/backtests/run）

- 戦略選択ドロップダウン
- 価格データ選択ドロップダウン
- 日付範囲ピッカー
- 詳細設定（初期資金・手数料・スリッページ）アコーディオン
- 「実行」ボタン・進捗インジケーター

### 10.6 バックテスト結果（/backtests/:id）

- 指標カード群（Total Return / Sharpe Ratio / Max Drawdown / Win Rate 等）
- 資産曲線チャート（Recharts LineChart）
- 月次リターンヒートマップ
- 取引ログテーブル（日付・売買・価格・損益）
- 「この設定でもう一度実行」ボタン

### 10.7 価格データ管理（/data）

- アップロード済みCSVファイル一覧（銘柄・期間・件数）
- CSVドラッグ＆ドロップアップロードエリア
- データプレビュー（最初の10行表示）
- 削除ボタン

---

## 11. API仕様

### 11.1 戦略API（/api/v1/strategies）

| メソッド | パス | 説明 | リクエスト | レスポンス |
|---------|------|------|-----------|----------|
| GET | `/strategies` | 戦略一覧取得 | - | `Strategy[]` |
| POST | `/strategies` | 戦略作成 | `StrategyCreate` | `Strategy` |
| GET | `/strategies/{id}` | 戦略詳細取得 | - | `Strategy` |
| PUT | `/strategies/{id}` | 戦略更新 | `StrategyUpdate` | `Strategy` |
| DELETE | `/strategies/{id}` | 戦略削除 | - | `204 No Content` |
| POST | `/strategies/{id}/duplicate` | 戦略複製 | - | `Strategy` |

### 11.2 バックテストAPI（/api/v1/backtests）

| メソッド | パス | 説明 | リクエスト | レスポンス |
|---------|------|------|-----------|----------|
| POST | `/backtests` | バックテスト実行 | `BacktestConfig` | `BacktestResult` |
| GET | `/backtests/{id}` | 結果取得 | - | `BacktestResult` |
| GET | `/backtests/{id}/status` | 実行ステータス取得 | - | `{status, progress}` |
| GET | `/backtests` | 結果一覧取得 | - | `BacktestResult[]` |
| DELETE | `/backtests/{id}` | 結果削除 | - | `204 No Content` |

### 11.3 価格データAPI（/api/v1/market-data）

| メソッド | パス | 説明 | リクエスト | レスポンス |
|---------|------|------|-----------|----------|
| GET | `/market-data` | ファイル一覧取得 | - | `MarketDataFile[]` |
| POST | `/market-data/upload` | CSVアップロード | `multipart/form-data` | `MarketDataFile` |
| GET | `/market-data/{id}/preview` | データプレビュー | - | `{rows: Record[]}` |
| DELETE | `/market-data/{id}` | ファイル削除 | - | `204 No Content` |

### 11.4 自然言語生成API（/api/v1/nl-generate）

| メソッド | パス | 説明 | リクエスト | レスポンス |
|---------|------|------|-----------|----------|
| POST | `/nl-generate` | 戦略生成 | `{text: string}` | `{definition: JSON, preview: string}` |
| GET | `/nl-generate/health` | LLM接続確認 | - | `{available: bool, model: string}` |

### 11.5 共通レスポンス形式

**成功時:**
```json
{
  "data": { ... },
  "message": "success"
}
```

**エラー時:**
```json
{
  "detail": "エラーメッセージ",
  "code": "STRATEGY_NOT_FOUND"
}
```

---

## 12. 非機能要件

### 12.1 パフォーマンス

| 項目 | 目標値 |
|------|--------|
| バックテスト実行時間 | 5年分日足データで10秒以内 |
| API応答時間（データ取得系） | 500ms以内 |
| フロントエンド初期表示 | 3秒以内 |

### 12.2 データ上限

| 項目 | 上限 |
|------|------|
| CSVアップロードサイズ | 50MB/ファイル |
| 戦略保存数 | 上限なし（SQLiteの制約内） |
| バックテスト結果保存数 | 上限なし |

### 12.3 セキュリティ

- ローカル動作のため認証は実装しない（将来拡張として設計に配慮）
- CSVアップロード時にファイル形式・サイズをバリデーション
- SQLインジェクション対策（SQLAlchemy ORM使用）
- APIへの入力はすべてPydanticでバリデーション

### 12.4 エラーハンドリング

- バックエンドは全エラーをJSONで返却（HTTPステータスコードと組み合わせ）
- フロントエンドはトースト通知でユーザーに表示
- バックテスト失敗時はステータスを "error" としてエラーメッセージを保存

---

## 13. 開発フェーズ

### Phase 1 — 基盤構築（推奨優先度: 高）

- [ ] Docker Compose環境セットアップ
- [ ] FastAPIアプリ骨格作成（CORS・ルーター登録）
- [ ] SQLiteテーブル作成・Alembicマイグレーション設定
- [ ] React + Vite + TypeScriptプロジェクト初期化
- [ ] shadcn/ui・Tailwind CSS設定
- [ ] サイドバー・ヘッダーのレイアウトコンポーネント
- [ ] Axiosクライアント・Zustandストア骨格

### Phase 2 — 価格データ管理（推奨優先度: 高）

- [ ] CSVアップロードAPI実装
- [ ] データバリデーション・メタデータ登録
- [ ] データ管理画面実装（アップロード・一覧・削除）

### Phase 3 — 戦略CRUD（推奨優先度: 高）

- [ ] 戦略API実装（CRUD）
- [ ] 戦略一覧画面実装
- [ ] ビジュアルエディタ実装（React Flow）
- [ ] ノードパレット・パラメータパネル実装

### Phase 4 — バックテストエンジン（推奨優先度: 高）

- [ ] バックテストエンジン実装
- [ ] パフォーマンス指標算出ロジック
- [ ] バックテスト実行API・ポーリングAPI実装
- [ ] バックテスト実行画面・結果画面実装
- [ ] 資産曲線チャート・取引ログテーブル実装

### Phase 5 — 自然言語生成（推奨優先度: 中）

- [ ] ローカルLLM連携実装（Ollama）
- [ ] 自然言語→戦略JSONプロンプトチューニング
- [ ] 自然言語生成画面実装
- [ ] キーワードベースフォールバックパーサー実装

### Phase 6 — 品質向上（推奨優先度: 低）

- [ ] ダッシュボード実装
- [ ] 月次リターンヒートマップ
- [ ] 戦略の複製・タグ・検索機能
- [ ] バックテスト比較機能（複数結果を並列表示）
- [ ] 設定エクスポート・インポート（JSON）

---

## 付録 A: 環境変数一覧

### バックエンド

| 変数名 | デフォルト | 説明 |
|--------|----------|------|
| `DATABASE_URL` | `sqlite:////app/data/db/algocanvas.db` | SQLite接続文字列 |
| `DATA_DIR` | `/app/data/market` | 価格データCSV保存先 |
| `LLM_ENDPOINT` | `http://host.docker.internal:11434` | LLMエンドポイントURL |
| `LLM_MODEL` | `llama3` | 使用するLLMモデル名 |
| `LLM_API_KEY` | `""` | APIキー（ローカルLLMの場合は不要） |
| `MAX_UPLOAD_SIZE_MB` | `50` | CSVアップロード上限（MB） |
| `CORS_ORIGINS` | `http://localhost:3000` | 許可するオリジン |

### フロントエンド

| 変数名 | デフォルト | 説明 |
|--------|----------|------|
| `VITE_API_BASE_URL` | `http://localhost:8000` | バックエンドAPIのベースURL |

---

## 付録 B: ローカルLLMセットアップ（Ollama）

ClaudeCodeでのLLM機能利用にはOllamaの事前インストールが必要。

```bash
# Ollamaインストール（macOS）
brew install ollama

# モデル取得
ollama pull llama3

# 起動（ホスト側で実行、Dockerから host.docker.internal でアクセス）
ollama serve
```

LLMを使わない場合は `NL_PARSER_MODE=rule_based` を環境変数に設定することでキーワードベースのパーサーにフォールバックする。

---

## 付録 C: 初期データサンプル

テスト用の価格データはYahoo Financeやstooq等からCSV形式でダウンロード可能。

```bash
# Python + yfinanceでサンプルデータを取得する例
pip install yfinance
python -c "
import yfinance as yf
df = yf.download('7203.T', start='2019-01-01', end='2024-12-31')
df.to_csv('toyota_1d.csv')
"
```

---

*このドキュメントはAlgoCanvas v1.0の仕様書です。*  
*最終更新: 2026-03-11*