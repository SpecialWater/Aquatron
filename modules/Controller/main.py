from temperature import Temperature
from power import Power

from dotenv import load_dotenv
import requests
import json
import os
from azure.iot.device.aio import IoTHubDeviceClient
import asyncio
from datetime import datetime
import pytz
import time


class Main:
    load_dotenv()

    def __init__(self):
        # self.URL = "http://192.168.179.227:5001"
        self.URL = "https://pruetpiflask.azurewebsites.net"
        self.token = self.login()
        self.temp_sensor = Temperature()
        self.outlets = Power()
        self.tz = pytz.timezone('US/Central')

        # default state
        self.state = {
            "Temperature": 0,
            "pH": 0,
            "Light_UV_On": True,
            "Light_Refugium_On": True,
            "GasInjection_On": True,
            "Heater_On": True,
            "Pump_Power": 3
        }

        asyncio.run(self.main())

    async def main(self):
        await asyncio.gather(
            self.iot_hub_login(),
            self.get_settings()
        )

        # set the mesage received handler on the client
        self.device_client.on_message_received = self.message_received_handler
        loop = asyncio.get_running_loop()
        user_finished = loop.run_in_executor(None, self.stdin_listener)

        # Wait for user to indicate they are done listening for messages
        await user_finished

        # Finally, disconnect
        await self.device_client.disconnect()

    def set_heater_outlet(self):
        if not self.settings["Heater"]["Enabled"]:
            self.outlets.power_off("Heater")
            print("Heater is disabled")
        else:
            min_temp = self.settings["Heater"]["MinTemp"]
            max_temp = self.settings["Heater"]["MaxTemp"]
            current_temp = self.temp_sensor.getTemperature()
            turn_on = True

            if min_temp > current_temp:
                turn_on = True
            elif current_temp > max_temp:
                turn_on = False

            if turn_on:
                self.outlets.power_on("Heater")
            else:
                self.outlets.power_off("Heater")

            print("Temp: {}, Heater On: {}".format(current_temp, turn_on))
            self.state["Heater_On"] = turn_on
            self.state["Temperature"] = current_temp

    def set_timed_outlets(self):
        current_time = datetime.now(self.tz)
        timed_outlets = ["GasInjection", "Light_Refugium", "Light_UV"]

        for outlet in timed_outlets:
            if not self.settings[outlet]["Enabled"]:
                self.outlets.power_off(outlet)
                print("{} is disabled".format(outlet))
            else:
                time_on = self.settings[outlet]["TimeOn"]
                timer = self.settings[outlet]["Timer"]

                turn_on = self.check_timer(current_time, time_on, timer)

                if turn_on:
                    self.outlets.power_on(outlet)
                else:
                    self.outlets.power_off(outlet)

                print("{} turned on: {}".format(outlet, turn_on))
                self.state[outlet + "_On"] = turn_on

    # Check to see if outlet should be turned on or off
    # Applies to CO2, UV light and refugium light
    def check_timer(self, current_time, time_on, timer):
        h_now, m_now = [current_time.hour, current_time.minute]
        h_setting, m_setting = [int(t) for t in time_on.split(":")]
        h_timer, m_timer = [int(t) for t in timer.split(":")]

        minutes_now = h_now * 60 + m_now
        minutes_start = h_setting * 60 + m_setting
        minutes_timer = h_timer * 60 + m_timer
        minutes_end = minutes_start + minutes_timer

        if minutes_start <= minutes_now <= minutes_end:
            return True
        elif (minutes_end >= 1440) and (minutes_now <= minutes_end - 1440):
            return True
        else:
            return False

    def login(self):
        headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
        flask_login = json.dumps({
            "username": os.getenv("FLASK_USERNAME"),
            "password": os.getenv("FLASK_PASSWORD")
        })

        url = self.URL + "/login"
        token = json.loads(requests.post(
            url=url,
            data=flask_login,
            headers=headers
        ).text)

        print("Logged in successfully")

        return token

    async def get_settings(self):
        headers = {"Authorization": "Bearer " + self.token["access_token"]}

        url = self.URL + "/settings/get"
        settings = requests.get(
            url=url,
            headers=headers
        )

        self.settings = json.loads(settings.text)
        print("Settings retrieved successfully")

        self.set_timed_outlets()
        self.set_heater_outlet()

    async def iot_hub_login(self):
        try:
            # The client object is used to interact with your Azure IoT hub.
            # module_client = IoTHubModuleClient.create_from_edge_environment()
            # IoTHubModuleClient.create_from_edge_environment()
            conn_str = os.getenv("IOT_CONN_STRING")
            self.device_client = IoTHubDeviceClient. \
                create_from_connection_string(conn_str)

            # connect the client.
            await self.device_client.connect()
            print("Connected to IoTHub")
        except Exception as e:
            print("Unexpected error %s " % e)
            raise

    # define behavior for receiving a message
    # Calls cosmos to get updated settings due to a saved change
    async def message_received_handler(self, message):
        print("the data in the message received was ")
        print(message.data)

        await asyncio.gather(
            self.get_settings()
        )

        self.post_state()

    def post_state(self):
        headers = {
            "Authorization": "Bearer " + self.token["access_token"],
            'Content-Type': 'application/json'
        }

        url = self.URL + "/state/post"
        payload = json.dumps(self.state)

        settings = requests.post(
            url=url,
            data=payload,
            headers=headers
        )

    # define behavior for halting the application
    def stdin_listener(self):
        while True:
            self.set_timed_outlets()
            self.set_heater_outlet()
            self.post_state()
            print(self.state, datetime.now())
            time.sleep(60)


if __name__ == "__main__":
    Main()
