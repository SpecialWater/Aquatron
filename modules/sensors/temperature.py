import os
import datetime
import asyncio
import json
import time
# from dotenv import load_dotenv
from azure.iot.device.aio import IoTHubModuleClient
from w1thermsensor import W1ThermSensor


class Temperature:
    def __init__(self):
        # load_dotenv()

        while True:
                try:
                    self.sensor = W1ThermSensor()
                    print("Temperature Sensor active")
                    break
                except Exception:
                    print("Temperature Sensor not yet active")
                    time.sleep(1)

    def getTemperature(self):
        try:
            temperature = self.sensor.get_temperature() * 9 / 5 + 32
            return temperature
        except Exception:
            print("Temperature reading failed")


if __name__ == "__main__":
    temp_sensor = Temperature()
    temp_sensor.getTemperature()
