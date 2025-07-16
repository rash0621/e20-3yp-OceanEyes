# from flask import Flask, request
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
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient
import RPi.GPIO as GPIO
import logging


# Global variables
deviceName="TestDevice1"
running = False
instance_id = None
start_time = None
end_time = None
turnNumber = 0
timeBetweenCaptures = 30 #in seconds
captured_images = []

# ============================
# AWS IoT Configuration
# ============================
client_id = "RaspberryPi"  # Same as registered thing name
endpoint = "a1kvbsby5hify1-ats.iot.ap-south-1.amazonaws.com"  # From AWS IoT Core
root_ca = "/home/oceaneyes/Desktop/AWS_IOT/AmazonRootCA1.pem"
private_key = "/home/oceaneyes/Desktop/AWS_IOT/da05af81a4f1503c21a2171a2585008feafa7d1821e5f6534c57736bd0fdadfd-private.pem.key"
certificate = "/home/oceaneyes/Desktop/AWS_IOT/da05af81a4f1503c21a2171a2585008feafa7d1821e5f6534c57736bd0fdadfd-certificate.pem.crt"
publish_topic = "raspi/+/data"
subscribe_topic = "raspi/TestDevice1/+"

# Setup MQTT client and security certificates
mqtt_client = AWSIoTMQTTClient(client_id)
mqtt_client.configureEndpoint(endpoint, 8883)
mqtt_client.configureCredentials(root_ca, private_key, certificate)

# MQTT client configuration
mqtt_client.configureOfflinePublishQueueing(-1)  # Infinite offline queueing
mqtt_client.configureDrainingFrequency(2)  # Draining: 2 Hz
mqtt_client.configureConnectDisconnectTimeout(10)  # 10 sec
mqtt_client.configureMQTTOperationTimeout(5)  # 5 sec

# Connect to AWS IoT Core
#print("Connecting to AWS IoT...")
#mqtt_client.connect()
#print("Connected!")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def connect_mqtt_with_retry(mqtt_client, max_retries=5, delay=5):
    attempt = 0
    while attempt < max_retries or max_retries == -1:
        try:
            logger.info("Attempting to connect to AWS IoT Core (Attempt %d)...", attempt + 1)
            mqtt_client.connect()
            logger.info("Connected to AWS IoT Core!")
            return True
        except Exception as e:
            logger.error("Connection failed: %s", str(e))
            attempt += 1
            time.sleep(delay)
    logger.error("Failed to connect to AWS IoT Core after %d attempts", attempt)
    return False

if not connect_mqtt_with_retry(mqtt_client, max_retries=5, delay=5):
    logger.warning("Proceeding without MQTT connection or taking fallback action.")


# ============ MQTT Callback ============
def message_callback(client, userdata, message):
    print(f"Received message on topic {message.topic}: {message.payload}")
    topic_parts = message.topic.split('/')
    if len(topic_parts) >= 3:
        device_id = topic_parts[1]
        command_type = topic_parts[2]
        print(f"Device: {device_id}, Command: {command_type}")


    try:
        
        global running, turnNumber,instance_id, start_time, end_time, timeBetweenTurns,deviceName

        if device_id==deviceName:
                    
            data = json.loads(message.payload.decode('utf-8'))
            instance_id = data.get('instanceId')
            if not os.path.exists(instance_id):
                os.makedirs(instance_id)
            if command_type in ["start", "create"]:
                data["turnNumber"] = 1
                save_instance_to_file(data)
            
                if command_type == "start":
                    if not running:
                        running = True
                        setup_servo()
                        turnNumber = 1
                        start_time = data.get('startDateTime')    
                        end_time = data.get('endDateTime')   
                        timeBetweenTurns = data.get('timeBetweenTurns')

                        if not os.path.exists(instance_id):
                            os.makedirs(instance_id)

                        start_main_thread()
                        print("Instance started successfully")
                        # return {"status": "SUCCESS", "message":"Device started successfully"}, 200

                    else:
                        print("Error in starting an instance")
                        # return {"status": "FAIL","message":"An instance already running"}, 200
    
            elif command_type == "stop":
                if running:
                    running = False
                    clenup_servo()
                    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    update_instance_end_time(instance_id, now)
                    print("Device stopped successfully")
                    return {"status": "SUCCESS", "message":"Device stopped successfully"}, 200
                else:
                    print(f"Unknown command type: {command_type}")
                    return {"status": "FAIL", "message":"No instance to stop running"}, 200

    except Exception as e:
        print(f"Failed to process message: {e}")

mqtt_client.subscribe(subscribe_topic, 1, message_callback)
print(f"Subscribed to topic: {subscribe_topic}")

# app = Flask(__name__)


# ----------------- GPIO & Peripheral Setup -----------------

# Ultrasonic Sensor Pins
TRIG = 23
ECHO = 24
# Servo Motor Pin
SERVO_PIN = 18

GPIO.setmode(GPIO.BCM)
GPIO.setup(TRIG, GPIO.OUT)
GPIO.setup(ECHO, GPIO.IN)
# GPIO.setup(SERVO_PIN, GPIO.OUT)

# # Servo PWM
# pwm = GPIO.PWM(SERVO_PIN, 50)  # 50Hz
# pwm.start(0)
pwm = None


# Camera setup
camera = Picamera2()
camera.configure(camera.create_still_configuration(main = {"size": (640, 480)}))
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
    
# ----------------- Functions Involved with Local Storage -----------------

# save to a json file to store data about new instances
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

# update json file with end time
def update_instance_end_time(instance_id, new_end_time):
    path = "schedule_data.txt"
    if not os.path.exists(path):
        print("Schedule file does not exist.")
        return

    try:
        with open(path, "r") as file:
            schedule_list = json.load(file)
    except json.JSONDecodeError:
        print("Failed to decode schedule file.")
        return

    # Find and update the matching instance
    updated = False
    for entry in schedule_list:
        if entry.get("instanceId") == instance_id:
            entry["endDateTime"] = new_end_time
            updated = True
            break

    if updated:
        with open(path, "w") as file:
            json.dump(schedule_list, file, indent=2)
        print(f"Updated end time for instance {instance_id}")
    else:
        print(f"No instance found with ID: {instance_id}")

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
    filepath = "schedule_data.txt"

    # Check if file exists and is not empty
    if not os.path.isfile(filepath) or os.path.getsize(filepath) == 0:
        print("Schedule file is missing or empty.")
        return None

    try:
        with open(filepath, "r") as file:
            schedule_list = json.load(file)

        if not schedule_list:
            print("Schedule file is empty or invalid format.")
            return None

        now = datetime.now()

        for entry in schedule_list:
            start = datetime.fromisoformat(entry['startDateTime'])
            end = datetime.fromisoformat(entry['endDateTime'])

            if start <= now <= end:
                return entry

        print("No valid schedule found for current time.")
        return None

    except (json.JSONDecodeError, KeyError, ValueError) as e:
        print("Schedule file read/parsing error:", e)
        return None

# ----------------- Sleep the device for 1 hour when no instance is running -----------------

def sleep_until_next_instance_start():
    #now = datetime.now()
    #next_hour = (now + timedelta(hours=1)).replace(minute=0, second=0, microsecond=0)
    #sleep_seconds = (next_hour - now).total_seconds()
    #print(f"Sleeping for {int(sleep_seconds)} seconds until {next_hour.strftime('%H:%M:%S')}")
    time.sleep(30)

# ----------------- As a Thread, sleep the device for 1 hour when no instance is running -----------------

def background_scheduler():
    global instance_id,start_time,end_time,timeBetweenTurns,running,turnNumber
    while not running:
        stored_valid_data = load_valid_instance()
        # if an instance is supposed to run
        if stored_valid_data:
            instance_id = stored_valid_data['instanceId']
            start_time = stored_valid_data['startDateTime']
            end_time = stored_valid_data['endDateTime']
            timeBetweenTurns = stored_valid_data['timeBetweenTurns']
            running = True
            setup_servo()
            turnNumber = stored_valid_data['turnNumber']
            start_main_thread()
        # if no instance is set to run at the moment
        sleep_until_next_instance_start()

# ----------------- Sensor Functions -----------------

# get gps locations via gps module
def get_gps_location(timeout=10):
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            line = gps_serial.readline().decode('ascii', errors='replace').strip()
            if any(line.startswith(prefix) for prefix in ('$GNRMC', '$GPRMC')):
                msg = pynmea2.parse(line)
                if hasattr(msg, 'latitude') and hasattr(msg, 'longitude'):
                    if msg.latitude != 0.0 and msg.longitude != 0.0:
                        return (msg.latitude, msg.longitude)
        except pynmea2.ParseError:
            continue
    return None  # Timeout or invalid GPS data

# get gps location via python library
def get_fallback_location():
    try:
        response = requests.get("https://ipinfo.io/json")
        data = response.json()
        if 'loc' in data:
            lat, lon = map(float, data['loc'].split(','))
            return (lat, lon)
    except Exception as e:
        print(f"Fallback location failed: {e}")
    return None                               

# get location via 2 methods
def get_location():
    gps_loc = get_gps_location()
    if gps_loc:
        print("GPS location found:", gps_loc)
        return gps_loc
    else:
        print("GPS failed. Falling back to IP-based location...")
        fallback_loc = get_fallback_location()
        # if fallback_loc:
        #     print("Fallback location:", fallback_loc)
        return (7.2544868, 80.5915993)
            # return fallback_loc
        # else:
        #     print("Failed to get any location.")
        #     return (7.2544868, 80.5915993) #fallback default option
            # return None

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
    global pwm
    if pwm is not None:
        try:
            duty = (angle / 18) + 2.5
            pwm.ChangeDutyCycle(duty)
            time.sleep(1)
        except Exception as e:
            print(f"Error setting servo angle: {e}")
    else:
        print("PWM not initialized. Cannot set angle.")



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


def send_turn_data_to_backend(instance_id,dateTime, gps_lat, gps_lon,images_copy):
    url = "http://65.2.109.89/api/v1/turn/save"

    date_str = dateTime.strftime("%Y-%m-%d")
    time_str = dateTime.strftime("%H:%M:%S")

    files = []
    for path in images_copy:
        print("path", path)
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
        print(data)
        response = requests.post(url, data=data, files=files)
        print("Response status:", response.status_code)
        print("Response data:", response.json())
    except Exception as e:
        print("Error sending data:", e)
    # finally:
    #     captured_images.clear()

def send_turn_data_in_thread(instance_id, dateTime, gps_lat, gps_lon,images_copy):
    thread = threading.Thread(
        target=send_turn_data_to_backend,
        args=(instance_id, dateTime, gps_lat, gps_lon, images_copy)
    )
    thread.start()

# ----------------- Run the Instance ------------------

def runInstance():
    global running,timeBetweenTurns,instance_id,end_time
    direction = "forward"
    try:
        while running:
            angles = [0, 90, 180] if direction == "forward" else [180, 90, 0]
            turnDateTime = datetime.now()
            gps_lat, gps_lon = get_location()
            for angle in angles:
                if not running:
                    break
                set_angle(angle)
                dist = get_distance()
                if 23 < dist < 400: #TODO: Distance detected by the ultrasonic
                    log_status(angle, distance=dist)
                else:
                    log_status(angle)
                time.sleep(2)  # small delay between checks

            if running:
                global turnNumber
                turnNumber+=1
                images_copy = captured_images.copy()  # Make a copy
                captured_images.clear()
                send_turn_data_in_thread(instance_id,turnDateTime, gps_lat, gps_lon,images_copy)
                
      
                if end_time:
                    end = datetime.fromisoformat(end_time)
                    datetime.now() >= end
                    print("End time reached after turn. Stopping.")
                    running = False
                    clenup_servo()
                    break

                print("Waiting before reversing direction...\n")
                time.sleep(timeBetweenTurns)
                # Toggle direction
                direction = "backward" if direction == "forward" else "forward"


    except KeyboardInterrupt:
        print("\nInterrupted. Cleaning up...")

# ----------------- Run the Instance as a Thread ------------------

def start_main_thread():
    thread = threading.Thread(target=runInstance)
    thread.daemon = True
    thread.start()

def start_scheduler_thread():
    thread = threading.Thread(target=background_scheduler, daemon=True)
    thread.start()

def cleanup():
    global pwm
    pwm.stop()
    GPIO.cleanup()
    gps_serial.close()
    camera.stop()
    print("Cleanup complete.")

def clenup_servo():
    global pwm
    try:
        if pwm is not None:
            pwm.ChangeDutyCycle(0)  # Set to neutral position
            time.sleep(0.5)  # Give time for servo to move to neutral
            pwm.stop()
            pwm = None
        
        # Clean up the specific pin
        GPIO.cleanup(SERVO_PIN)
        print("Servo cleaned up successfully")
    except Exception as e:
        print(f"Error during servo cleanup: {e}")

def setup_servo():
    global pwm
    try:
        # Add a small delay to ensure GPIO is ready
        time.sleep(1)
        
        # Set GPIO mode again to ensure it's properly initialized
        GPIO.setmode(GPIO.BCM)
        
        # Setup the servo pin
        GPIO.setup(SERVO_PIN, GPIO.OUT)
        
        # Create new PWM instance
        pwm = GPIO.PWM(SERVO_PIN, 50)  # 50Hz
        pwm.start(0)
        
        # Set to neutral position (90 degrees)
        time.sleep(0.5)
        
        print("Servo setup completed successfully")
    except Exception as e:
        print(f"Error during servo setup: {e}")

# ============================
#       MAIN FUNCTION
# ============================
if __name__ == "__main__":
    # Start the background scheduler ONCE
    start_scheduler_thread()

    # Main thread just waits for MQTT messages
    try:
        while True:
            time.sleep(1)  # Keep the main thread alive
    except KeyboardInterrupt:
        print("Exiting...")
        cleanup()

