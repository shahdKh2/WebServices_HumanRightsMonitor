from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt
from auth import SECRET_KEY, ALGORITHM

router = APIRouter(tags=["Auth"])


@router.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Dummy user check — replace this with a real database lookup!
    if form_data.username == "caseworker" and form_data.password == "pass":
        token = jwt.encode(
            {"sub": form_data.username, "role": "case_worker"},
            SECRET_KEY, algorithm=ALGORITHM
        )
        return {"access_token": token, "token_type": "bearer"}

    raise HTTPException(status_code=401, detail="Invalid credentials")
