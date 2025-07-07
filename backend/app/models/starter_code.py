# app/models/starter_code.py

from app.extensions import db

class StarterCode(db.Model):
    __tablename__ = 'starter_code'

    id = db.Column(db.Integer, primary_key=True)
    problem_id = db.Column(db.Integer, db.ForeignKey('problems.id', ondelete="CASCADE"))
    language = db.Column(db.String, nullable=False)
    code = db.Column(db.Text, nullable=False)
