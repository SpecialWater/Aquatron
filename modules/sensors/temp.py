# Copyright (c) Microsoft. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project root for
# full license information.

import time
import os
import sys
import threading
import datetime
import asyncio
import json
from dotenv import load_dotenv
from azure.iot.device.aio import IoTHubModuleClient
from w1thermsensor import W1ThermSensor


async def main():

    # load environent variables
    load_dotenv()

    try:

        # The client object is used to interact with your Azure IoT hub.
        # module_client = IoTHubModuleClient.create_from_edge_environment()
        # IoTHubModuleClient.create_from_edge_environment()
        conn_str = os.getenv("IOT_CONN_STRING")
        module_client = IoTHubModuleClient.create_from_connection_string(conn_str)

        # connect the client.
        await module_client.connect()

        # Connect Sensor
        while True:
            try:
                sensor = W1ThermSensor()
                print("Temperature Sensor active")
                break
            except:
                print("Temperature Sensor not yet active")
                pass

        data = {}
        data['temperature'] = 0
        tempOld = 0
        temp = ""

        # define behavior for receiving an input message on input1
        while True:
            try:
                data['temperature'] = sensor.get_temperature() * 9 / 5 + 32
                json_body = json.dumps(data)
                temp = json.loads(json_body)
                print(temp)
                asyncio.sleep(5)
            except:
                print("Temperature reading failed")
                asyncio.sleep(5)
            
            if temp != "" and tempOld != temp['temperature']:
                print(temp['temperature'])
                print("forwarding message to output1 at {0}".format(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")))
                tempOld=temp['temperature']
                await module_client.send_message_to_output(json_body, "output1")

    except Exception as e:
        print("Unexpected error %s " % e)
        raise

if __name__ == "__main__":
    asyncio.run(main())