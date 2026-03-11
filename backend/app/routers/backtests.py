from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.backtest import BacktestResult
from app.schemas.backtest import BacktestCreate, BacktestResponse, BacktestStatusResponse

router = APIRouter(prefix="/backtests", tags=["backtests"])


@router.get("", response_model=list[BacktestResponse])
async def list_backtests(
    strategy_id: int | None = None, db: AsyncSession = Depends(get_db)
):
    query = select(BacktestResult).order_by(BacktestResult.created_at.desc())
    if strategy_id is not None:
        query = query.where(BacktestResult.strategy_id == strategy_id)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=BacktestResponse, status_code=status.HTTP_201_CREATED)
async def create_backtest(
    body: BacktestCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    backtest = BacktestResult(
        strategy_id=body.strategy_id,
        market_data_id=body.market_data_id,
        start_date=body.start_date,
        end_date=body.end_date,
        initial_capital=body.initial_capital,
        commission_rate=body.commission_rate,
        slippage=body.slippage,
        status="pending",
    )
    db.add(backtest)
    await db.commit()
    await db.refresh(backtest)

    # Phase 4 で実装するバックテストエンジンをここで呼び出す
    # background_tasks.add_task(run_backtest, backtest.id)

    return backtest


@router.get("/{backtest_id}", response_model=BacktestResponse)
async def get_backtest(backtest_id: int, db: AsyncSession = Depends(get_db)):
    backtest = await db.get(BacktestResult, backtest_id)
    if not backtest:
        raise HTTPException(status_code=404, detail="Backtest not found")
    return backtest


@router.get("/{backtest_id}/status", response_model=BacktestStatusResponse)
async def get_backtest_status(backtest_id: int, db: AsyncSession = Depends(get_db)):
    backtest = await db.get(BacktestResult, backtest_id)
    if not backtest:
        raise HTTPException(status_code=404, detail="Backtest not found")
    return backtest


@router.delete("/{backtest_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_backtest(backtest_id: int, db: AsyncSession = Depends(get_db)):
    backtest = await db.get(BacktestResult, backtest_id)
    if not backtest:
        raise HTTPException(status_code=404, detail="Backtest not found")
    await db.delete(backtest)
    await db.commit()
