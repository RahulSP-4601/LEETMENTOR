import os

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL", "postgresql://leetmentor_user:Riddhi@009@localhost/leetmentor_db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "CpEcArW_uCRXqp_qLUW1zDtISbLAcZGEkv8cl3OVWeWUiyIJW32IFQc4jJ7HqAeZu9AOZEv_NYwHelojVpRXKA")  # Strong secret
