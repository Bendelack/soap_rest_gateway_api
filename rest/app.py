from flask_migrate import Migrate
from flask import Flask, jsonify, request
from db import db
from models import User

app = Flask(__name__) # instância da aplicação

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///sqlite.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False # só modificará o banco quando fizer uma migration

db.init_app(app)
migrate = Migrate(app, db)

# home
@app.route("/", methods=["GET"])
def home():
    return {"message": "API Rest"}

# retorna todos os usuários
@app.route("/users/", methods=["GET"])
def get_all_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

# retorna um usuário pelo id
@app.route("/users/<int:user_id>/", methods=["GET"])
def get_user(user_id):
    user = User.query.get(user_id)
    if user:
        return jsonify(user.to_dict()), 200
    return jsonify({"message": "User not Found"}), 404

# rodar o projeto
if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=8080)