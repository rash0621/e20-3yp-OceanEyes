from flask import Flask, request
import requests

import RPi.GPIO as GPIO
import time
from datetime import datetime
from picamera2 import Picamera2
import serial
import pynmea2
import os

app = Flask(__name__)


# ----------------- GPIO & Peripheral Setup -----------------
# Ultrasonic Sensor Pins
TRIG = 23
ECHO = 24

# Servo Motor Pin
SERVO_PIN = 18



GPIO.setmode(GPIO.BCM)
GPIO.setup(TRIG, GPIO.OUT)
GPIO.setup(ECHO, GPIO.IN)
GPIO.setup(SERVO_PIN, GPIO.OUT)

# Servo PWM
pwm = GPIO.PWM(SERVO_PIN, 50)  # 50Hz
pwm.start(0)

# Camera setup
camera = Picamera2()
camera.configure(camera.create_still_configuration())
camera.start()
time.sleep(2)  # Allow camera to warm up

# ----------------- GPS Setup -----------------
gps_port = "/dev/serial0"
baudrate = 9600
gps_serial = None


try:
    gps_serial = serial.Serial(gps_port, baudrate, timeout=1)
    print("Connected to GPS module.\n")
except serial.SerialException as e:
    print(f"GPS Serial Error: {e}")
    exit(1)
    
# Global running flag
running = False
instance_id = "4efggdsa"
start_time = None
end_time = None
turnNumber = 0
timeBetweenCaptures = 30 #in hours hours

captured_images = []

# ----------------- Helper Functions -----------------

def get_gps_location():
    while True:
        try:
            line = gps_serial.readline().decode('ascii', errors='replace').strip()
            if any(line.startswith(prefix) for prefix in ('$GNRMC', '$GPRMC')):
                msg = pynmea2.parse(line)
                if hasattr(msg, 'latitude') and hasattr(msg, 'longitude'):
                    return (msg.latitude, msg.longitude)
        except pynmea2.ParseError:
            continue
# ----------------- Helper Functions -----------------
def get_distance():
    GPIO.output(TRIG, False)
    time.sleep(0.1)

    GPIO.output(TRIG, True)
    time.sleep(0.00001)
    GPIO.output(TRIG, False)

    pulse_start = time.time()
    timeout = pulse_start + 0.04
    while GPIO.input(ECHO) == 0 and time.time() < timeout:
        pulse_start = time.time()

    pulse_end = time.time()
    timeout = pulse_end + 0.04
    while GPIO.input(ECHO) == 1 and time.time() < timeout:
        pulse_end = time.time()

    pulse_duration = pulse_end - pulse_start

    distance = pulse_duration * 17150
    return round(distance, 2)

def set_angle(angle):
    duty = (angle / 18) + 2.5
    pwm.ChangeDutyCycle(duty)
    time.sleep(1)

def log_status(angle, distance=None):
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    # lat, lon = get_gps_location()
    if distance is not None:
        global instance_id
        img_name = f"{turnNumber}_{angle}deg_{distance}.jpg"
        if not os.path.exists(instance_id):
            os.makedirs(instance_id)
        img_path = os.path.join(instance_id, img_name)  # saved in instance id folder
        camera.capture_file(img_path)
        captured_images.append(img_path)
        print(f"Image Saved: {img_name}")
        print(f"Object Detected | Distance: {distance} cm | Angle: {angle}° | Time: {now}")
    else:
        print(f"No object detected | Angle: {angle}° | Time: {now}")
    # print(f"Location: Latitude={lat}, Longitude={lon}")
    print("-" * 50)

def send_turn_data_to_backend(instance_id,dateTime, gps_lat, gps_lon):
    url = "http://<your-spring-backend-url>/api/turn/save"

    date_str = dateTime.strftime("%Y-%m-%d")
    time_str = dateTime.strftime("%H:%M:%S")

    files = []
    global captured_images
    for path in captured_images:
        file_tuple = ('capturedImages', (os.path.basename(path), open(path, 'rb'), 'image/jpeg'))
        files.append(file_tuple)

    # Form data payload
    data = {
        'instanceId': instance_id,
        'date': date_str,
        'time': time_str,
        'gpsLocationLatitude': gps_lat,
        'gpsLocationLongitude': gps_lon
    }

    try:
        response = requests.post(url, data=data, files=files)
        print("Response status:", response.status_code)
        print("Response data:", response.json())
    except Exception as e:
        print("Error sending data:", e)

def cleanup():
    pwm.stop()
    GPIO.cleanup()
    gps_serial.close()
    print("Cleanup complete.")

def mainFunction():
    # ----------------- Main Execution -----------------
    global running,timeBetweenCaptures,instance_id
    direction = "forward"
    try:
        while running:
            angles = [0, 90, 180] if direction == "forward" else [180, 90, 0]
            turnDateTime = datetime.now()
            gps_lat, gps_lon = get_gps_location()
            for angle in angles:
                if not running:
                    break
                set_angle(angle)
                dist = get_distance()
                if dist < 400:
                    log_status(angle, distance=dist)
                else:
                    log_status(angle)
                time.sleep(2)  # small delay between checks

            if running:
                global turnNumber
                turnNumber+=1

                send_turn_data_to_backend(instance_id,turnDateTime, gps_lat, gps_lon)
                captured_images.clear()
                print("Waiting 30 seconds before reversing direction...\n")
                time.sleep(timeBetweenCaptures)
                # Toggle direction
                direction = "backward" if direction == "forward" else "forward"


    except KeyboardInterrupt:
        print("\nInterrupted. Cleaning up...")

    finally:
        cleanup()



# ----------------- Flask Routes -----------------
@app.route('/start-device', methods=['POST'])
def start_device():
    global running, turnNumber,instance_id, start_time, end_time, timeBetweenCaptures

    data = request.get_json()
    instance_id = data.get('instanceId')
    start_time = data.get('startDateTime')    
    end_time = data.get('endDateTime')   
    timeBetweenCaptures = data.get('timeBetweenCaptures')   
    
    if not running:
        running = True
        turnNumber = 1
        mainFunction()
        return {"status": "SUCCESS"}, 200
    else:
        return {"status": "FAIL"}, 200

@app.route('/stop-device', methods=['POST'])
def stop_device():
    global running
    if running:
        running = False
        cleanup()
        return {"status": "SUCCESS"}, 200
    else:
        return {"status": "FAIL"}, 200

# ----------------- Run Server -----------------
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
