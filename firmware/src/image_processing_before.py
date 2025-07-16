importing image processing model
        model = torch.hub.load('ultralytics/yolov5', 'custom', path='yolov5/best.pt')
        model.conf = 0.25
        # Run YOLOv5 inference
        results = model(temp_img_path)
        labels = results.names
        detected_classes = results.pred[0][:, -1].tolist()
        class_names = [labels[int(cls)] for cls in detected_classes]

        isPollutant = bool(class_names)
        pollutantType = ','.join(set(class_names)) if isPollutant else None

        # Construct final name
        if isPollutant:
            img_name = f"{turnNumber}_{angle}deg_{distance}_True_{pollutantType}.jpg"
        else:
            img_name = f"{turnNumber}_{angle}deg_{distance}_False.jpg"