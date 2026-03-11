import json
from datetime import datetime
from typing import Any

from pydantic import BaseModel, field_validator


class StrategyCreate(BaseModel):
    name: str
    description: str | None = None
    definition: dict[str, Any]
    is_favorite: bool = False
    tags: str | None = None


class StrategyUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    definition: dict[str, Any] | None = None
    is_favorite: bool | None = None
    tags: str | None = None


class StrategyResponse(BaseModel):
    id: int
    name: str
    description: str | None
    definition: dict[str, Any]
    is_favorite: bool
    tags: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @field_validator("definition", mode="before")
    @classmethod
    def parse_definition(cls, v: Any) -> Any:
        if isinstance(v, str):
            return json.loads(v)
        return v
