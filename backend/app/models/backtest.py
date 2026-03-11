from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class BacktestResult(Base):
    __tablename__ = "backtest_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    strategy_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("strategies.id", ondelete="CASCADE"), nullable=False
    )
    market_data_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("market_data_files.id", ondelete="CASCADE"), nullable=False
    )
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    initial_capital: Mapped[float] = mapped_column(Float, default=1_000_000.0)
    commission_rate: Mapped[float] = mapped_column(Float, default=0.001)
    slippage: Mapped[float] = mapped_column(Float, default=0.0005)
    metrics: Mapped[str | None] = mapped_column(String, nullable=True)      # JSON
    equity_curve: Mapped[str | None] = mapped_column(String, nullable=True)  # JSON
    trade_log: Mapped[str | None] = mapped_column(String, nullable=True)     # JSON
    status: Mapped[str] = mapped_column(String, default="pending", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
