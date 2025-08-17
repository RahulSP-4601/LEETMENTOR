import os
from datetime import timedelta

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql://leetmentor_user:Riddhi@009@localhost/leetmentor_db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv(
        "JWT_SECRET_KEY",
        "CpEcArW_uCRXqp_qLUW1zDtISbLAcZGEkv8cl3OVWeWUiyIJW32IFQc4jJ7HqAeZu9AOZEv_NYwHelojVpRXKA"
    )

    # >>> Cookie-based JWT for dev <<<
    JWT_TOKEN_LOCATION = ["cookies"]
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)
    JWT_COOKIE_SAMESITE = "Lax"     # if you ever use different domains + HTTPS, switch to "None"
    JWT_COOKIE_SECURE = False       # True only on HTTPS
    JWT_COOKIE_CSRF_PROTECT = False # keep off for now (or handle X-CSRF-TOKEN on non-GET)
