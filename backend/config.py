import os

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql://leetmentor_user:Riddhi%40009@localhost/leetmentor_db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
