from temperature import Temperature
from power import Power

from dotenv import load_dotenv
import requests
import json
import os
from azure.iot.device.aio import IoTHubDeviceClient
import asyncio
import socketio
from datetime import datetime
import pytz
import time


class Main:
    load_dotenv()

    def __init__(self):
        self.URL = "http://192.168.179.121:5000"
        self.sio = socketio.Client()
        self.sio.connect(self.URL)
        # self.URL = "https://pruetpiflask.azurewebsites.net"
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

        self.time_delay_loop = 5
        self.time_delay_save = 60 * 5

    async def main(self):
        try:
            conn_str = os.getenv("IOT_CONN_STRING")
            self.device_client = IoTHubDeviceClient. \
                create_from_connection_string(conn_str)

            await self.device_client.connect()

            print("Connected to IoTHub")
        except Exception as e:
            print("Unexpected error %s " % e)
            raise

        self.get_settings()

        self.looper = asyncio.gather(
            self.set_timed_outlets(),
            self.set_heater_outlet(),
            self.emit_message(),
            self.save_state()
        )

        # set the mesage received handler on the client
        self.device_client.on_message_received = self.message_received_handler
        loop = asyncio.get_event_loop()
        user_finished = loop.run_in_executor(None, self.stdin_listener)

        # Wait for user to indicate they are done listening for messages
        await user_finished
        self.looper.cancel()

        # Finally, disconnect
        await self.device_client.disconnect()

    async def emit_message(self):
        while True:
            state = self.state
            state['id'] = self.get_ID()
            print('Current state: ', state)
            self.sio.emit('aquarium state', json.dumps([state]))
            await asyncio.sleep(self.time_delay_loop)

    async def save_state(self):
        while True:
            self.post_state()
            await asyncio.sleep(self.time_delay_save)

    async def set_heater_outlet(self):
        while True:
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

            await asyncio.sleep(self.time_delay_loop)

    # Check to see if outlet should be turned on or off
    # Applies to CO2, UV light and refugium light
    async def set_timed_outlets(self):
        while True:
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

            await asyncio.sleep(self.time_delay_loop)

    # define behavior for receiving a message
    # Calls cosmos to get updated settings due to a saved change
    async def message_received_handler(self, message):
        print(message.data)

        self.get_settings()
        self.post_state()

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

    def get_settings(self):
        headers = {"Authorization": "Bearer " + self.token["access_token"]}

        url = self.URL + "/settings/get"
        settings = requests.get(
            url=url,
            headers=headers
        )

        self.settings = json.loads(settings.text)
        print("Settings retrieved successfully")

    def post_state(self):
        headers = {
            "Authorization": "Bearer " + self.token["access_token"],
            'Content-Type': 'application/json'
        }

        url = self.URL + "/state/post"
        payload = json.dumps(self.state)

        requests.post(
            url=url,
            data=payload,
            headers=headers
        )

        print('State posted')

    def get_ID(self):
        dt = datetime.now(pytz.timezone('Etc/UTC'))
        id = f'{dt:%Y}-{dt:%m}-{dt:%d}T{dt:%H}:{dt:%M}:{dt:%S}.0000000Z'

        return id

    # define behavior for halting the application
    def stdin_listener(self):
        while True:
            selection = input("Press Q to quit\n")
            if selection == "Q" or selection == "q":
                print("Quitting...")
                break

            time.sleep(self.time_delay_loop)


if __name__ == "__main__":
    asyncio.run(Main().main())
