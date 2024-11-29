
/**
 * @license
 * Home Assistant Community Store
 * @hacs
 */

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
