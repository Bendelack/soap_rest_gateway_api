# API Rest
# Tecnologia: Flask
# Comandos
## Entre no diretório
```sh
cd ./rest
```
## Caso deseje, é recomendável criar uma ambiente virtal:
```sh
python -m venv env
```
### Ativar no Windows
```sh
.\env\Scripts\activate
```
### Ativar no Linux (ou WSL)
```sh
source env/bin/activate
```

## Instalar dependências
```sh
pip install -r requirements
```
## Criar o banco
```sh
flask db init
flask db migrate
flask db upgrade
```
## Rodar o projeto
```sh
python app.js
```