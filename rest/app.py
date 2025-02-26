from flask_migrate import Migrate
from flask import Flask, jsonify, request
from db import db
from models import User
from flask_cors import CORS

app = Flask(__name__) # instância da aplicação
CORS(app) # Habilita o CORS para todas as rotas da sua API

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

# cadastra um novo usuário
@app.route("/users/", methods=["POST"])
def add_user():
    data = request.get_json()
    new_user = User(username=data['username'], password=data['password'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": f"User {new_user.username} created successfully!"}), 201

# retorna um usuário pelo id
@app.route("/users/<int:user_id>/", methods=["GET"])
def get_user(user_id):
    user = User.query.get(user_id)
    if user:
        return jsonify(user.to_dict()), 200
    return jsonify({"message": "User not Found"}), 404

# atualiza os dados de um usuário
@app.route("/users/<int:user_id>/", methods=["PATCH"])
def update_user(user_id):
    data = request.get_json()
    user = User.query.get(user_id)
    if user:
        for key, value in data.items():
            setattr(user, key, value)
        db.session.commit()

        return jsonify({"message": "User updated successfully"}), 200
    return jsonify({"message": "User not Found"}), 404

# remove um usuário
@app.route("/users/<int:user_id>/", methods=["DELETE"])
def delete_user(user_id):
    user = User.query.get(user_id)
    if user:
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "User removed successfully"}), 200
    return jsonify({"message": "User not Found"}), 404

# pega um usuário pelo username
@app.route("/users/<string:username>/", methods=["GET"])
def get_user_by_username(username):
    user = User.query.filter_by(username=username).first()

    user_to_dict = {
        'id': user.id,
        'username': user.username,
        'password': user.password,
        'score': user.score,
    }

    if user:
        return jsonify(user_to_dict), 200
    return jsonify({"message": "User not Found"}), 404

# rodar o projeto
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)