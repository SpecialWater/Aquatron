from datetime import datetime
import pytz
from azure.iot.hub import IoTHubRegistryManager
from app.config import Config


def getID():
    dt = datetime.now(pytz.timezone('Etc/UTC'))
    id = f'{dt:%Y}-{dt:%m}-{dt:%d}T{dt:%H}:{dt:%M}:{dt:%S}.0000000Z'

    return id


def getPartition():
    dt = datetime.now(pytz.timezone('Etc/UTC'))
    partition = f'{dt:%Y}-{dt:%m}-{dt:%d}T00:00:00.0000000Z'

    return partition


def send_C2D_message():
    conn_string = Config.IOTHUB_CONNECTION_STRING
    device_id = Config.IOTHUB_DEVICE_ID
    registry_manager = IoTHubRegistryManager(conn_string)
    data = "New Settings Saved!"

    registry_manager.send_c2d_message(
        device_id,
        data)
