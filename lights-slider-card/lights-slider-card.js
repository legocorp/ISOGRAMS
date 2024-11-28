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
