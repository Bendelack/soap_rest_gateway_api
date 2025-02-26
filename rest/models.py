from db import db
from sqlalchemy import  Column, Integer, String, UniqueConstraint

class User(db.Model):
    __tablename__ = 'usuarios'

    id = Column(Integer, primary_key=True)
    username = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)
    score = Column(Integer, default=0)

    __table_args__ = (
        UniqueConstraint('username', name='uq_users_username'),
    )

    # retorna um dicionário com os dados do usuário
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'score': self.score,
        }