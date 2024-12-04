

// ---- Start of light-control-button.js ----

class LightControlButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    set hass(hass) {
        const entityId = this.config.entity;
        const icon = this.config.icon || 'mdi:lightbulb';
        const entity = hass.states[entityId];

        if (!entity) {
            this.shadowRoot.innerHTML = `
                <ha-card>
                    <div class="warning">Entity not found: ${entityId}</div>
                </ha-card>
            `;
            return;
        }

        const isOn = entity.state === 'on';

        if (!this.card) {
            this.createCard(hass, entityId, icon, entity, isOn);
        }

        this.updateState(isOn);
    }

    createCard(hass, entityId, icon, entity, isOn) {
        const fontSize = this.config.font_size || '20px';

        this.card = document.createElement('ha-card');
        this.card.style.cssText = `
            display: flex;
            align-items: center;
            padding: 10px;
            height: 100%;
            width: 100%;
            border-radius: var(--ha-card-border-radius, 10px);
            background: ${isOn ? 'var(--light-primary-color)' : 'var(--card-background-color)'};
            transition: background-color 0.3s ease, color 0.3s ease;
            cursor: pointer;
        `;

        const container = document.createElement('div');
        container.style.cssText = `
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: ${fontSize};
        `;

        const iconElement = document.createElement('ha-icon');
        iconElement.icon = icon;
        iconElement.style.cssText = `
            --mdc-icon-size: calc(${fontSize} * 1.2);
            color: var(--primary-text-color); /* Ensure icon color matches primary-text-color */
        `;

        this.label = document.createElement('span');
        this.label.innerText = this.config.name || entity.attributes.friendly_name;
        this.label.style.cssText = `
            font-size: ${fontSize};
            font-weight: bold;
            color: var(--primary-text-color); /* Ensure label color matches primary-text-color */
            cursor: pointer;
        `;

        container.appendChild(iconElement);
        container.appendChild(this.label);
        this.card.appendChild(container);
        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(this.card);

        let holdTimeout;
        let holdTriggered = false;

        const startHold = () => {
            holdTriggered = false;
            holdTimeout = setTimeout(() => {
                holdTriggered = true;
                this._showMoreInfo(entityId); // Trigger popup
            }, 500); // Hold duration in ms
        };

        const endHold = () => {
            clearTimeout(holdTimeout);
            if (!holdTriggered) {
                hass.callService('light', 'toggle', { entity_id: entityId }); // Toggle light on tap
            }
        };

        const cancelHold = () => {
            clearTimeout(holdTimeout);
        };

        // Mouse events
        this.card.addEventListener('mousedown', startHold);
        this.card.addEventListener('mouseup', endHold);
        this.card.addEventListener('mouseleave', cancelHold);

        // Touch events
        this.card.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent touch triggering mouse events
            startHold();
        });
        this.card.addEventListener('touchend', (e) => {
            e.preventDefault();
            endHold();
        });
        this.card.addEventListener('touchcancel', cancelHold);

        // Keyboard accessibility
        this.card.setAttribute('role', 'button');
        this.card.setAttribute('tabindex', '0');
        this.card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                hass.callService('light', 'toggle', { entity_id: entityId });
            }
        });
    }

    _showMoreInfo(entityId) {
        const event = new Event('hass-more-info', { bubbles: true, composed: true });
        event.detail = { entityId };
        this.dispatchEvent(event);
    }

    updateState(isOn) {
        this.card.style.background = isOn ? 'var(--light-primary-color)' : 'var(--card-background-color)';
        // Ensure text and icon always have primary-text-color, regardless of state
        const container = this.card.querySelector('div');
        if (container) {
            const icon = container.querySelector('ha-icon');
            const label = container.querySelector('span');
            if (icon) icon.style.color = 'var(--primary-text-color)';
            if (label) label.style.color = 'var(--primary-text-color)';
        }
    }

    setConfig(config) {
        if (!config.entity) {
            throw new Error('Entity is required.');
        }
        this.config = config;
    }

    getCardSize() {
        return 1;
    }
}

// Register the custom element
customElements.define('light-control-button', LightControlButton);

// Add the card to the card picker
window.customCards = window.customCards || [];
window.customCards.push({
    type: 'light-control-button',
    name: 'ISOGRAMS - Light Control Button',
    description: 'A customizable button card for controlling lights with tap to toggle and hold to open popup.',
});


// ---- End of light-control-button.js ----



// ---- Start of lights-slider-card.js ----

class LightControlSlider extends HTMLElement {
    set hass(hass) {
        const label = this.config.label;
        const entities = this.config.entities;

        const lightEntities = entities
            ? entities
            : Object.keys(hass.states).filter((entityId) =>
                  entityId.startsWith('light.') &&
                  hass.states[entityId].attributes.friendly_name.includes(label)
              );

        if (!this.card) {
            this.card = document.createElement('ha-card');
            this.card.style.position = 'relative';
            this.card.style.display = 'flex';
            this.card.style.alignItems = 'center';
            this.card.style.justifyContent = 'center';
            this.card.style.height = '100px';
            this.card.style.borderRadius = 'var(--ha-card-border-radius, 10px)';
            this.card.style.backgroundColor = 'var(--card-background-color, #fff)';
            this.card.style.overflow = 'hidden';

            const container = document.createElement('div');
            container.style.position = 'relative';
            container.style.width = '100%';
            container.style.height = '100%';
            container.style.borderRadius = 'inherit';
            container.style.overflow = 'hidden';

            // Slider input
            this.slider = document.createElement('input');
            this.slider.type = 'range';
            this.slider.min = 0;
            this.slider.max = 255;
            this.slider.step = 1;

            const initialBrightness = lightEntities.length
                ? Math.round(
                      lightEntities.reduce(
                          (sum, entityId) =>
                              sum + (hass.states[entityId].attributes.brightness || 0),
                          0
                      ) / lightEntities.length
                  )
                : 0;
            this.slider.value = initialBrightness;

            this.slider.style.width = '100%';
            this.slider.style.height = '100%';
            this.slider.style.appearance = 'none';
            this.slider.style.position = 'absolute';
            this.slider.style.margin = '0';
            this.slider.style.padding = '0';
            this.slider.style.background = 'linear-gradient(to right, transparent 0%, transparent 0%)';

            const styleSheet = document.createElement('style');
            this.updateLineStyle(styleSheet);
            this.appendChild(styleSheet);

            this.slider.addEventListener('input', (e) => {
                this.updateSliderFill();
                this.valueDisplay.innerText = `${e.target.value}`;
            });

            this.slider.addEventListener('change', (e) => {
                const brightness = parseInt(e.target.value, 10);
                lightEntities.forEach((entityId) => {
                    hass.callService('light', 'turn_on', {
                        entity_id: entityId,
                        brightness: brightness,
                    });
                });
            });

            container.appendChild(this.slider);

            // Add text and icon container
            const fontSize = this.config.font_size || '1.2em';
            const fontStyle = this.config.font_style || 'normal';

            this.textContainer = document.createElement('div');
            this.textContainer.style.position = 'absolute';
            this.textContainer.style.zIndex = '3'; // Ensure text is above everything
            this.textContainer.style.top = '50%'; // Align to the center
            this.textContainer.style.left = '10px';
            this.textContainer.style.right = '10px';
            this.textContainer.style.transform = 'translateY(-50%)'; // Adjust for perfect vertical centering
            this.textContainer.style.display = 'flex';
            this.textContainer.style.justifyContent = 'space-between';
            this.textContainer.style.alignItems = 'center';
            this.textContainer.style.color = 'var(--primary-text-color)';
            this.textContainer.style.pointerEvents = 'none'; // Allow slider interaction underneath

            const iconElement = document.createElement('ha-icon');
            iconElement.icon = this.config.icon || 'mdi:lightbulb';
            iconElement.style.marginLeft = '15px';
            iconElement.style.marginRight = '10px';
            iconElement.style.color = 'var(--primary-text-color)';
            iconElement.style.fontSize = fontSize;

            this.label = document.createElement('span');
            this.label.innerText = this.config.name || (entities ? 'Selected Lights' : `All ${label} Lights`);
            this.label.style.fontSize = fontSize;
            this.label.style.fontWeight = fontStyle === 'bold' ? 'bold' : 'normal';
            this.label.style.color = 'var(--primary-text-color)';

            const titleContainer = document.createElement('div');
            titleContainer.style.display = 'flex';
            titleContainer.style.alignItems = 'center';
            titleContainer.appendChild(iconElement);
            titleContainer.appendChild(this.label);

            this.textContainer.appendChild(titleContainer);
            container.appendChild(this.textContainer);
            this.card.appendChild(container);
            this.appendChild(this.card);

            // Initial update of the background
            this.updateSliderFill();
        }
    }

    /**
     * Dynamically update the slider background to show progress fill.
     */
    updateSliderFill() {
        const value = parseFloat(this.slider.value);
        const min = parseFloat(this.slider.min);
        const max = parseFloat(this.slider.max);

        const percentage = ((value - min) / (max - min)) * 100;
        const fillColor = this.config.line_color || '#e9c344';

        this.slider.style.background = `linear-gradient(to right, ${fillColor} ${percentage}%, var(--card-background-color) ${percentage}%)`;
    }

    /**
     * Dynamically update the line style for the slider thumb.
     */
    updateLineStyle(styleSheet) {
        const lineColor = this.config.line_color || '#e9c344';
        const thumbWidth = this.config.line_width || '2px';

        styleSheet.innerText = `
            input[type='range'] {
                -webkit-appearance: none;
                width: 100%;
                height: 100%;
                background: transparent;
            }
            input[type='range']::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: ${thumbWidth};
                height: 100%;
                background: ${lineColor};
                cursor: pointer;
            }
            input[type='range']::-moz-range-thumb {
                width: ${thumbWidth};
                height: 100%;
                background: ${lineColor};
                cursor: pointer;
                border: none;
            }
            input[type='range']::-ms-thumb {
                width: ${thumbWidth};
                height: 100%;
                background: ${lineColor};
                cursor: pointer;
                border: none;
            }
            input[type='range']::-webkit-slider-runnable-track {
                height: 100%;
                background: transparent;
            }
            input[type='range']::-moz-range-track {
                height: 100%;
                background: transparent;
            }
            input[type='range']::-ms-track {
                height: 100%;
                background: transparent;
                border-color: transparent;
                color: transparent;
            }
        `;
    }

    setConfig(config) {
        if (!config.label && !config.entities) {
            throw new Error('Please define either a label or a list of entities.');
        }
        this.config = config;

        if (this.card) {
            const styleSheet = this.querySelector('style');
            this.updateLineStyle(styleSheet);
        }
    }

    getCardSize() {
        return 1;
    }
}

customElements.define('light-control-slider', LightControlSlider);

// Add the card to the card picker
window.customCards = window.customCards || [];
window.customCards.push({
    type: 'light-control-slider',
    name: 'ISOGRAMS - Light Control Slider',
    description: 'A slider card for controlling light brightness with centered text and icon.',
});


// ---- End of lights-slider-card.js ----



// ---- Start of main-entrance-card.js ----

class MainEntranceCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    setConfig(config) {
        if (!config.temperature || !config.humidity || !config.background_color) {
            throw new Error("You need to define temperature, humidity entities, and background_color.");
        }

        this.config = {
            height: config.height || '80px',
            font_size: config.font_size || '1.2em',
            padding: config.padding || '20px',
            background_color: config.background_color,
            ...config,
        };
    }

    set hass(hass) {
        this._hass = hass;

        const temperature = hass.states[this.config.temperature]?.state || 'N/A';
        const humidity = hass.states[this.config.humidity]?.state || 'N/A';

        this.shadowRoot.innerHTML = `
            <style>
                ha-card {
                    background-color: ${this.config.background_color};
                    color: var(--primary-text-color);
                    font-size: ${this.config.font_size};
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    padding: ${this.config.padding};
                    height: ${this.config.height};
                    box-sizing: border-box;
                    border-radius: var(--ha-card-border-radius, 8px);
                    box-shadow: var(--ha-card-box-shadow, none);
                }

                .content {
                    display: flex;
                    justify-content: space-between;
                    width: 100%;
                    margin-bottom: 10px;
                }

                .temperature, .humidity {
                    padding: 0 10px;
                    font-weight: bold;
                    cursor: pointer;
                }
            </style>
            <ha-card>
                <div class="content">
                    <div class="humidity" id="humidity">${humidity}%</div>
                    <div class="temperature" id="temperature">${temperature}°C</div>
                </div>
            </ha-card>
        `;

        const temperatureElement = this.shadowRoot.getElementById('temperature');
        temperatureElement.addEventListener('click', () => this._showMoreInfo(this.config.temperature));

        const humidityElement = this.shadowRoot.getElementById('humidity');
        humidityElement.addEventListener('click', () => this._showMoreInfo(this.config.humidity));
    }

    _showMoreInfo(entityId) {
        const event = new Event('hass-more-info', { bubbles: true, composed: true });
        event.detail = { entityId };
        this.dispatchEvent(event);
    }

    getCardSize() {
        return 1;
    }
}

// Define the custom element
customElements.define('main-entrance-card', MainEntranceCard);

// Add the card to the card picker
window.customCards = window.customCards || [];
window.customCards.push({
    type: 'main-entrance-card',
    name: 'ISOGRAMS - Main Entrance Card',
    description: 'A card to display temperature and humidity for the main entrance.',
});


// ---- End of main-entrance-card.js ----



// ---- Start of rail-card.js ----

class TrainScheduleCard extends HTMLElement {
    setConfig(config) {
        if (!config.entity) {
            throw new Error("Please define a train schedule entity.");
        }

        this.entity = config.entity;
        this.title = config.title || "Train Schedule";
        this.icon = config.icon || "mdi:train"; // Default icon if not specified
        this.updateInterval = config.update_interval || 60000; // Update every 60 seconds by default

        this.attachShadow({ mode: "open" });
        this.render();
    }

    set hass(hass) {
        this._hass = hass;
        this.entityState = hass.states[this.entity];
        if (!this.entityState) {
            throw new Error("Entity not found.");
        }
        this.render();
    }

    render() {
        if (!this._hass || !this.entityState) return;

        const trains = this.entityState.attributes.trains || [];
        const nextTrains = trains.slice(0, 3);

        const style = `
          <style>
            :host {
              display: block;
              width: 100%;
              box-sizing: border-box;
            }
            ha-card {
              padding: 16px;
              display: flex;
              flex-direction: column;
              box-sizing: border-box;
              border-radius: var(--ha-card-border-radius, 12px);
              background: var(--card-background-color);
              color: var(--primary-text-color);
              box-shadow: var(--ha-card-box-shadow, none);
            }
            .header {
              display: flex;
              align-items: center;
              margin-bottom: 16px;
            }
            .icon {
              margin-right: 8px;
              font-size: 1.4em;
            }
            .title {
              font-size: 1.2em;
              font-weight: bold;
            }
            .last-refresh {
              font-size: 0.8em;
              color: var(--secondary-text-color);
              margin-left: auto;
            }
            .column-header {
              display: grid;
              grid-template-columns: repeat(5, 1fr);
              gap: 8px;
              font-weight: bold;
              font-size: 0.9em;
              color: var(--secondary-text-color);
              margin-bottom: 12px;
              padding-bottom: 8px;
              border-bottom: 1px solid var(--divider-color);
            }
            .train-box {
              background: var(--primary-background-color, #f0f0f0);
              border-radius: var(--ha-card-border-radius, 8px);
              padding: 12px;
              margin-bottom: 12px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              display: grid;
              grid-template-columns: repeat(5, 1fr);
              gap: 8px;
              align-items: center;
            }
            .train-box:last-child {
              margin-bottom: 0;
            }
            .train-box .bold-text {
              font-weight: bold;
            }
            .on-time {
              background-color: #2E8B57;
              color: white;
              padding: 2px 4px;
              border-radius: 4px;
              text-align: center;
            }
            .delayed {
              background-color: #DAA520;
              color: white;
              padding: 2px 4px;
              border-radius: 4px;
              text-align: center;
            }
            .cancelled {
              background-color: #FF6347;
              color: white;
              padding: 2px 4px;
              border-radius: 4px;
              text-align: center;
            }
          </style>
        `;

        const cardContent = `
          <ha-card>
            <div class="header">
              <ha-icon class="icon" icon="${this.icon}"></ha-icon>
              <div class="title">${this.title}</div>
              <div class="last-refresh" id="last-refresh-time">Last refreshed: Loading...</div>
            </div>
            <div class="column-header">
              <div>Time</div>
              <div>Expected</div>
              <div>Destination</div>
              <div>Status</div>
              <div>Platform</div>
            </div>
            ${nextTrains.map(train => {
                const scheduledTime = new Date(train.scheduled);
                const expectedTime = new Date(train.expected);

                const isInvalidDate = isNaN(scheduledTime.getTime()) || isNaN(expectedTime.getTime());
                const status = isInvalidDate ? 'Cancelled' :
                               train.expected === 'cancelled' ? 'Cancelled' :
                               expectedTime > scheduledTime ? 'Delayed' : 'On Time';

                const statusClass = status.toLowerCase().replace(" ", "-");

                return `
                  <div class="train-box">
                    <div class="bold-text">${isInvalidDate ? 'N/A' : scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <div>${isInvalidDate || train.expected === 'cancelled' ? 'N/A' : expectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <div>${isInvalidDate ? 'Cancelled' : train.terminus || '-'}</div>
                    <div class="${statusClass} bold-text">${status}</div>
                    <div>${train.platform || '-'}</div>
                  </div>
                `;
            }).join("")}
          </ha-card>
        `;

        this.shadowRoot.innerHTML = style + cardContent;
        this.updateLastRefreshTime();
    }

    updateLastRefreshTime() {
        const refreshTimeElement = this.shadowRoot.getElementById("last-refresh-time");
        const now = new Date();
        const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        refreshTimeElement.textContent = `Last refreshed: ${formattedTime}`;
    }

    connectedCallback() {
        this._updateInterval = setInterval(() => {
            this.render();
        }, this.updateInterval);
    }

    disconnectedCallback() {
        clearInterval(this._updateInterval);
    }

    static getConfigElement() {
        return document.createElement("hui-generic-entity-row");
    }

    static getStubConfig() {
        return { entity: "sensor.train_schedule" };
    }
}

customElements.define("train-schedule-card", TrainScheduleCard);


// ---- End of rail-card.js ----



// ---- Start of ruler-card-degrees.js ----

class RulerCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    setConfig(config) {
        if (!config.min || !config.max || !config.step) {
            throw new Error("You need to define 'min', 'max', and 'step' values in the card configuration.");
        }

        this.config = config;
        this.render();
    }

    render() {
        const min = this.config.min;
        const max = this.config.max;
        const step = this.config.step;

        const tickColor = getComputedStyle(document.body).getPropertyValue('--primary-text-color').trim();
        const subTickColor = getComputedStyle(document.body).getPropertyValue('--secondary-text-color').trim();
        const fontSize = this.config.font_size || '14px';

        const ruler = document.createElement('div');
        ruler.className = 'ruler';
        ruler.style.setProperty('--font-size', fontSize);

        for (let value = min; value <= max; value += step) {
            const isMainTick = Number.isInteger(value);

            const tick = document.createElement('div');
            tick.className = isMainTick ? 'main-tick' : 'sub-tick';
            tick.style.left = `${((value - min) / (max - min)) * 100}%`;
            tick.style.borderColor = isMainTick ? tickColor : subTickColor;
            tick.style.borderWidth = isMainTick ? '2px' : '1px';

            if (isMainTick && value !== max) {
                const label = document.createElement('span');
                label.textContent = value;
                label.style.color = tickColor;
                tick.appendChild(label);
            }

            ruler.appendChild(tick);

            if (isMainTick && value < max) {
                for (let subValue = value + step / 2; subValue < value + step; subValue += step / 2) {
                    const subTick = document.createElement('div');
                    subTick.className = 'sub-tick';
                    subTick.style.left = `${((subValue - min) / (max - min)) * 100}%`;
                    subTick.style.borderColor = subTickColor;
                    subTick.style.borderWidth = '1px';
                    ruler.appendChild(subTick);
                }
            }
        }

        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(this.getStyle());
        this.shadowRoot.appendChild(ruler);
    }

    getStyle() {
        const style = document.createElement('style');
        style.textContent = `
        .ruler {
            position: relative;
            width: 100%;
            height: calc(var(--font-size) * 2); /* Increased overall height for spacing */
            margin: 0;
            display: flex;
            align-items: flex-end; /* Center ticks and text vertically */
        }
        .main-tick,
        .sub-tick {
            position: absolute;
            border-left-style: solid;
        }
        .main-tick {
            height: calc(var(--font-size) * 0.8); /* Adjusted height for better tick spacing */
            width: 0;
            display: flex;
            align-items: flex-start; /* Align label slightly above the tick */
        }
        .main-tick span {
            margin-left: 6px; /* Adjusted label spacing from tick */
            font-size: var(--font-size);
            font-family: sans-serif;
            line-height: calc(var(--font-size) * 1.1); /* Match line-height to size with extra padding */
        }
        .sub-tick {
            height: calc(var(--font-size) * 0.5); /* Subticks are shorter than main ticks */
            width: 0;
        }
    `;
        return style;
    }

    set hass(hass) {
        // Optional re-render logic
    }

    getCardSize() {
        return 1;
    }
}

// Register the custom element
customElements.define('ruler-card', RulerCard);

// Add the card to the card picker
window.customCards = window.customCards || [];
window.customCards.push({
    type: 'ruler-card',
    name: 'ISOGRAMS - Ruler Card degrees',
    preview: true, // Optional - defaults to false
    description: 'A custom card to display a ruler with customizable ticks and labels.',
});



// ---- End of ruler-card-degrees.js ----



// ---- Start of ruler-card-percentage.js ----

class RulerCardPercentage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    setConfig(config) {
        this.config = {
            min: config.min || 0, // Default to 0
            max: config.max || 100, // Default to 100
            step: config.step || 10, // Default to 10
            font_size: config.font_size || '14px', // Optional font size
            ...config,
        };
        this.render();
    }

    render() {
        const { min, max, step } = this.config;

        const tickColor = getComputedStyle(document.body).getPropertyValue('--primary-text-color').trim();
        const subTickColor = getComputedStyle(document.body).getPropertyValue('--secondary-text-color').trim();
        const fontSize = this.config.font_size;

        const ruler = document.createElement('div');
        ruler.className = 'ruler';
        ruler.style.setProperty('--font-size', fontSize);

        // Generate ticks
        for (let value = min; value <= max; value += step) {
            const isMainTick = (value - min) % step === 0;

            const tick = document.createElement('div');
            tick.className = isMainTick ? 'main-tick' : 'sub-tick';
            tick.style.left = `${((value - min) / (max - min)) * 100}%`;
            tick.style.borderColor = isMainTick ? tickColor : subTickColor;
            tick.style.borderWidth = isMainTick ? '2px' : '1px';

            // Add labels for main ticks except for the max value
            if (isMainTick && value !== max) {
                const label = document.createElement('span');
                label.textContent = value;
                label.style.color = tickColor;
                tick.appendChild(label);
            }

            ruler.appendChild(tick);
        }

        // Clear and append elements
        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(this.getStyle());
        this.shadowRoot.appendChild(ruler);
    }

    getStyle() {
        const style = document.createElement('style');
        style.textContent = `
            .ruler {
                position: relative;
                width: 100%;
                height: calc(var(--font-size) * 2); /* Adjust height for text and ticks */
                margin: 0;
                display: flex;
                align-items: flex-end; /* Align ticks and text at the bottom */
            }
            .main-tick,
            .sub-tick {
                position: absolute;
                border-left-style: solid;
            }
            .main-tick {
                height: calc(var(--font-size) * 0.8); /* Main tick height */
                width: 0;
                display: flex;
                align-items: flex-end; /* Align text to the bottom of the tick */
            }
            .main-tick span {
                margin-left: 6px; /* Space between tick and text */
                font-size: var(--font-size);
                font-family: sans-serif;
                line-height: var(--font-size); /* Match text height */
            }
            .sub-tick {
                height: calc(var(--font-size) * 0.5); /* Subtick height */
                width: 0;
            }
        `;
        return style;
    }

    set hass(hass) {
        // Optional re-render logic
    }

    getCardSize() {
        return 1; // Compact height
    }
}

// Register the custom element
customElements.define('ruler-card-percentage', RulerCardPercentage);

// Add the card to the card picker
window.customCards = window.customCards || [];
window.customCards.push({
    type: 'ruler-card-percentage',
    name: 'ISOGRAMS - Ruler Card Percentage',
    preview: true,
    description: 'A custom card to display a ruler with percentage values (0-100), customizable ticks, steps, and hidden max label.',
});


// ---- End of ruler-card-percentage.js ----



// ---- Start of temperature-slider-card.js ----

class TemperatureRoomSlider extends HTMLElement {
    set hass(hass) {
        this._hass = hass;

        if (!this.card) {
            const entityId = this.config.entity;
            const stateObj = this._hass.states[entityId];

            if (!stateObj) {
                throw new Error(`Entity ${entityId} not found.`);
            }

            this.card = document.createElement('ha-card');
            this.card.style.position = 'relative';
            this.card.style.display = 'flex';
            this.card.style.alignItems = 'center';
            this.card.style.justifyContent = 'center';
            this.card.style.height = '100px';
            this.card.style.borderRadius = 'var(--ha-card-border-radius, 10px)';
            this.card.style.backgroundColor = 'var(--card-background-color, #fff)';
            this.card.style.overflow = 'hidden';

            const container = document.createElement('div');
            container.style.position = 'relative';
            container.style.width = '100%';
            container.style.height = '100%';
            container.style.borderRadius = 'inherit';
            container.style.overflow = 'hidden';

            // Slider input
            this.slider = document.createElement('input');
            this.slider.type = 'range';
            this.slider.min = this.config.min || 15;
            this.slider.max = this.config.max || 30;
            this.slider.step = 0.1;
            this.slider.value = stateObj.attributes.temperature || stateObj.state;
            this.slider.style.width = '100%';
            this.slider.style.height = '100%';
            this.slider.style.appearance = 'none';
            this.slider.style.position = 'absolute';
            this.slider.style.margin = '0';
            this.slider.style.padding = '0';
            this.slider.style.background = 'transparent';

            const styleSheet = document.createElement('style');
            this.updateLineStyle(styleSheet);
            this.appendChild(styleSheet);

            this.slider.addEventListener('input', (e) => {
                this.updateSliderFill();
                this.valueDisplay.innerText = `${parseFloat(e.target.value).toFixed(1)}°`;
            });

            this.slider.addEventListener('change', (e) => {
                const value = parseFloat(e.target.value).toFixed(1);
                this._hass.callService('climate', 'set_temperature', {
                    entity_id: entityId,
                    temperature: value,
                });
            });

            container.appendChild(this.slider);

            // Add text and icon container
            const fontSize = this.config.font_size || '1.2em';
            const fontStyle = this.config.font_style || 'normal';

            this.textContainer = document.createElement('div');
            this.textContainer.style.position = 'absolute';
            this.textContainer.style.top = '50%'; // Center vertically
            this.textContainer.style.left = '10px';
            this.textContainer.style.right = '10px';
            this.textContainer.style.transform = 'translateY(-50%)'; // Adjust for perfect centering
            this.textContainer.style.display = 'flex';
            this.textContainer.style.justifyContent = 'space-between';
            this.textContainer.style.alignItems = 'center';
            this.textContainer.style.zIndex = '3'; // Ensure text is above everything
            this.textContainer.style.color = 'var(--primary-text-color)';
            this.textContainer.style.fontSize = fontSize;
            this.textContainer.style.fontStyle = fontStyle;
            this.textContainer.style.pointerEvents = 'none'; // Allow slider interaction underneath

            const iconElement = document.createElement('ha-icon');
            iconElement.icon = this.config.icon || 'mdi:thermometer';
            iconElement.style.marginLeft = '15px';
            iconElement.style.marginRight = '10px';
            iconElement.style.color = 'var(--primary-text-color)';
            iconElement.style.fontSize = fontSize;

            this.label = document.createElement('span');
            this.label.innerText = this.config.name || stateObj.attributes.friendly_name;
            this.label.style.fontWeight = fontStyle === 'bold' ? 'bold' : 'normal';
            this.label.style.color = 'var(--primary-text-color)';

            this.valueDisplay = document.createElement('span');
            this.valueDisplay.innerText = `${parseFloat(
                stateObj.attributes.temperature || stateObj.state
            ).toFixed(1)}°`;
            this.valueDisplay.style.marginRight = '10px';
            this.valueDisplay.style.fontWeight = fontStyle === 'bold' ? 'bold' : 'normal';
            this.valueDisplay.style.color = 'var(--primary-text-color)';

            const titleContainer = document.createElement('div');
            titleContainer.style.display = 'flex';
            titleContainer.style.alignItems = 'center';
            titleContainer.appendChild(iconElement);
            titleContainer.appendChild(this.label);

            this.textContainer.appendChild(titleContainer);
            this.textContainer.appendChild(this.valueDisplay);

            container.appendChild(this.textContainer);
            this.card.appendChild(container);
            this.appendChild(this.card);

            // Initial update of the background
            this.updateSliderFill();
        }
    }

    /**
     * Dynamically update the slider background to show progress fill.
     */
    updateSliderFill() {
        const value = parseFloat(this.slider.value);
        const min = parseFloat(this.slider.min);
        const max = parseFloat(this.slider.max);

        const percentage = ((value - min) / (max - min)) * 100;
        const fillColor = this.config.line_color || '#ad1d1d';

        this.slider.style.background = `linear-gradient(to right, ${fillColor} ${percentage}%, var(--card-background-color) ${percentage}%)`;
    }

    /**
     * Dynamically update the line style for the slider thumb.
     */
    updateLineStyle(styleSheet) {
        const lineColor = this.config.line_color || '#ad1d1d';
        const thumbWidth = this.config.line_width || '2px';

        styleSheet.innerText = `
            input[type='range'] {
                -webkit-appearance: none;
                width: 100%;
                height: 100%;
                background: transparent;
            }
            input[type='range']::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: ${thumbWidth};
                height: 100%;
                background: ${lineColor};
                cursor: pointer;
            }
            input[type='range']::-moz-range-thumb {
                width: ${thumbWidth};
                height: 100%;
                background: ${lineColor};
                cursor: pointer;
                border: none;
            }
            input[type='range']::-ms-thumb {
                width: ${thumbWidth};
                height: 100%;
                background: ${lineColor};
                cursor: pointer;
                border: none;
            }
            input[type='range']::-webkit-slider-runnable-track {
                height: 100%;
                background: transparent;
            }
            input[type='range']::-moz-range-track {
                height: 100%;
                background: transparent;
            }
            input[type='range']::-ms-track {
                height: 100%;
                background: transparent;
                border-color: transparent;
                color: transparent;
            }
        `;
    }

    setConfig(config) {
        if (!config.entity) {
            throw new Error('Please define an entity.');
        }
        this.config = config;

        if (this.card) {
            const styleSheet = this.querySelector('style');
            this.updateLineStyle(styleSheet);
        }
    }

    getCardSize() {
        return 1;
    }
}

customElements.define('temperature-room-slider', TemperatureRoomSlider);

// Add the card to the card picker
window.customCards = window.customCards || [];
window.customCards.push({
    type: 'temperature-room-slider',
    name: 'ISOGRAMS - Temperature Room Slider',
    description: 'A slider card for setting room temperature with centered text and icon.',
});


// ---- End of temperature-slider-card.js ----



// ---- Start of welcome-entrance-card.js ----

class WeatherInfoCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    setConfig(config) {
        if (!config.weather || !config.background_color) {
            throw new Error("You need to define a weather entity and background_color.");
        }

        this.config = {
            height: config.height || '80px',
            font_size: config.font_size || '1.2em',
            padding: config.padding || '20px',
            background_color: config.background_color,
            ...config,
        };
    }

    set hass(hass) {
        this._hass = hass;

        const weatherState = hass.states[this.config.weather]?.state || 'N/A';
        const temperature = hass.states[this.config.weather]?.attributes.temperature || 'N/A';

        // Capitalize the first letter of the weather state
        const weatherDescription = weatherState.charAt(0).toUpperCase() + weatherState.slice(1);

        this.shadowRoot.innerHTML = `
            <style>
                ha-card {
                    background-color: ${this.config.background_color};
                    color: var(--primary-text-color);
                    font-size: ${this.config.font_size};
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    padding: ${this.config.padding};
                    height: ${this.config.height};
                    box-sizing: border-box;
                    border-radius: var(--ha-card-border-radius, 8px);
                    box-shadow: var(--ha-card-box-shadow, none);
                }

                .content {
                    display: flex;
                    justify-content: space-between;
                    width: 100%;
                    margin-bottom: 10px;
                }

                .description, .temperature {
                    padding: 0 10px;
                    font-weight: bold;
                    cursor: pointer;
                }
            </style>
            <ha-card>
                <div class="content">
                    <div class="description" id="description">${weatherDescription}</div>
                    <div class="temperature" id="temperature">${temperature}°C</div>
                </div>
            </ha-card>
        `;

        const descriptionElement = this.shadowRoot.getElementById('description');
        descriptionElement.addEventListener('click', () => this._showMoreInfo(this.config.weather));

        const temperatureElement = this.shadowRoot.getElementById('temperature');
        temperatureElement.addEventListener('click', () => this._showMoreInfo(this.config.weather));
    }

    _showMoreInfo(entityId) {
        const event = new Event('hass-more-info', { bubbles: true, composed: true });
        event.detail = { entityId };
        this.dispatchEvent(event);
    }

    getCardSize() {
        return 1;
    }
}

// Define the custom element
customElements.define('weather-info-card', WeatherInfoCard);

// Add the card to the card picker
window.customCards = window.customCards || [];
window.customCards.push({
    type: 'weather-info-card',
    name: 'ISOGRAMS - Weather Info Card',
    description: 'A card to display the current weather description and temperature.',
});


// ---- End of welcome-entrance-card.js ----

