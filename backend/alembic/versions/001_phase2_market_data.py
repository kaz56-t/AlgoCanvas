"""Phase 2: market_data_files schema update

Revision ID: 001
Revises:
Create Date: 2026-03-12
"""

from alembic import op
import sqlalchemy as sa

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # market_data_files テーブルが存在しなければ新規作成
    # 既存DBに uploaded_at カラムがある場合はリネーム + display_name 追加
    conn = op.get_bind()
    inspector = sa.inspect(conn)

    if "market_data_files" not in inspector.get_table_names():
        op.create_table(
            "market_data_files",
            sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
            sa.Column("symbol", sa.String, nullable=False),
            sa.Column("display_name", sa.String, nullable=True),
            sa.Column("filename", sa.String, nullable=False, unique=True),
            sa.Column("start_date", sa.Date, nullable=True),
            sa.Column("end_date", sa.Date, nullable=True),
            sa.Column("row_count", sa.Integer, nullable=True),
            sa.Column("timeframe", sa.String, nullable=True),
            sa.Column("fetched_at", sa.DateTime, server_default=sa.func.now()),
        )
        return

    existing_cols = {c["name"] for c in inspector.get_columns("market_data_files")}

    # uploaded_at → fetched_at のリネーム（SQLiteはカラムリネーム非対応のため再作成）
    if "uploaded_at" in existing_cols and "fetched_at" not in existing_cols:
        with op.batch_alter_table("market_data_files") as batch_op:
            batch_op.alter_column("uploaded_at", new_column_name="fetched_at")

    if "display_name" not in existing_cols:
        with op.batch_alter_table("market_data_files") as batch_op:
            batch_op.add_column(sa.Column("display_name", sa.String, nullable=True))


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    existing_cols = {c["name"] for c in inspector.get_columns("market_data_files")}

    if "fetched_at" in existing_cols and "uploaded_at" not in existing_cols:
        with op.batch_alter_table("market_data_files") as batch_op:
            batch_op.alter_column("fetched_at", new_column_name="uploaded_at")

    if "display_name" in existing_cols:
        with op.batch_alter_table("market_data_files") as batch_op:
            batch_op.drop_column("display_name")
