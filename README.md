# ISOGRAMS Dashboard for Home Assistant

Welcome to **ISOGRAMS**, a custom Home Assistant dashboard designed to simplify and enhance your smart home interface.

## Introduction

I’ve been a Home Assistant enthusiast for a while, and after equipping my flat with tech, I decided to build a dashboard tailored to my needs. The idea behind this dashboard is simplicity: easy to understand, functional, and free of information overload.  

The dashboard is designed to run on a **Lenovo Tab M8** in **landscape mode**, using the **Kiosk Browser** app for a seamless experience. While it works in portrait mode, the layout may occasionally appear misaligned.  

### Features
- **Custom Sidebar:** Based on a modified version of [DBuit’s Sidebar Card](https://github.com/DBuit/sidebar-card). *(Not included as I haven’t obtained permission to share the modifications.)*
- **Two Themes:** A light and dark theme to complement the dashboard.
- **Eight Custom Cards:** Fully configurable and designed for intuitive interaction.

---

## Screenshots

### ISOGRAMS Light Theme
*(Insert light theme image here)*

### ISOGRAMS Dark Theme
*(Insert dark theme image here once available)*

---

## Getting Started

### Prerequisites

- Home Assistant instance with Lovelace UI enabled.
- A tablet or device for displaying the dashboard (e.g., Lenovo Tab M8).
- Kiosk Browser app (optional, but recommended).

### Installation

1. **Download the Resources**
   - [Themes Download Link](https://drive.google.com/file/d/1dh0HdyBXuOj-73ZxMOSCvV20O7jga5FV/view?usp=sharing)
   - [Dashboard Components Download Link](https://drive.google.com/file/d/1urRT_o5r08OM4GZxQeFJt32_TAnD8Q1l/view?usp=sharing)

2. **Add Resources to Home Assistant**
   Include the JavaScript files in your Lovelace resources:
   ```yaml
   resources:
     - url: /local/path-to/light-control-button.js
       type: module
     - url: /local/path-to/lights-slider-card.js
       type: module
     # Add remaining resources...
