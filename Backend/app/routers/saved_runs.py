from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.user import SavedRun, User
from .auth import get_current_user
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/saved-runs", tags=["Saved Runs"])

class SavedRunCreate(BaseModel):
    title: str
    content: str
    run_type: str

class SavedRunResponse(BaseModel):
    id: int
    title: str
    content: str
    run_type: str
    created_at: datetime

    class Config:
        from_attributes = True

@router.post("/", response_model=SavedRunResponse)
async def create_saved_run(
    run: SavedRunCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_run = SavedRun(
        user_id=current_user.id,
        title=run.title,
        content=run.content,
        run_type=run.run_type
    )
    db.add(db_run)
    db.commit()
    db.refresh(db_run)
    return db_run

@router.get("/", response_model=List[SavedRunResponse])
async def get_saved_runs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(SavedRun).filter(SavedRun.user_id == current_user.id).all()

@router.delete("/{run_id}")
async def delete_saved_run(
    run_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_run = db.query(SavedRun).filter(SavedRun.id == run_id, SavedRun.user_id == current_user.id).first()
    if not db_run:
        raise HTTPException(status_code=404, detail="Run not found")
    db.delete(db_run)
    db.commit()
    return {"message": "Run deleted"}
