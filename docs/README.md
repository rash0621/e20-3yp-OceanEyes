---
layout: home
permalink: index.html

# Please update this with your repository name and project title
repository-name: e20-3yp-OceanEyes
title: OceanEyes
---

[comment]: # "This is the standard layout for the project, but you can clean this and use your own template"

# OceanEyes 
## Autonomous Sea Pollution Detection & Sea State Monitoring System
---

<!-- Image (photo/drawing of the final hardware) should be here -->

<!-- This is a sample image, to show how to add images to your page. To learn more options, please refer [this](https://projects.ce.pdn.ac.lk/docs/faq/how-to-add-an-image/) -->

<!-- ![Sample Image](./images/sample.png) -->

## Team
-  E/20/316, Wethmi Ranasinghe, [e20316@eng.pdn.ac.lk](mailto:e20316@eng.pdn.ac.lk)
-  E/20/122, Rashmi Gunathilake, [e20122@eng.pdn.ac.lk](mailto:e20122@eng.pdn.ac.lk)
-  E/20/178, Dulanga Jayawardena, [e20178@eng.pdn.ac.lk](mailto:e20178@eng.pdn.ac.lk)
-  E/20/148, Kasundie Hewawasam, [e20148@engdn.ac.lk](mailto:e20148@eng.pdn.ac.lk)



#### Table of Contents
1. [Introduction](#introduction)
2. [Solution Architecture](#solution-architecture )
3. [Data Flow](#data-flow)
4. [Hardware & Software Designs](#hardware-and-software-designs)
5. [Testing](#testing)
6. [Detailed budget](#detailed-budget)
7. [Conclusion](#conclusion)
8. [Links](#links)

## Introduction
<iframe width="1000" height="500" 
    src="https://www.youtube.com/embed/sN_3vdVXVIc" 
    frameborder="0" allowfullscreen>
</iframe>

The world is facing a serious marine pollution problem, with large amounts of garbage, especially plastic, polluting the seas. To address this issue, we came up with the idea of developing "OceanEyes", an innovative system designed to monitor and analyze sea pollution levels and sea state in real time. By combining various sensor inputs and data analytics, we aim to utilize specialized software to process and analyze the collected data. This approach enables the generation of actionable insights to protect marine ecosystems.

## Features
- **Pollution Detection** : The system enables the detection of plastic waste, polythene, and debris in the water, and it pinpoints the locations of these materials, delivering this information to the relevant authorities.
- **Sea State Monitoring** : The system is designed to detect and assess the sea state by utilizing an accelerometer, which gauges the conditions of the sea and determines whether it is calm or rough.
- **Autonomous Navigation** : Operates independently using GPS and ultrasonic sensors to identify and avoid obstacles, enabling navigation through a given area without human intervention.
- **Data Accessibility** : Offers visual representations of locations of areas with pollutants via an intuitive software platform accessible to governments, researchers, and the public for better decision-making.
- **Environmental Impact** : Promotes awareness and accountability by sharing data with stakeholders and aids in developing targeted solutions to combat pollution.

  
## Solution Architecture

<img width="1348" alt="solution architecture" src="https://github.com/user-attachments/assets/b7d4c3c1-f0a9-4d8b-bea9-85a6759bd601" />


 The proposed solution architecture in figure shows a system, where input is detected from sensors and transmitted to a station located in an internet accessible area. Then the data is sent to the cloud, for processing and made accessible to users through a web application.
 
 The GPS coordinates of the target area to be surveyed is provided by the user. Using them the device autonomously navigates to each location. As it moves between these locations, an ultrasonic sensor module is used for obstacle detection. The module continuously scans the surroundings to identify potential barriers, ensuring safe navigation.
 
 Upon reaching a designated location, the ultrasonic sensor module rotates and scans for obstacles in the vicinity. If an obstacle is detected, the device captures an image of the area using its camera module. The GPS coordinates of the current location, the distance to the detected obstacle and the captured image are then transmitted to the data collection center using a LoRa transceiver.
 
 From the data collection center, the information is forwarded to the cloud for processing. In the cloud, image processing techniques are applied to analyze the captured images. The primary goal of this analysis is to determine whether the detected obstacle is a plastic item. The processed data, including identified plastics and their locations, is then presented to users through a website as a map with the identified plastics and their corresponding locations. This platform allows users to make decisions about marine pollution management.

## Data Flow

<img width="773" alt="dataflow" src="https://github.com/user-attachments/assets/003992cd-82a9-49e0-8c09-bf660745b9cc" />

<img width="623" alt="website content" src="https://github.com/user-attachments/assets/9e4d4333-ae27-45e7-8120-ea2b94d21194" />


## Hardware and Software Designs



Detailed designs with many sub-sections

## Testing

Testing done on hardware and software, detailed + summarized results

## Detailed budget


| Item          | Quantity  | Unit Cost (LKR)  | Total (LKR)  |
| ------------- |:---------:|:----------:|-------:|
| ESP32 Development Board   | 2 | 1950 | 3900 |
| ESP32 module with CAM    | 1 | 2160 | 2160 |
| GPS module   | 1         | 900 | 900 |
| Waterproof Ultrasound sensor   | 1 | 1760 | 1760 |
| Accelerometer   | 1 | 800 | 800 |
| Lora Transceiver   | 2 | 1500 | 3000 |
| Motor driver to control   | 1 | 490 | 490 |
| Wi-Fi Module    | 1 | 390 | 390 |
| Propeller | 2 | 900 | 1800 |
| Gear Motor | 2 | 1630 | 3260 |
| Servo Motor | 2 | 350 | 700 |
| Battery | 8 | 350 | 2800 |
| Charging Module | 2 | 60 | 120 |
| Regulator | 4 | 15 | 60 |
| Humidity Sensor | 1 | 1360 | 1360 |
| Outer casing for the self guided device | 1 | 5000 | 5000 |
| Total          |   |   | 28500  |

## Conclusion

 In summary, "OceanEyes" is an automated system designed to address marine pollution, which provides insights into the distribution and characteristics of floating plastics using real-time data analysis. 
 
 We believe "OceanEyes" has the potential to make a meaningful impact on preserving our oceans supporting efforts to address this critical environmental challenge. We look forward to collaborating with experts, and relevant authorities to refine this concept and bring it to life.

## Links

- [Project Repository](https://github.com/cepdnaclk/{{ page.repository-name }}){:target="_blank"}
- [Project Page](https://cepdnaclk.github.io/{{ page.repository-name}}){:target="_blank"}
- [Department of Computer Engineering](http://www.ce.pdn.ac.lk/)
- [University of Peradeniya](https://eng.pdn.ac.lk/)

[//]: # (Please refer this to learn more about Markdown syntax)
[//]: # (https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)
