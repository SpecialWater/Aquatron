from socketIO_client import SocketIO
import json

def on_aaa_response(args):
    print('on_aaa_response', args['data'])

socketIO = SocketIO('http://127.0.0.1', 5000)
socketIO.on('login response', on_aaa_response)
socketIO.emit('my broadcast event', json.dumps({'hello': 'world'}))


socketIO.wait()