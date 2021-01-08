from app.config import Config
from app import app
from flask import Flask, jsonify, request
from flask_cors import cross_origin
from passlib.hash import sha512_crypt
from app.database import Client
from app.utility import getID, getPartition, send_C2D_message
from copy import deepcopy
from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token,
    get_jwt_identity
)
import json

jwt = JWTManager(app)
AquaState = Client('State').container
AquaSettings = Client('Settings').container
AquaMaster = Client('Master').container
AquaUser = Client('User').container


@app.route('/')
@app.route('/index')
def index():
    return 'hello world'


@app.route('/state/post', methods=['POST'])
@cross_origin()
@jwt_required
def postState():
    if not request.is_json:
        return jsonify({"msg": "Missing JSON in request"}), 400
    if get_jwt_identity() != 'admin':
        return jsonify({"msg": "Access denied"}), 400

    id = getID()
    partition = getPartition()
    request.json['id'] = id
    request.json['reportDate'] = partition
    AquaState.create_item(request.json)

    print(request.json)
    return request.json


@app.route('/settings/post', methods=['POST'])
@cross_origin()
@jwt_required
def postSettings():
    if not request.is_json:
        return jsonify({"msg": "Missing JSON in request"}), 400
    if get_jwt_identity() != 'admin':
        return jsonify({"msg": "Access denied"}), 400

    settings = deepcopy(request.json)
    id = getID()
    partition = getPartition()
    settings['id'] = id
    settings['reportDate'] = partition

    master = deepcopy(request.json)
    master['device'] = 'AndrewPi'
    master['id'] = 'master'

    AquaSettings.create_item(settings)
    AquaMaster.upsert_item(master)

    send_C2D_message()

    return request.json


@app.route('/settings/get', methods=['GET'])
@cross_origin()
def getSettings():

    currentSettings = AquaMaster.read_item("master", partition_key="AndrewPi")
    return currentSettings


@app.route('/state/get/<minutes>', methods=['GET'])
@cross_origin()
def getState(minutes):

    currentState = AquaState.query_items(
        query="""SELECT * FROM c
        WHERE DateTimeDiff("Minute", c.id, GetCurrentDateTime()) < @minutes""",
        parameters=[dict(name="@minutes", value=int(minutes))],
        enable_cross_partition_query=True,
        populate_query_metrics=False
    )

    # state = json.dumps([{'id': state['id'], 
    #                      'Temperature': state['Temperature'],
    #                      'pH': state['pH']}
    #                     for state in currentState])
    
    state = json.dumps([state for state in currentState], indent=True)

    return state


@app.route('/registerUser', methods=['POST'])
@cross_origin()
def registerUser():
    if not request.is_json:
        return jsonify({"msg": "Missing JSON in request"}), 400

    username = request.json.get('username', None)
    password = request.json.get('password', None)
    secretKey = request.json.get('secretKey', None)
    access = request.json.get("access", None)

    if not username:
        return jsonify({"msg": "Missing username parameter"}), 400
    if not password:
        return jsonify({"msg": "Missing password parameter"}), 400
    if not secretKey:
        return jsonify({"msg": "Missing secret key"}), 400

    if secretKey != Config.UserRegisterSecret:
        return jsonify({"msg": "Wrong key"}), 400

    pw_hash = sha512_crypt.encrypt(password)

    newUser = {
        "id": username,
        "UserId": username,
        "Password": pw_hash,
        "Access": access
    }

    AquaUser.create_item(newUser)

    return "New user, {}, created!".format(username)


@app.route('/login', methods=['POST', 'OPTIONS'])
@cross_origin()
def login():
    if not request.is_json:
        return jsonify({"msg": "Missing JSON in request"}), 400

    username = request.json.get('username', None)
    password = request.json.get('password', None)
    username = username.lower()

    if not username:
        return jsonify({"msg": "Missing username parameter"}), 400
    if not password:
        return jsonify({"msg": "Missing password parameter"}), 400

    user = AquaUser.read_item(username, partition_key=username)
    verifyPass = sha512_crypt.verify(password, user["Password"])

    if not verifyPass:
        return jsonify({"msg": "Bad username or password"}), 401
    else:
        access_token = create_access_token(identity=user["Access"], expires_delta=False)

    return jsonify(access_token=access_token), 200

