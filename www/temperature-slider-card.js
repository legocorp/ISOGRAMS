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
