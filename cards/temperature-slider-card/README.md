# ISOGRAMS Dashboard for Home Assistant

Welcome to **Temperature Slider Card**, a custom Home Assistant dashboard designed to simplify and enhance your smart home interface.

## Introduction

I’ve been a Home Assistant enthusiast for a while, and after equipping my flat with tech, I decided to build a dashboard tailored to my needs. The idea behind this dashboard is simplicity: easy to understand, functional, and free of information overload.  

The dashboard is designed to run on a **Lenovo Tab M8** in **landscape mode**, using the **Kiosk Browser** app for a seamless experience. While it works in portrait mode, the layout may occasionally appear misaligned.  

### Features
- **Custom Sidebar:** Based on a modified version of [DBuit’s Sidebar Card](https://github.com/DBuit/sidebar-card). *(Not included as I haven’t asked permission to share the modifications.)*
- **Two Themes:** A light and dark theme to complement the dashboard.
- **Eight Custom Cards:** Fully configurable and designed for intuitive interaction.


### ISOGRAMS Light Theme
![ISOGRAMS Light Theme](https://github.com/legocorp/ISOGRAMS/blob/main/img/ISOGRAMS-light.png)

### ISOGRAMS Dark Theme
 ![ISOGRAMS Dark Theme](https://github.com/legocorp/ISOGRAMS/blob/main/img/ISOGRAMS-dark.png)


### Download link:
https://github.com/legocorp/ISOGRAMS/blob/main/ISOGRAMS.zip


## Custom Cards

### 1. Light Control Button
![1. Light Control Button](https://github.com/legocorp/ISOGRAMS/blob/main/img/1_Light_Control_Button.png)

**Purpose:** Quickly toggle a light entity on/off. On hold, access settings.

```yaml
type: custom:light-control-button
entity: light.your_light
icon: mdi:lightbulb
font_size: 20px
name: "Living Room Light"
```

- **Options:**
  - `entity`: Light entity ID.
  - `icon`: Icon to display (default: `mdi:lightbulb`).
  - `font_size`: Font size of the text (default: `20px`).
  - `name`: Custom label (default: friendly name).



### 2. Lights Slider Card
![2. Lights Slider Card](https://github.com/legocorp/ISOGRAMS/blob/main/img/2_Lights_Slider_Card.png)

**Purpose:** Adjust brightness for multiple lights.

```yaml
type: custom:light-control-slider
entities:
  - light.light1
  - light.light2
label: "Living Room Lights"
font_size: 14px
line_color: "#e9c344"
line_width: 2px
icon: mdi:lightbulb
```

- **Options:**
  - `entities`: List of light entities.
  - `label`: Card label.
  - `font_size`, `line_color`, `line_width`: Styling options.
  - `icon`: Icon to display.



### 3. Main Entrance Card
![3. Main Entrance Card](https://github.com/legocorp/ISOGRAMS/blob/main/img/3_Main_Entrance_Card.png)

**Purpose:** Display temperature and humidity.

```yaml
type: custom:main-entrance-card
temperature: sensor.temperature_sensor
humidity: sensor.humidity_sensor
background_color: "#f5f5f5"
font_size: 14px
padding: 20px
height: 80px
```

- **Options:**
  - `temperature`, `humidity`: Sensor entities.
  - `background_color`, `font_size`, `padding`, `height`: Styling options.



### 4. Rail Card
![4. Rail Card](https://github.com/legocorp/ISOGRAMS/blob/main/img/4_Rail_Card.png)
**Purpose:** Display live train schedules using the [National Rail Integration](https://github.com/jfparis/homeassistant_nationalrail).

```yaml
type: custom:train-schedule-card
entity: sensor.train_departures
title: "Train Schedule"
icon: mdi:train
update_interval: 60000
```

- **Options:**
  - `entity`: Train schedule sensor.
  - `title`: Card title (default: "Train Schedule").
  - `icon`: Icon to display.
  - `update_interval`: Refresh interval in ms (default: `60000`).



### 5. Ruler Card (Degrees)
![5. Ruler Card (Degrees)](https://github.com/legocorp/ISOGRAMS/blob/main/img/5_Ruler_Card_Degrees.png)
**Purpose:** Adjustable slider for temperature or other values.

```yaml
type: custom:ruler-card
min: 0
max: 100
step: 5
font_size: 14px
```

- **Options:**
  - `min`, `max`, `step`: Slider range and step values.
  - `font_size`: Font size.



### 6. Ruler Card (Percentage)
![6. Ruler Card (Percentage)](https://github.com/legocorp/ISOGRAMS/blob/main/img/6_Ruler_Card_Percentage.png)

**Purpose:** Slider for percentage-based values.

```yaml
type: custom:ruler-card-percentage
min: 0
max: 100
step: 10
font_size: 14px
```

- **Options:**
  - `min`, `max`, `step`: Percentage range and step.
  - `font_size`: Font size.



### 7. Temperature Slider Card
![7. Temperature Slider Card](https://github.com/legocorp/ISOGRAMS/blob/main/img/7_Temperature_Slider_Card.png)

**Purpose:** Adjust thermostat temperature.

```yaml
type: custom:temperature-room-slider
entity: climate.thermostat
min: 15
max: 30
font_size: 14px
icon: mdi:thermometer
line_color: "#ad1d1d"
line_width: 2px
```

- **Options:**
  - `entity`: Thermostat entity.
  - `min`, `max`: Temperature range.
  - `font_size`, `icon`, `line_color`, `line_width`: Styling options.



### 8. Welcome Entrance Card
![8. Welcome Entrance Card](https://github.com/legocorp/ISOGRAMS/blob/main/img/8_Welcome_Entrance_Card.png)

**Purpose:** Display weather and welcome information (e.g., with the AccuWeather integration).

```yaml
type: custom:weather-info-card
weather: weather.your_location
background_color: "#ffffff"
font_size: 14px
padding: 20px
height: 80px
```

- **Options:**
  - `weather`: Weather entity.
  - `background_color`, `font_size`, `padding`, `height`: Styling options.

