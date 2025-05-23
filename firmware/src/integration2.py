from flask import Flask, request
import os
import json
import time
from datetime import datetime,timedelta
import requests
import RPi.GPIO as GPIO
from picamera2 import Picamera2
import serial
import pynmea2
import threading

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
    

captured_images = []


# ----------------- Functions Involved with Local Storage -----------------

# save to a json file to store persistant data about instances
def save_instance_to_file(data):
    path = "schedule_data.txt"
    schedule_list = []

    # Load existing data if file exists
    if os.path.exists(path):
        try:
            with open(path, "r") as file:
                schedule_list = json.load(file)
        except json.JSONDecodeError:
            pass 

    # Add the new entry
    schedule_list.append(data)

    # Overwrite file with updated list
    with open(path, "w") as file:
        json.dump(schedule_list, file, indent=2)

# save to a json file to store persistant data about the turns of an instance
def save_turn_to_json(instance_id, turn_data):
    folder_path = instance_id
    file_path = os.path.join(folder_path, "turn_data.json")

    # Load existing data if file exists
    if os.path.exists(file_path):
        try:
            with open(file_path, "r") as f:
                data = json.load(f)
        except json.JSONDecodeError:
            data = {"instanceId": instance_id, "turns": []}
    else:
        data = {"instanceId": instance_id, "turns": []}

    # Append new turn data
    data["turns"].append(turn_data)

    # Save updated data back to file
    with open(file_path, "w") as f:
        json.dump(data, f, indent=2)
    print(f"Turn data saved to {file_path}")

# load the instance to be run at the moment
def load_valid_instance():
    try:
        with open("schedule_data.txt", "r") as file:
            schedule_list = json.load(file)

        now = datetime.now()

        for entry in schedule_list:
            start = datetime.fromisoformat(entry['startDateTime'])
            end = datetime.fromisoformat(entry['endDateTime'])
            if start <= now <= end:
                return entry

        return None

    except (FileNotFoundError, json.JSONDecodeError) as e:
        print("Schedule file read error:", e)
        return None

# ----------------- Sleep the device for 1 hour when no instance is running -----------------

def sleep_until_next_hour():
    now = datetime.now()
    next_hour = (now + timedelta(hours=1)).replace(minute=0, second=0, microsecond=0)
    sleep_seconds = (next_hour - now).total_seconds()
    print(f"Sleeping for {int(sleep_seconds)} seconds until {next_hour.strftime('%H:%M:%S')}")
    time.sleep(sleep_seconds)

# ----------------- As a Thread, sleep the device for 1 hour when no instance is running -----------------

def background_scheduler():
    global instance_id,start_time,end_time,timeBetweenTurns,running,turnNumber
    while True:
        sleep_until_next_hour()
        #TODO: check_schedule_and_run_instance()
        stored_valid_data = load_valid_instance()
        # if an instance is supposed to run
        if stored_valid_data:
            instance_id = stored_valid_data['instanceId']
            start_time = stored_valid_data['startDateTime']
            end_time = stored_valid_data['endDateTime']
            timeBetweenTurns = stored_valid_data['timeBetweenTurns']
            running = True
            turnNumber = stored_valid_data['turnNumber']



# ----------------- Sensor Functions -----------------

# get gps locations
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

# ----------------- Login Details ------------------

# Capture an image, log the status and save them as image files
def log_status(angle, distance=None):
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    # lat, lon = get_gps_location()
    if distance is not None:
        global instance_id
        img_name = f"{turnNumber}_{angle}deg_{distance}.jpg"
        
        img_path = os.path.join(instance_id, img_name)  # saved in instance id folder
        camera.capture_file(img_path)
        captured_images.append(img_path)
        print(f"Image Saved: {img_name}")
        print(f"Object Detected | Distance: {distance} cm | Angle: {angle}° | Time: {now}")
    else:
        print(f"No object detected | Angle: {angle}° | Time: {now}")
    print("-" * 50)

# ----------------- Sending Data Backend ------------------


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
        save_turn_to_json(instance_id, data)
        response = requests.post(url, data=data, files=files)
        print("Response status:", response.status_code)
        print("Response data:", response.json())
    except Exception as e:
        print("Error sending data:", e)

# TODO:
# def cleanup():
#     pwm.stop()
#     GPIO.cleanup()
#     gps_serial.close()
#     print("Cleanup complete.")


# ----------------- Run the Instance ------------------

def mainFunction():
    global running,timeBetweenTurns,instance_id
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
                time.sleep(timeBetweenTurns)
                # Toggle direction
                direction = "backward" if direction == "forward" else "forward"


    except KeyboardInterrupt:
        print("\nInterrupted. Cleaning up...")

    # finally:
    #     cleanup()

# ----------------- Run the Instance as a Thread ------------------

def start_main_thread():
    thread = threading.Thread(target=mainFunction)
    thread.daemon = True
    thread.start()

# TODO: Run the stop for 1 hour and check for valid instance


# TODO: On power reboot too, check for valid instance then start the 1 hour waits 

# TODO:
# threading.Thread(target=background_scheduler, daemon=True).start()


# to restart after a power off
stored_valid_data = load_valid_instance()
# if an instance is supposed to run
if stored_valid_data:
    instance_id = stored_valid_data['instanceId']
    start_time = stored_valid_data['startDateTime']
    end_time = stored_valid_data['endDateTime']
    timeBetweenTurns = stored_valid_data['timeBetweenTurns']
    running = True
    turnNumber = stored_valid_data['turnNumber'] 
    start_main_thread()
# else initiate to 
else:
    running = False
    instance_id = None
    start_time = None
    end_time = None
    turnNumber = 1
    timeBetweenTurns = 30 #TODO: CHANGE TO 2 HOURS


# ----------------- Flask Routes -----------------
@app.route('/create-instance', methods=['POST'])
def create_instance():
    global running, turnNumber,instance_id, start_time, end_time, timeBetweenTurns

    data = request.get_json()
    data["turnNumber"] = 1
#   save to json file
    save_instance_to_file(data)
    stored_valid_data = load_valid_instance()

    # # if an instance is supposed to run
    # if stored_valid_data:
    #     instance_id = stored_valid_data['instanceId']
    #     start_time = stored_valid_data['startDateTime']
    #     end_time = stored_valid_data['endDateTime']
    #     timeBetweenTurns = stored_valid_data['timeBetweenTurns']
    #     running = True
    #     turnNumber = 1
    #     if not os.path.exists(instance_id):
    #             os.makedirs(instance_id)

    #     if not running:
    #         running = True
    #         turnNumber = 1
    #         start_main_thread()
    #         return {"status": "SUCCESS", "message":"instance started successfully"}, 200
    #     else:
    #         return {"status": "FAIL","message":"instance already running,saved to file"}, 200
 
    
@app.route('/start-device', methods=['POST'])
def start_device():
    global running, turnNumber,instance_id, start_time, end_time, timeBetweenTurns

    data = request.get_json()
    data["turnNumber"] = 1
#   save to json file
    save_instance_to_file(data)

    instance_id = data.get('instanceId')
    start_time = data.get('startDateTime')    
    end_time = data.get('endDateTime')   
    timeBetweenTurns = data.get('timeBetweenTurns')

    if not os.path.exists(instance_id):
        os.makedirs(instance_id)

    if not running:
        running = True
        turnNumber = 1
        start_main_thread()
        return {"status": "SUCCESS", "message":"Device started successfully"}, 200
    else:
        return {"status": "FAIL","message":"An instance already running"}, 200


@app.route('/stop-device', methods=['POST'])
def stop_device():
    global running
    if running:
        running = False
        # cleanup()
        return {"status": "SUCCESS", "message":"Device stopped successfully"}, 200
    else:
        return {"status": "FAIL", "message":"No instance to stop running"}, 200

# ----------------- Run Server -----------------
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
