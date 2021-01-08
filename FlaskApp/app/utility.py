import datetime
import pytz
from azure.iot.hub import IoTHubRegistryManager
from app.config import Config


def get_ID():
    dt = datetime.datetime.now(pytz.timezone('Etc/UTC'))
    id = f'{dt:%Y}-{dt:%m}-{dt:%d}T{dt:%H}:{dt:%M}:{dt:%S}.0000000Z'

    return id


def get_partition():
    dt = datetime.datetime.now(pytz.timezone('Etc/UTC'))
    partition = f'{dt:%Y}-{dt:%m}-{dt:%d}T00:00:00.0000000Z'

    return partition


def get_partition_yesterday():
    dt = datetime.datetime.now(pytz.timezone('Etc/UTC')) - \
        datetime.timedelta(days=1)
    partition = f'{dt:%Y}-{dt:%m}-{dt:%d}T00:00:00.0000000Z'

    return partition


def check_times(state_time, minutes):
    local_tz = pytz.timezone('Etc/UTC')

    current_time = datetime.datetime.now(pytz.timezone('Etc/UTC'))
    state_time = datetime.datetime.fromisoformat(state_time[:-2])
    state_time = state_time.replace(tzinfo=pytz.utc).astimezone(local_tz)

    if (state_time >
            (current_time - datetime.timedelta(minutes=int(minutes)))):
        return True
    else:
        return False


def send_C2D_message():
    conn_string = Config.IOTHUB_CONNECTION_STRING
    device_id = Config.IOTHUB_DEVICE_ID
    registry_manager = IoTHubRegistryManager(conn_string)
    data = "New Settings Saved!"

    registry_manager.send_c2d_message(
        device_id,
        data)
