from app.config import Config
from app import app
from flask import Flask, jsonify, request
from flask_cors import cross_origin
from app.database import Client
from app.utility import getID, getPartition
from copy import deepcopy


AquaState = Client('State').getContainer()
AquaSettings = Client('Settings').getContainer()
AquaMaster = Client('Master').getContainer()

@app.route('/')
@app.route('/index')
def index():
    return 'hello world'


@app.route('/state/post', methods=['POST'])
@cross_origin()
def postState():
    if not request.is_json:
        return jsonify({"msg": "Missing JSON in request"}), 400
    
    id = getID()
    partition = getPartition()
    request.json['id'] = id
    request.json['reportDate'] = partition
    AquaState.create_item(request.json)

    print(request.json)
    return request.json

@app.route('/settings/post', methods=['POST'])
@cross_origin()
def postSettings():
    if not request.is_json:
        return jsonify({"msg": "Missing JSON in request"}), 400
    
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
    
    return request.json

@app.route('/settings/get', methods=['GET'])
@cross_origin()
def getSettings():

    currentSettings = AquaMaster.read_item("master", partition_key="AndrewPi")
    return currentSettings

