import { ColorStyle, RenderNodeShape } from '../figma-relay/types';
export declare const color2Css: (color: ColorStyle) => string;
export declare const shapeToSVG: (document: Document, shape: RenderNodeShape) => SVGSVGElement;
