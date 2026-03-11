from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.nl_parser import parse_natural_language

router = APIRouter(prefix="/nl-generate", tags=["nl-generator"])


class NLGenerateRequest(BaseModel):
    text: str


class NLGenerateResponse(BaseModel):
    definition: dict
    raw_text: str


@router.post("", response_model=NLGenerateResponse)
async def generate_from_text(body: NLGenerateRequest):
    if not body.text.strip():
        raise HTTPException(status_code=400, detail="text must not be empty")

    definition = await parse_natural_language(body.text)
    return NLGenerateResponse(definition=definition, raw_text=body.text)
