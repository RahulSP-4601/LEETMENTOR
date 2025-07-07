# app/models/test_cases.py
from app.extensions import db

class TestCase(db.Model):
    __tablename__ = 'test_cases'

    id = db.Column(db.Integer, primary_key=True)
    problem_id = db.Column(db.Integer, db.ForeignKey("problems.id", ondelete="CASCADE"))
    input = db.Column(db.Text)
    expected_output = db.Column(db.Text)
