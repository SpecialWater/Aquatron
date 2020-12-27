import pigpio
import time

pi1 = pigpio.pi()       # pi1 accesses the local Pi's GPIO

gpioList = [5, 6, 16, 17, 24, 25]

for i in range(100):
    for relay in gpioList:
        time.sleep(.05)
        pi1.write(relay, 0)
        time.sleep(.05)
        pi1.write(relay, 1)
        time.sleep(.05)

pi1.write(17, 0)
pi1.write(6, 1)