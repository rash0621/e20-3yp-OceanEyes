___
# OceanEyes
___

<img src ="https://github.com/wethmiranasinghe/e20-3yp-OceanEyes/blob/main/docs/images/impacts-of-plastic-in-the-ocean-on-sealife-Entangled_Turtle.jpg" width="256" height="144"/>  <img src ="https://github.com/wethmiranasinghe/e20-3yp-OceanEyes/blob/main/docs/images/Plastic_floating.png" width="256" height="144" align="centre"/>


## Introduction

The world is facing a serious marine pollution problem, with large amounts of garbage, especially plastic, polluting the seas. To address this issue, we came up with the idea of developing "OceanEyes", an innovative system designed to monitor and analyze sea pollution levels and sea state in real time. By combining various sensor inputs and data analytics, we aim to utilize specialized software to process and analyze the collected data. This approach enables the generation of actionable insights to protect marine ecosystems.

## Features
- **Pollution Detection** : The system enables the detection of plastic waste, polythene, and debris in the water, and it pinpoints the locations of these materials, delivering this information to the relevant authorities.
- **Sea State Monitoring** : The system is designed to detect and assess the sea state by utilizing an accelerometer, which gauges the conditions of the sea and determines whether it is calm or rough.
- **Autonomous Functionality** : Sensor triggered activation for pollution detection and identification without human intervention.
- **Data Accessibility** : Offers visual representations of locations of areas with pollutants via an intuitive software platform accessible to governments, researchers, and the public for better decision-making.
- **Environmental Impact** : Promotes awareness and accountability by sharing data with stakeholders and aids in developing targeted solutions to combat pollution.

## Solution Architecture
<img src ="https://github.com/rash0621/e20-3yp-OceanEyes/blob/e5a67b15b10a79d996e6bed1845ec4d0dfd57c56/docs/images/Solution_Architecture.png" width="512" height="288"/>

## Data and Control Flow
<img src ="https://github.com/rash0621/e20-3yp-OceanEyes/blob/a88913eed87fb4052ed805616fb23f6af447f5cc/docs/images/Data_Control_Flow.png" width="512" height="288"/>

## Technology Stack
- **ReactJs** : Implemented the frontend with javascript
- **Springboot** : Implemented the backend with java
- **Python** : Implemented the image processing model logic
- **AWS** : Remote hosting server
- **PM2** : Background application runner in AWS server
- **YOLOV5** : Image processing model that was trained and converted to a lighter weight .onnox model
- **Dataset** : https://universe.roboflow.com/abdelaadimkhriss/ocean-plastics-waste-detection-float-plastics/dataset/13


## The Final Product
<img src ="https://github.com/rash0621/e20-3yp-OceanEyes/blob/8506f86c2f10d33f5cdce216d6c3d32d2406f015/docs/images/OceanEyes.png" width="512" height="288"/>


## Team
-  E/20/316, Wethmi Ranasinghe, [e20316@eng.pdn.ac.lk](mailto:e20316@eng.pdn.ac.lk)
-  E/20/122, Rashmi Gunathilake, [e20122@eng.pdn.ac.lk](mailto:e20122@eng.pdn.ac.lk)
-  E/20/178, Dulanga Jayawardena, [e20178@eng.pdn.ac.lk](mailto:e20178@eng.pdn.ac.lk)
-  E/20/148, Kasundie Hewawasam, [e20148@engdn.ac.lk](mailto:e20148@eng.pdn.ac.lk)



