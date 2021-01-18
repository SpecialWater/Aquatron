from app import app, socketio

if __name__ == '__main__':
    # app.run(debug=True, host='0.0.0.0', port='5001')
    socketio.run(app, host='0.0.0.0', port='5000')