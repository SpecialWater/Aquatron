from flask import Flask
from flask_cors import CORS
from app.config import Config

app = Flask(__name__)
CORS(app, supports_credentials=True)

app.config['CORS_HEADERS'] = 'application/json'
app.config['JWT_SECRET_KEY'] = Config.JWT_SECRET_KEY
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = Config.JWT_ACCESS_TOKEN_EXPIRES

from app import routes 