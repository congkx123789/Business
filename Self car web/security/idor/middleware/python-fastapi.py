from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from uuid import UUID


security = HTTPBearer()


def require_uuid_param(id_str: str) -> UUID:
    try:
        return UUID(id_str)
    except Exception:
        raise HTTPException(status_code=400, detail="invalid id")


async def enforce_ownership(resource_id: UUID, load_owner_id):
    owner_id = await load_owner_id(str(resource_id))
    if owner_id is None:
        raise HTTPException(status_code=404, detail="not found")
    # Replace with your auth subject fetch
    subject_id = "request-user-id"
    if owner_id != subject_id:
        raise HTTPException(status_code=403, detail="forbidden")

