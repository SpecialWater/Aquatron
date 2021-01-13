from app.config import Config
from app import app, socketio
from flask import Flask, jsonify, request
from flask_cors import cross_origin
from flask_socketio import SocketIO, emit
from passlib.hash import sha512_crypt
from app.database import Client
from app.utility import get_ID, get_partition, get_partition_yesterday, \
    send_C2D_message, check_times
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

    id = get_ID()
    partition = get_partition()
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

    test_message('hello!')

    settings = deepcopy(request.json)
    id = get_ID()
    partition = get_partition()
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
    today = get_partition()
    yesterday = get_partition_yesterday()

    stateToday = AquaState.query_items(
        query="SELECT * FROM c",
        partition_key=today,
        enable_cross_partition_query=False,
        populate_query_metrics=False
    )

    stateYesterday = AquaState.query_items(
        query="SELECT * FROM c",
        partition_key=yesterday,
        enable_cross_partition_query=False,
        populate_query_metrics=False
    )

    returnState = [state for state in stateToday
                   if check_times(state["id"], minutes)]

    returnState.extend([state for state in stateYesterday
                        if check_times(state["id"], minutes)])

    # state = json.dumps([state for state in currentState], indent=True)
    state = json.dumps(returnState, indent=True)
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
        access_token = create_access_token(identity=user["Access"],
                                           expires_delta=False)

    return jsonify(access_token=access_token), 200



@socketio.on('connect')
def test_connect():
    print('connected!')
    emit('login response', {'data': 'Connected'})

@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected')

@socketio.on('my event')
def test_message(message):
    data = {"user": "Flask", "message": "Flask says hello!"}
    print(data)
    emit('my response', data)

@socketio.on('my broadcast event')
def test_message(message):
    data = json.loads(message)
    print(data)
    emit('my response', data, broadcast=True)