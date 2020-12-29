from azure.iot.hub import IoTHubRegistryManager
from app.config import Config

class Iot:
    def __init__(self):
        self.conn_string = Config.IOTHUB_CONNECTION_STRING
        self.device_id = Config.IOTHUB_DEVICE_ID
        self.registry_manager = IoTHubRegistryManager(self.conn_string)
        
    def send_C2D_message(self):
        
        data = "New Settings Saved!"
        
        self.registry_manager.send_c2d_message(
            self.device_id,
            data)