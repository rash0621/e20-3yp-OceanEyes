import onnxruntime as ort
import numpy as np
from PIL import Image, ImageDraw
import os

# Load test image
img_path = "image copy.png"
image = Image.open(img_path).convert('RGB')
original_size = image.size  # Save original size (width, height)
image_resized = image.resize((640, 640))  # Resize for inference

# Preprocess
img_array = np.array(image_resized).astype(np.float32) / 255.0  # Normalize
img_array = np.transpose(img_array, (2, 0, 1))  # HWC to CHW
img_array = np.expand_dims(img_array, axis=0)  # Add batch dim

# Load ONNX model and run inference
session = ort.InferenceSession("best.onnx", providers=["CPUExecutionProvider"])
inputs = {session.get_inputs()[0].name: img_array}
outputs = session.run(None, inputs)

# Parse detections
predictions = outputs[0][0]  # Shape: (num_detections, 85)
conf_threshold = 0.25
detected_classes = []
boxes = []

for pred in predictions:
    conf = pred[4]
    if conf > conf_threshold:
        class_id = int(np.argmax(pred[5:]))
        score = pred[5:][class_id]
        if score > conf_threshold:
            cx, cy, w, h = pred[0], pred[1], pred[2], pred[3]
            x1 = int((cx - w / 2) * original_size[0] / 640)
            y1 = int((cy - h / 2) * original_size[1] / 640)
            x2 = int((cx + w / 2) * original_size[0] / 640)
            y2 = int((cy + h / 2) * original_size[1] / 640)
            boxes.append((x1, y1, x2, y2, class_id))
            detected_classes.append(class_id)

# Labels (edit this based on your trained classes)
labels = {
    0: "plastic",
    1: "beverage can",
    2: "plastic bottles",
    3: "plastic bags",
    4: "plastic wastes",
    5: "wood",
    6:"glass",
    7:"metal"
}
class_names = [labels[c] for c in detected_classes if c < len(labels)]

# Construct new filename
angle = 90
distance = 45
turnNumber = 1
isPollutant = bool(class_names)
pollutantType = ",".join(set(class_names)) if isPollutant else None

if isPollutant:
    new_name = f"{turnNumber}_{angle}deg_{distance}_True_{pollutantType}.jpg"
else:
    new_name = f"{turnNumber}_{angle}deg_{distance}_False.jpg"

# Draw bounding boxes on original image
draw = ImageDraw.Draw(image)
for x1, y1, x2, y2, class_id in boxes:
    label = labels[class_id] if class_id < len(labels) else "unknown"
    draw.rectangle([x1, y1, x2, y2], outline="green", width=2)
    draw.text((x1, y1 - 10), label, fill="green")

# Save annotated image
image.save(new_name)
print(f"Saved as: {new_name}")
