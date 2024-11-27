# ISOGRAMS - Custom Dashboard and Buttons

Welcome to ISOGRAMS, a custom dashboard interface for Home Assistant designed to be simple, intuitive, and free from information overload.

## Overview

After equipping my flat with smart technology, I developed this dashboard to streamline control and monitoring. It's optimized for landscape mode on a Lenovo Tab M8 with a dock station, utilizing the Kiosk app for continuous operation. While it functions in portrait mode, the layout may appear differently.

**Note:** The sidebar is a modified version of the [sidebar card by DBuit](https://github.com/DBuit/sidebar-card). Due to permission considerations, this modified sidebar isn't included in this repository.

## Themes

Two themes accompany the dashboard:

- **ISOGRAMS - Light**
  ![ISOGRAMS Light Theme](path_to_light_theme_screenshot.png)

- **ISOGRAMS - Dark**
  ![ISOGRAMS Dark Theme](path_to_dark_theme_screenshot.png)

*Screenshots are placeholders; please replace `path_to_light_theme_screenshot.png` and `path_to_dark_theme_screenshot.png` with actual image paths.*

## Components

The dashboard includes the following customizable components:

1. **Light Control Button**
2. **Lights Slider Card**
3. **Main Entrance Card**
4. **Rail Card**
5. **Ruler Card (Degrees)**
6. **Ruler Card (Percentage)**
7. **Temperature Slider Card**
8. **Welcome Entrance Card**

## Component Configurations

### 1. Light Control Button

**Purpose:** Quickly toggle a light entity on or off. Holding the button opens settings.

**Configuration:**
```yaml
type: custom:light-control-button
entity: light.your_light
icon: mdi:lightbulb
font_size: 20px
name: "Living Room Light"
```

**Options:**
- `entity`: The entity ID of the light.
- `icon`: Icon to display (default: `mdi:lightbulb`).
- `font_size`: Font size of the text (default: `20px`).
- `name`: Custom label for the button (default: entity’s friendly name).

### 2. Lights Slider Card

**Purpose:** Adjust brightness for multiple lights.

**Configuration:**
```yaml
type: custom:light-control-slider
entities:
  - light.light1
  - light.light2
label: "Living Room Lights"
font_size: 14px
font_style: normal
line_color: "#e9c344"
line_width: 2px
icon: mdi:lightbulb
```

**Options:**
- `entities`: List of light entities.
- `label`: Display label for the card.
- `font_size`, `font_style`: Adjust font styling.
- `line_color`, `line_width`: Customize slider appearance.
- `icon`: Icon to display.

### 3. Main Entrance Card

**Purpose:** Display temperature and humidity data in the entrance.

**Configuration:**
```yaml
type: custom:main-entrance-card
temperature: sensor.temperature_sensor
humidity: sensor.humidity_sensor
background_color: "#f5f5f5"
font_size: 14px
padding: 20px
height: 80px
```

**Options:**
- `temperature`, `humidity`: Sensor entities to display.
- `background_color`: Card’s background color.
- `font_size`, `padding`, `height`: Styling options.

### 4. Rail Card

**Purpose:** Display live train schedules using the [National Rail Integration](https://github.com/jfparis/homeassistant_nationalrail).

**Configuration:**
```yaml
type: custom:train-schedule-card
entity: sensor.train_departures
title: "Train Schedule"
icon: mdi:train
update_interval: 60000
```

**Options:**
- `entity`: The sensor created by the National Rail integration that provides train departure information (e.g., `sensor.train_departures`).
- `title`: Title for the card (default: "Train Schedule").
- `icon`: Icon to display (default: `mdi:train`).
- `update_interval`: Refresh interval in milliseconds (default: `60000`).

### 5. Ruler Card (Degrees)

**Purpose:** Adjustable slider for temperature or other values.

**Configuration:**
```yaml
type: custom:ruler-card
min: 0
max: 100
step: 5
font_size: 14px
```

**Options:**
- `min`, `max`, `step`: Slider range and step values.
- `font_size`: Font size of labels.

### 6. Ruler Card (Percentage)

**Purpose:** Display percentage-based values with a slider.

**Configuration:**
```yaml
type: custom:ruler-card-percentage
min: 0
max: 100
step: 10
font_size: 14px
```

**Options:**
- `min`, `max`, `step`: 
