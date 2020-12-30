from datetime import datetime
import pytz
from azure.iot.hub import IoTHubRegistryManager
from app.config import Config

def getID():
    dt = datetime.now(pytz.timezone('US/Central'))
    id = f'{dt:%Y}{dt:%m}{dt:%d}{dt:%H}{dt:%M}{dt:%S}'
        
    return id

def getPartition():
    dt = datetime.now(pytz.timezone('US/Central'))
    partition = f'{dt:%Y}{dt:%m}{dt:%d}'
        
    return partition


def send_C2D_message():
    conn_string = Config.IOTHUB_CONNECTION_STRING
    device_id = Config.IOTHUB_DEVICE_ID
    registry_manager = IoTHubRegistryManager(conn_string)
    data = "New Settings Saved!"
    
    registry_manager.send_c2d_message(
        device_id,
        data)
