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

