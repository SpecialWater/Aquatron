import pigpio
import time


class Power:
    def __init__(self):
        # accesses the local Pi's GPIO
        self.pi = pigpio.pi('raspberrypi', 8888)
        self.outlet = {
            "Light_UV": 5,
            "Light_Refugium": 6,
            "GasInjection": 16,
            "Heater": 17,
            "unused1": 24,
            "unused2": 25
        }

        self.start_up()

        print("Outlets ready")

    # Ensure everything starts out in fully "off" state
    def start_up(self):
        for outlet in self.outlet.keys():
            self.power_on(outlet)
            self.power_off(outlet)

    def power_on(self, device):
        self.pi.write(self.outlet[device], 0)

    def power_off(self, device):
        self.pi.write(self.outlet[device], 1)
