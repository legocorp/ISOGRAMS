
/**
 * @license
 * Home Assistant Community Store
 * @hacs
 */

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
ustomizable button card for controlling lights with tap to toggle and hold to open popup.',
});
