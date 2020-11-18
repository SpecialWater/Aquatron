from app.config import Config
from app import app
import sqlalchemy 
import pandas as pd
from passlib.hash import sha256_crypt

from flask import Flask, jsonify, request
from flask_cors import cross_origin
from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token,
    get_jwt_identity
)

jwt = JWTManager(app)


engine = sqlalchemy.create_engine("mssql+pyodbc:///?odbc_connect={}".format(Config.connString))

@app.route('/', methods=['GET'])
@jwt_required
@cross_origin()
def getExcelData():
    response = pd.read_sql("SELECT * FROM AndrewTable",
                            con=engine)
    response = response.to_json(orient="records")
    return response

# Provide a method to create access tokens. The create_access_token()
# function is used to actually generate the token, and you can return
# it to the caller however you choose.
@app.route('/login', methods=['POST', 'OPTIONS'])
@cross_origin()
def login():
    if not request.is_json:
        return jsonify({"msg": "Missing JSON in request"}), 400

    print(request.json)
    
    # Get username / password from request
    username = request.json.get('email', None)
    password = request.json.get('password', None)
    username = username.lower()
    
    print(username)
    print(password)
    
    if not username:
        return jsonify({"msg": "Missing username parameter"}), 400
    if not password:
        return jsonify({"msg": "Missing password parameter"}), 400
    
    # Pull all usernames / hash from hastable
    # Lazy but avoids possible sql injection and table will always be small
    userPass = pd.read_sql("SELECT * FROM AndrewTableTwo",
                            con=engine)
    UserPass = userPass[userPass['UserName'].str.contains(username)]
    UserPass = UserPass.reset_index(drop=True)
    
    # Get User / Hash value and verify
    if(len(UserPass.index) == 1):
        secretUser = UserPass["UserName"][0]
        secretHash = UserPass["HashValue"][0]
        verifyPass = sha256_crypt.verify(password, secretHash)
    else:
        return jsonify({"msg": "Bad username or password"}), 401

    
    if verifyPass == False:
        return jsonify({"msg": "Bad username or password"}), 401

    # Identity can be any data that is json serializable
    access_token = create_access_token(identity=username)
    return jsonify(access_token=access_token), 200