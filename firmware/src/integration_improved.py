import os
import json
import time
import threading
from datetime import datetime, timedelta
import requests
import RPi.GPIO as GPIO
from picamera2 import Picamera2
import serial
import pynmea2
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient
import logging

# Thread-safe global state management
class DeviceState:
    def __init__(self):
        self._lock = threading.Lock()
        self._running = False
        self._instance_id = None
        self._start_time = None
        self._end_time = None
        self._turn_number = 0
        self._time_between_turns = 30
        self._current_thread = None
        self._captured_images = []
        
    def get_running(self):
        with self._lock:
            return self._running
    
    def set_running(self, value):
        with self._lock:
            self._running = value
    
    def get_instance_data(self):
        with self._lock:
            return {
                'instance_id': self._instance_id,
                'start_time': self._start_time,
                'end_time': self._end_time,
                'turn_number': self._turn_number,
                'time_between_turns': self._time_between_turns
            }
    
    def set_instance_data(self, instance_id, start_time, end_time, time_between_turns, turn_number=1):
        with self._lock:
            self._instance_id = instance_id
            self._start_time = start_time
            self._end_time = end_time
            self._time_between_turns = time_between_turns
            self._turn_number = turn_number
    
    def increment_turn(self):
        with self._lock:
            self._turn_number += 1
            return self._turn_number
    
    def get_captured_images(self):
        with self._lock:
            return self._captured_images.copy()
    
    def add_captured_image(self, image_path):
        with self._lock:
            self._captured_images.append(image_path)
    
    def clear_captured_images(self):
        with self._lock:
            self._captured_images.clear()
    
    def set_current_thread(self, thread):
        with self._lock:
            self._current_thread = thread
    
    def get_current_thread(self):
        with self._lock:
            return self._current_thread

# Global state instance
device_state = DeviceState()

# Configuration
deviceName = "TestDevice1"
timeBetweenCaptures = 30

# GPIO and sensor setup (your existing code)
TRIG = 23
ECHO = 24
SERVO_PIN = 18

GPIO.setmode(GPIO.BCM)
GPIO.setup(TRIG, GPIO.OUT)
GPIO.setup(ECHO, GPIO.IN)
GPIO.setup(SERVO_PIN, GPIO.OUT)

pwm = GPIO.PWM(SERVO_PIN, 50)
pwm.start(0)

# Camera setup
camera = Picamera2()
camera.configure(camera.create_still_configuration(main={"size": (640, 480)}))
camera.start()
time.sleep(2)

# GPS setup
gps_port = "/dev/serial0"
baudrate = 9600
try:
    gps_serial = serial.Serial(gps_port, baudrate, timeout=1)
    print("Connected to GPS module.")
except serial.SerialException as e:
    print(f"GPS Serial Error: {e}")
    gps_serial = None

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

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================
# MQTT Connection Management
# ============================

def connect_mqtt_with_retry(mqtt_client, max_retries=5, delay=5):
    """Connect to MQTT with retry logic"""
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
            if attempt < max_retries:
                logger.info("Retrying in %d seconds...", delay)
                time.sleep(delay)
    
    logger.error("Failed to connect to AWS IoT Core after %d attempts", attempt)
    return False

def subscribe_with_retry(mqtt_client, topic, qos, callback, max_retries=3):
    """Subscribe to MQTT topic with retry logic"""
    attempt = 0
    while attempt < max_retries:
        try:
            logger.info("Attempting to subscribe to topic: %s (Attempt %d)", topic, attempt + 1)
            mqtt_client.subscribe(topic, qos, callback)
            logger.info("Successfully subscribed to topic: %s", topic)
            return True
        except Exception as e:
            logger.error("Subscription failed: %s", str(e))
            attempt += 1
            if attempt < max_retries:
                time.sleep(2)
    
    logger.error("Failed to subscribe to topic after %d attempts", attempt)
    return False

def publish_with_retry(mqtt_client, topic, payload, qos=1, max_retries=3):
    """Publish to MQTT topic with retry logic"""
    attempt = 0
    while attempt < max_retries:
        try:
            logger.info("Attempting to publish to topic: %s (Attempt %d)", topic, attempt + 1)
            mqtt_client.publish(topic, payload, qos)
            logger.info("Successfully published to topic: %s", topic)
            return True
        except Exception as e:
            logger.error("Publish failed: %s", str(e))
            attempt += 1
            if attempt < max_retries:
                time.sleep(2)
    
    logger.error("Failed to publish to topic after %d attempts", attempt)
    return False

# Global MQTT connection state
mqtt_connected = False

class DeviceController:
    def __init__(self):
        self.scheduler_thread = None
        self.main_thread = None
        self.stop_event = threading.Event()
        
    def start_instance(self, instance_data):
        """Start a new instance with proper thread management"""
        if device_state.get_running():
            logger.warning("Instance already running")
            return False
        
        # Stop any existing threads
        self.stop_current_instance()
        
        # Set up new instance
        device_state.set_instance_data(
            instance_data['instanceId'],
            instance_data['startDateTime'],
            instance_data['endDateTime'],
            instance_data['timeBetweenTurns'],
            instance_data.get('turnNumber', 1)
        )
        
        device_state.set_running(True)
        
        # Create instance directory
        instance_id = instance_data['instanceId']
        if not os.path.exists(instance_id):
            os.makedirs(instance_id)
        
        # Start main instance thread
        self.main_thread = threading.Thread(target=self.run_instance, daemon=True)
        self.main_thread.start()
        device_state.set_current_thread(self.main_thread)
        
        logger.info(f"Instance {instance_id} started successfully")
        return True
    
    def stop_current_instance(self):
        """Stop the current running instance"""
        if not device_state.get_running():
            return False
        
        device_state.set_running(False)
        
        # Wait for current thread to finish (with timeout)
        current_thread = device_state.get_current_thread()
        if current_thread and current_thread.is_alive():
            current_thread.join(timeout=5)
            if current_thread.is_alive():
                logger.warning("Thread did not stop gracefully")
        
        # Update end time
        instance_data = device_state.get_instance_data()
        if instance_data['instance_id']:
            now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            update_instance_end_time(instance_data['instance_id'], now)
        
        logger.info("Instance stopped successfully")
        return True
    
    def run_instance(self):
        """Main instance execution loop"""
        direction = "forward"
        
        try:
            while device_state.get_running():
                instance_data = device_state.get_instance_data()
                
                # Check if end time reached
                if instance_data['end_time']:
                    end_time = datetime.fromisoformat(instance_data['end_time'])
                    if datetime.now() >= end_time:
                        logger.info("End time reached. Stopping instance.")
                        device_state.set_running(False)
                        break
                
                # Execute turn
                self.execute_turn(direction)
                
                if not device_state.get_running():
                    break
                
                # Send data and wait
                self.process_turn_data()
                
                # Wait between turns
                time.sleep(instance_data['time_between_turns'])
                
                # Toggle direction
                direction = "backward" if direction == "forward" else "forward"
                
        except Exception as e:
            logger.error(f"Error in instance execution: {e}")
        finally:
            device_state.set_running(False)
    
    def execute_turn(self, direction):
        """Execute a single turn with sensor readings"""
        angles = [0, 90, 180] if direction == "forward" else [180, 90, 0]
        
        for angle in angles:
            if not device_state.get_running():
                break
                
            set_angle(angle)
            dist = get_distance()
            
            if 23 < dist < 400:
                self.log_status(angle, distance=dist)
            else:
                self.log_status(angle)
            
            time.sleep(2)
    
    def log_status(self, angle, distance=None):
        """Log status and capture image if object detected"""
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        instance_data = device_state.get_instance_data()
        
        if distance is not None:
            img_name = f"{instance_data['turn_number']}_{angle}deg_{distance}_false.jpg"
            img_path = os.path.join(instance_data['instance_id'], img_name)
            
            try:
                camera.capture_file(img_path)
                device_state.add_captured_image(img_path)
                print(f"Image Saved: {img_name}")
                print(f"Object Detected | Distance: {distance} cm | Angle: {angle}° | Time: {now}")
            except Exception as e:
                logger.error(f"Error capturing image: {e}")
        else:
            print(f"No object detected | Angle: {angle}° | Time: {now}")
        
        print("-" * 50)
    
    def process_turn_data(self):
        """Process and send turn data"""
        instance_data = device_state.get_instance_data()
        images_copy = device_state.get_captured_images()
        device_state.clear_captured_images()
        
        if images_copy:  # Only send if there are images
            turn_date_time = datetime.now()
            gps_lat, gps_lon = get_location()
            
            # Send data to backend in background thread
            thread = threading.Thread(
                target=send_turn_data_to_backend,
                args=(instance_data['instance_id'], turn_date_time, gps_lat, gps_lon, images_copy),
                daemon=True
            )
            thread.start()
            
            # Also send summary to MQTT
            self.send_turn_summary_mqtt(instance_data, turn_date_time, gps_lat, gps_lon, len(images_copy))
        
        # Increment turn number
        device_state.increment_turn()
    
    def send_turn_summary_mqtt(self, instance_data, turn_date_time, gps_lat, gps_lon, image_count):
        """Send turn summary data via MQTT"""
        try:
            mqtt_topic = f"raspi/{deviceName}/turn_data"
            mqtt_payload = {
                "instanceId": instance_data['instance_id'],
                "turnNumber": instance_data['turn_number'],
                "timestamp": turn_date_time.isoformat(),
                "gpsLatitude": gps_lat,
                "gpsLongitude": gps_lon,
                "imageCount": image_count,
                "deviceId": deviceName
            }
            
            publish_with_retry(mqtt_client, mqtt_topic, json.dumps(mqtt_payload))
            logger.info("Turn summary sent via MQTT")
            
        except Exception as e:
            logger.error("Failed to send turn summary via MQTT: %s", str(e))
    
    def start_scheduler(self):
        """Start the background scheduler"""
        if self.scheduler_thread is None or not self.scheduler_thread.is_alive():
            self.stop_event.clear()
            self.scheduler_thread = threading.Thread(target=self.background_scheduler, daemon=True)
            self.scheduler_thread.start()
            logger.info("Background scheduler started")
    
    def background_scheduler(self):
        """Background scheduler to check for scheduled instances"""
        while not self.stop_event.is_set():
            try:
                if not device_state.get_running():
                    stored_valid_data = load_valid_instance()
                    if stored_valid_data:
                        self.start_instance(stored_valid_data)
                        continue
                
                # Sleep for 30 seconds before checking again
                self.stop_event.wait(30)
                
            except Exception as e:
                logger.error(f"Error in background scheduler: {e}")
                self.stop_event.wait(60)  # Wait longer on error
    
    def shutdown(self):
        """Graceful shutdown"""
        logger.info("Shutting down device controller...")
        
        self.stop_event.set()
        self.stop_current_instance()
        
        if self.scheduler_thread and self.scheduler_thread.is_alive():
            self.scheduler_thread.join(timeout=5)
        
        # Send offline status via MQTT
        try:
            offline_topic = f"raspi/{deviceName}/status"
            offline_payload = {
                "deviceId": deviceName,
                "status": "offline",
                "timestamp": datetime.now().isoformat()
            }
            publish_with_retry(mqtt_client, offline_topic, json.dumps(offline_payload))
            logger.info("Offline status sent via MQTT")
        except Exception as e:
            logger.error("Failed to send offline status: %s", str(e))

# Create global controller instance
controller = DeviceController()

# MQTT Callback with proper error handling
def message_callback(client, userdata, message):
    """
    Enhanced MQTT callback with comprehensive error handling
    """
    try:
        logger.info("Message received on topic: %s", message.topic)
        
        topic_parts = message.topic.split('/')
        if len(topic_parts) >= 3:
            device_id = topic_parts[1]
            command_type = topic_parts[2]
            
            logger.info("Device: %s, Command: %s", device_id, command_type)
            
            if device_id == deviceName:
                data = json.loads(message.payload.decode('utf-8'))
                
                if command_type in ["start", "create"]:
                    data["turnNumber"] = 1
                    save_instance_to_file(data)
                    
                    if command_type == "start":
                        success = controller.start_instance(data)
                        
                        # Send acknowledgment back to cloud
                        ack_topic = f"raspi/{deviceName}/ack"
                        ack_payload = {
                            "command": "start",
                            "status": "SUCCESS" if success else "FAILED",
                            "instanceId": data.get('instanceId'),
                            "timestamp": datetime.now().isoformat(),
                            "message": "Instance started successfully" if success else "Failed to start instance"
                        }
                        publish_with_retry(mqtt_client, ack_topic, json.dumps(ack_payload))
                        
                        if success:
                            logger.info("Instance started via MQTT")
                        else:
                            logger.error("Failed to start instance via MQTT")
                
                elif command_type == "stop":
                    success = controller.stop_current_instance()
                    
                    # Send acknowledgment back to cloud
                    ack_topic = f"raspi/{deviceName}/ack"
                    ack_payload = {
                        "command": "stop",
                        "status": "SUCCESS" if success else "FAILED",
                        "timestamp": datetime.now().isoformat(),
                        "message": "Instance stopped successfully" if success else "No instance to stop"
                    }
                    publish_with_retry(mqtt_client, ack_topic, json.dumps(ack_payload))
                    
                    if success:
                        logger.info("Instance stopped via MQTT")
                    else:
                        logger.error("No instance to stop")
                
                elif command_type == "status":
                    # Send device status
                    status_topic = f"raspi/{deviceName}/status"
                    instance_data = device_state.get_instance_data()
                    status_payload = {
                        "deviceId": deviceName,
                        "running": device_state.get_running(),
                        "instanceId": instance_data.get('instance_id'),
                        "turnNumber": instance_data.get('turn_number'),
                        "timestamp": datetime.now().isoformat()
                    }
                    publish_with_retry(mqtt_client, status_topic, json.dumps(status_payload))
                    
                else:
                    logger.warning("Unknown command type: %s", command_type)
            else:
                logger.info("Message not for this device (expected: %s, got: %s)", deviceName, device_id)
        else:
            logger.warning("Invalid topic format: %s", message.topic)
            
    except json.JSONDecodeError:
        logger.error("Invalid JSON payload in message")
    except Exception as e:
        logger.error("Error processing MQTT message: %s", str(e))

# Improved send_turn_data_to_backend with proper resource management
def send_turn_data_to_backend(instance_id, dateTime, gps_lat, gps_lon, images_copy):
    url = "http://65.2.109.89/api/v1/turn/save"
    
    date_str = dateTime.strftime("%Y-%m-%d")
    time_str = dateTime.strftime("%H:%M:%S")
    
    files = []
    try:
        # Prepare files
        for path in images_copy:
            if os.path.exists(path):
                files.append(('capturedImages', (os.path.basename(path), open(path, 'rb'), 'image/jpeg')))
        
        # Form data payload
        data = {
            'instanceId': instance_id,
            'date': date_str,
            'time': time_str,
            'gpsLocationLatitude': gps_lat,
            'gpsLocationLongitude': gps_lon
        }
        
        # Save to local JSON first
        save_turn_to_json(instance_id, data)
        
        # Send to backend
        response = requests.post(url, data=data, files=files, timeout=30)
        logger.info(f"Data sent successfully. Status: {response.status_code}")
        
    except requests.RequestException as e:
        logger.error(f"Error sending data to backend: {e}")
    except Exception as e:
        logger.error(f"Unexpected error in send_turn_data_to_backend: {e}")
    finally:
        # Ensure all files are closed
        for file_tuple in files:
            try:
                file_tuple[1][1].close()
            except:
                pass

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
        if fallback_loc:
            print("Fallback location:", fallback_loc)
            #return (7.2544868, 80.5915993)
            return fallback_loc
        else:
            print("Failed to get any location.")
            return (7.2544868, 80.5915993) #fallback default option
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
    duty = (angle / 18) + 2.5
    pwm.ChangeDutyCycle(duty)
    time.sleep(1)



def cleanup():
    """Enhanced cleanup with MQTT disconnection"""
    logger.info("Starting cleanup process...")
    
    # Shutdown controller
    controller.shutdown()
    
    # Disconnect MQTT
    try:
        if mqtt_connected:
            mqtt_client.disconnect()
            logger.info("MQTT disconnected")
    except Exception as e:
        logger.error("Error disconnecting MQTT: %s", str(e))
    
    # Cleanup hardware
    try:
        pwm.stop()
        GPIO.cleanup()
        logger.info("GPIO cleanup completed")
    except Exception as e:
        logger.error("Error cleaning up GPIO: %s", str(e))
    
    # Close GPS serial
    try:
        if gps_serial:
            gps_serial.close()
            logger.info("GPS serial closed")
    except Exception as e:
        logger.error("Error closing GPS serial: %s", str(e))
    
    # Stop camera
    try:
        camera.stop()
        logger.info("Camera stopped")
    except Exception as e:
        logger.error("Error stopping camera: %s", str(e))
    
    logger.info("Cleanup complete")

def setup_mqtt_and_subscribe():
    """Setup MQTT connection and subscription with retries"""
    global mqtt_connected
    
    # Connect to MQTT
    if not connect_mqtt_with_retry(mqtt_client, max_retries=5, delay=5):
        logger.error("Failed to connect to MQTT. Continuing without MQTT connection.")
        return False
    
    mqtt_connected = True
    
    # Subscribe to command topics
    if not subscribe_with_retry(mqtt_client, subscribe_topic, 1, message_callback):
        logger.error("Failed to subscribe to MQTT topics")
        return False
    
    # Send online status
    try:
        online_topic = f"raspi/{deviceName}/status"
        online_payload = {
            "deviceId": deviceName,
            "status": "online",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0"
        }
        publish_with_retry(mqtt_client, online_topic, json.dumps(online_payload))
        logger.info("Online status sent via MQTT")
    except Exception as e:
        logger.error("Failed to send online status: %s", str(e))
    
    return True

# Main execution
if __name__ == "__main__":
    try:
        logger.info("Starting Ocean Eyes Device...")
        
        # 1. Setup MQTT connection and subscription
        mqtt_success = setup_mqtt_and_subscribe()
        if not mqtt_success:
            logger.warning("MQTT setup failed, continuing with limited functionality")
        
        # 2. Start the background scheduler
        controller.start_scheduler()
        logger.info("Background scheduler started")
        
        # 3. Main thread keeps the program alive
        logger.info("Device ready. Waiting for commands...")
        while True:
            time.sleep(1)
            
            # Periodic health check (every 60 seconds)
            if int(time.time()) % 60 == 0:
                if mqtt_connected:
                    try:
                        health_topic = f"raspi/{deviceName}/health"
                        health_payload = {
                            "deviceId": deviceName,
                            "status": "healthy",
                            "running": device_state.get_running(),
                            "timestamp": datetime.now().isoformat()
                        }
                        publish_with_retry(mqtt_client, health_topic, json.dumps(health_payload))
                    except Exception as e:
                        logger.error("Failed to send health check: %s", str(e))
            
    except KeyboardInterrupt:
        logger.info("Keyboard interrupt received. Shutting down...")
    except Exception as e:
        logger.error("Unexpected error in main loop: %s", str(e))
    finally:
        cleanup()