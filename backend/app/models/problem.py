# app/models/problem.py

from app.extensions import db

class Problem(db.Model):
    __tablename__ = 'problems'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, unique=True, nullable=False)
    description = db.Column(db.Text)
    difficulty = db.Column(db.String)
    category = db.Column(db.String)

    test_cases = db.relationship("TestCase", backref="problem", cascade="all, delete-orphan")

# import at the bottom
from app.models.test_cases import TestCase
