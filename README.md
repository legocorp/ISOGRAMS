ISOGRAMS Dashboard for Home Assistant
Welcome to ISOGRAMS, a custom Home Assistant dashboard designed to simplify and enhance your smart home interface.

Introduction
I’ve been a Home Assistant enthusiast for a while, and after equipping my flat with tech, I decided to build a dashboard tailored to my needs. The idea behind this dashboard is simplicity: easy to understand, functional, and free of information overload.

The dashboard is designed to run on a Lenovo Tab M8 in landscape mode, using the Kiosk Browser app for a seamless experience. While it works in portrait mode, the layout may occasionally appear misaligned.

Features
Custom Sidebar: Based on a modified version of DBuit’s Sidebar Card. (Not included as I haven’t obtained permission to share the modifications.)
Two Themes: A light and dark theme to complement the dashboard.
Eight Custom Cards: Fully configurable and designed for intuitive interaction.
Screenshots
ISOGRAMS Light Theme
(Insert light theme image here)

ISOGRAMS Dark Theme
(Insert dark theme image here once available)

Getting Started
Prerequisites
Home Assistant instance with Lovelace UI enabled.
A tablet or device for displaying the dashboard (e.g., Lenovo Tab M8).
Kiosk Browser app (optional, but recommended).
Installation
Download the Resources

Themes Download Link
Dashboard Components Download Link
Add Resources to Home Assistant Include the JavaScript files in your Lovelace resources:

resources:
  - url: /local/path-to/light-control-button.js
    type: module
  - url: /local/path-to/lights-slider-card.js
    type: module
  # Add remaining resources...
Apply Themes Import the themes into your Home Assistant configuration.

Configure Lovelace Use the card configurations provided below to set up your dashboard.

Custom Cards
1. Light Control Button
Purpose: Quickly toggle a light entity on/off. On hold, access settings.

type: custom:light-control-button
entity: light.your_light
icon: mdi:lightbulb
font_size: 20px
name: "Living Room Light"
Options:
entity: Light entity ID.
icon: Icon to display (default: mdi:lightbulb).
font_size: Font size of the text (default: 20px).
name: Custom label (default: friendly name).
2. Lights Slider Card
Purpose: Adjust brightness for multiple lights.

type: custom:light-control-slider
entities:
  - light.light1
  - light.light2
label: "Living Room Lights"
font_size: 14px
line_color: "#e9c344"
line_width: 2px
icon: mdi:lightbulb
Options:
entities: List of light entities.
label: Card label.
font_size, line_color, line_width: Styling options.
icon: Icon to display.
3. Main Entrance Card
Purpose: Display temperature and humidity.

type: custom:main-entrance-card
temperature: sensor.temperature_sensor
humidity: sensor.humidity_sensor
background_color: "#f5f5f5"
font_size: 14px
padding: 20px
height: 80px
Options:
temperature, humidity: Sensor entities.
background_color, font_size, padding, height: Styling options.
4. Rail Card
Purpose: Display live train schedules using the National Rail Integration.

type: custom:train-schedule-card
entity: sensor.train_departures
title: "Train Schedule"
icon: mdi:train
update_interval: 60000
Options:
entity: Train schedule sensor.
title: Card title (default: "Train Schedule").
icon: Icon to display.
update_interval: Refresh interval in ms (default: 60000).
5. Ruler Card (Degrees)
Purpose: Adjustable slider for temperature or other values.

type: custom:ruler-card
min: 0
max: 100
step: 5
font_size: 14px
Options:
min, max, step: Slider range and step values.
font_size: Font size.
6. Ruler Card (Percentage)
Purpose: Slider for percentage-based values.

type: custom:ruler-card-percentage
min: 0
max: 100
step: 10
font_size: 14px
Options:
min, max, step: Percentage range and step.
font_size: Font size.
7. Temperature Slider Card
Purpose: Adjust thermostat temperature.

type: custom:temperature-room-slider
entity: climate.thermostat
min: 15
max: 30
font_size: 14px
icon: mdi:thermometer
line_color: "#ad1d1d"
line_width: 2px
Options:
entity: Thermostat entity.
min, max: Temperature range.
font_size, icon, line_color, line_width: Styling options.
8. Welcome Entrance Card
Purpose: Display weather and welcome information (e.g., with the AccuWeather integration).

type: custom:weather-info-card
weather: weather.your_location
background_color: "#ffffff"
font_size: 14px
padding: 20px
height: 80px
Options:
weather: Weather entity.
background_color, font_size, padding, height: Styling options.
Future Plans
If there's enough interest, I might explore integrating this dashboard into HACS for easier sharing and installation. Any feedback or contributions are welcome!
