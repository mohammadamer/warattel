from typing import Literal

from pydantic import BaseModel, Field


GoalType = Literal['verse-range', 'custom-passage']
PlanItemType = Literal['memorize', 'review', 'test']
PlanItemStatus = Literal['pending', 'in-progress', 'done']
RecitationStatus = Literal['queued', 'processing', 'complete']


class AuthCredentials(BaseModel):
    email: str = Field(min_length=3, max_length=160)
    password: str = Field(min_length=8, max_length=128)


class AuthResponse(BaseModel):
    access_token: str
    token_type: Literal['bearer'] = 'bearer'


class GoalCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    type: GoalType
    target: str = Field(min_length=1, max_length=120)
    duration_minutes: int = Field(default=15, ge=5, le=180)


class Goal(GoalCreate):
    id: str


class PlanItem(BaseModel):
    id: str
    title: str
    type: PlanItemType
    duration_minutes: int = Field(ge=1)
    status: PlanItemStatus


class DailyPlan(BaseModel):
    goal_id: str
    items: list[PlanItem]


class RecitationCreate(BaseModel):
    passage: str = Field(min_length=1, max_length=160)
    audio_uri: str = Field(min_length=1, max_length=500)


class RecitationIssue(BaseModel):
    id: str
    kind: Literal['missing', 'substitution', 'hesitation']
    label: str
    detail: str


class RecitationResult(BaseModel):
    id: str
    passage: str
    audio_uri: str
    status: RecitationStatus
    accuracy: int | None = Field(default=None, ge=0, le=100)
    confidence: Literal['high', 'medium', 'low'] | None = None
    summary: str
    issues: list[RecitationIssue]