from flask import Flask, request, jsonify, send_file, make_response
import onnxruntime as ort
import numpy as np
from PIL import Image, ImageDraw
import os
import io

app = Flask(__name__)

# Load ONNX model once
session = ort.InferenceSession("best.onnx", providers=["CPUExecutionProvider"])
labels = {
    0: "plastic",
    1: "beverage can",
    2: "plastic bottles",
    3: "plastic bags",
    4: "plastic wastes",
    5: "wood",
    6: "glass",
    7: "metal"
}

@app.route('/analyze', methods=['POST'])
def analyze():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image_file = request.files['image']
    image = Image.open(image_file.stream).convert('RGB')
    original_size = image.size

    # Preprocess
    image_resized = image.resize((640, 640))
    img_array = np.array(image_resized).astype(np.float32) / 255.0
    img_array = np.transpose(img_array, (2, 0, 1))  # HWC to CHW
    img_array = np.expand_dims(img_array, axis=0)

    # Run inference
    inputs = {session.get_inputs()[0].name: img_array}
    outputs = session.run(None, inputs)
    predictions = outputs[0][0]

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

    # Annotate original image
    draw = ImageDraw.Draw(image)
    for x1, y1, x2, y2, class_id in boxes:
        label = labels.get(class_id, "unknown")
        draw.rectangle([x1, y1, x2, y2], outline="green", width=2)
        draw.text((x1, y1 - 10), label, fill="green")

    class_names = [labels[c] for c in detected_classes if c in labels]
    isPollutant = bool(class_names)
    pollutantType = ",".join(set(class_names)) if isPollutant else None

    # Convert image to bytes
    img_io = io.BytesIO()
    image.save(img_io, 'JPEG')
    img_io.seek(0)

    # Return both JSON + image
    response = make_response(send_file(img_io, mimetype='image/jpeg',
                                   as_attachment=False,
                                   download_name='annotated.jpg'))
    response.headers["X-IsPollutant"] = str(isPollutant)
    response.headers["X-PollutantType"] = pollutantType if pollutantType else "None"
    return response

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
