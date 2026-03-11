from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routers import backtests, market_data, nl_generator, strategies


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="AlgoCanvas API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PREFIX = "/api/v1"
app.include_router(strategies.router, prefix=PREFIX)
app.include_router(backtests.router, prefix=PREFIX)
app.include_router(market_data.router, prefix=PREFIX)
app.include_router(nl_generator.router, prefix=PREFIX)


@app.get("/health")
async def health():
    return {"status": "ok"}
