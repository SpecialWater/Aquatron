import pigpio
import time

pi1 = pigpio.pi()       # pi1 accesses the local Pi's GPIO



pi1.write(26, 0) # set local Pi's GPIO 4 low

# hardware_PWM(GPIO#, frequency, duty cycle (x / 1,000,000))
# pi1.hardware_PWM(12, 500, 900000) # 800Hz 25% dutycycle

for l in range(0, 5):
    for i in range(0,1001):
        pi1.hardware_PWM(12, 500, 1000 * i)
        time.sleep(.001)
    for i in range(0, 1001):
        pi1.hardware_PWM(12, 500, (1000000 - (i * 1000)))
        time.sleep(.001)


print(pi1.get_PWM_frequency(12))