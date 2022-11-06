"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shapeToSVG = exports.color2Css = void 0;
const color2Css = (color) => {
    return `rgba(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)},${Math.round(color.b * 255)}, ${color.a})`;
};
exports.color2Css = color2Css;
const shapeToSVG = (document, shape) => {
    let svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgElement.setAttribute('width', '413');
    svgElement.setAttribute('height', '392');
    svgElement.setAttribute('viewBox', '0 0 413 392');
    let path = document.createElement('path');
    path.setAttribute('d', shape.path);
    path.setAttribute('fill', '#00ff00'); // TODO find real value
    svgElement.appendChild(path);
    if (shape.imagePattern) {
        const patternID = 'pattern0';
        const imageID = 'image0';
        let defs = document.createElement('defs');
        let pattern = document.createElement('pattern');
        pattern.setAttribute('id', patternID);
        pattern.setAttribute('patternContentUnits', 'objectBoundingBox');
        pattern.setAttribute('width', '1');
        pattern.setAttribute('height', '1');
        path.setAttribute('fill', `url(#${patternID})`);
        defs.appendChild(pattern);
        let use = document.createElement('use');
        use.setAttribute('xlink:href', '#' + imageID);
        pattern.appendChild(use);
        let image = document.createElement('image');
        image.setAttribute('id', imageID);
        image.setAttribute('xlink:href', shape.imagePattern.url);
        image.setAttribute('width', '378'); // TODO find real value
        image.setAttribute('height', '378'); // TODO find real value
        defs.appendChild(image);
        svgElement.appendChild(defs);
    }
    else if (shape.fillColor) {
        path.setAttribute('fill', shape.fillColor);
    }
    return svgElement;
};
exports.shapeToSVG = shapeToSVG;
//# sourceMappingURL=util.js.map