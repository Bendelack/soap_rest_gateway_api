from db import db
from sqlalchemy import  Column, Integer, String

class User(db.Model):
    __tablename__ = 'usuarios'

    id = Column(Integer, primary_key=True)
    username = Column(String, nullable=False)
    password = Column(String, nullable=False)

    # retorna um dicionário com os dados do usuário
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'password': self.password,
        }