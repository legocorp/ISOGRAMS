
/**
 * @license
 * Home Assistant Community Store
 * @hacs
 */

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
