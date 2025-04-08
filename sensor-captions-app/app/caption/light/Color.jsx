import { AIR_RANGE } from '@/AppConfig';
// Color.jsx
export const rainbowColor = (p) => {
    const hue = p * 360; // Map p [0, 1] to hue [0, 360]
    const saturation = 100; // Full saturation for vibrant colors
    const lightness = 50; // 50% lightness for standard brightness
    return hslToHex(hue, saturation, lightness);
}

export const extractHexColor = (text) => {
    const match = text.match(/#[0-9A-Fa-f]{6}/);
    return match ? match[0] : null;
};

export const interpolateHueToHex = (value, minHue = 0, maxHue = 360) => {
    const hue = ((maxHue - minHue) * (value / 100)) + minHue;
    return hslToHex(hue, 100, 50);
};


function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0'); // Convert to hex
    };
    return `#${f(0)}${f(8)}${f(4)}`; // Combine RGB values into hex
}

// export const hslToHex = (h, s, l) => {
//     s /= 100;
//     l /= 100;
//     let c = (1 - Math.abs(2 * l - 1)) * s;
//     let x = c * (1 - Math.abs((h / 60) % 2 - 1));
//     let m = l - c / 2;
//     let r = 0, g = 0, b = 0;

//     if (0 <= h && h < 60) [r, g, b] = [c, x, 0];
//     else if (60 <= h && h < 120) [r, g, b] = [x, c, 0];
//     else if (120 <= h && h < 180) [r, g, b] = [0, c, x];
//     else if (180 <= h && h < 240) [r, g, b] = [0, x, c];
//     else if (240 <= h && h < 300) [r, g, b] = [x, 0, c];
//     else if (300 <= h && h < 360) [r, g, b] = [c, 0, x];

//     r = Math.round((r + m) * 255);
//     g = Math.round((g + m) * 255);
//     b = Math.round((b + m) * 255);

//     return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
// };

export const hexToRgb = (hex) => {
    // Remove the leading # if present
    hex = hex.replace(/^#/, '');

    // Parse the r, g, b values from the hex string
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return { r, g, b }; // Return an object with r, g, b components
}

export const hexToHSL = (hex) => {
    // Remove the '#' if present
    hex = hex.replace(/^#/, '');

    // Convert to RGB
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l;

    l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0));
                break;
            case g:
                h = ((b - r) / d + 2);
                break;
            case b:
                h = ((r - g) / d + 4);
                break;
        }

        h *= 60;
    }

    return { h, s: s * 100, l: l * 100 };
};
export const hexToPressure = (hex) => {
    const { h } = hexToHSL(hex);
    const p =  h / 360;
    return Math.floor(p * (AIR_RANGE.max - AIR_RANGE.min) + AIR_RANGE.min) / 1000;
};
