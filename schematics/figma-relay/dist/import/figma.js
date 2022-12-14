"use strict";
// https://www.figma.com/file/gohZuvON9qmHoSnEYsW5Vo/HelloFigma?node-id=0%3A1
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComponent = void 0;
const axios_1 = __importDefault(require("axios"));
const fs_extra_1 = require("fs-extra");
const Figma = __importStar(require("figma-api"));
const path_1 = require("path");
const util_1 = require("./util");
const outDir = './output';
let assetDir = './output/assets/';
let relativeAssetDir = '';
const relayPluginID = '1041056822461507786';
function downloadFile(source, destination) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield axios_1.default.get(source, { responseType: 'arraybuffer' });
        (0, fs_extra_1.writeFileSync)(destination, res.data);
    });
}
function transformComponent(node) {
    return __awaiter(this, void 0, void 0, function* () {
        const transformNode = (node, parent) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const renderNode = {};
            renderNode.originalNode = node;
            node.originalName = node.name;
            if (node.name.includes('=')) {
                // it is a variant!?
                node.name = node.name.split('=')[1];
            }
            const nodeID = node.name.split(' ').join('-').toLowerCase() + '-' + node.id.replace(':', '-');
            renderNode.id = nodeID;
            renderNode.type = node.type;
            renderNode.name = node.name;
            renderNode.parameters = [];
            renderNode.inputs = [];
            if (node.pluginData && node.pluginData[relayPluginID]) {
                const relayData = node.pluginData[relayPluginID];
                if (relayData.parameters) {
                    const parameters = JSON.parse(relayData.parameters);
                    renderNode.parameters = parameters;
                }
                if (relayData.interactions) {
                    const interactions = JSON.parse(relayData.interactions);
                    renderNode.interactions = interactions;
                    console.log(interactions);
                }
            }
            let nodeCSS = {};
            nodeCSS['box-sizing'] = 'border-box';
            if (node.type === 'ELLIPSE') {
                if (node.absoluteBoundingBox.width === node.absoluteBoundingBox.height) {
                    nodeCSS['border-radius'] = '50%';
                }
            }
            if (node.type === 'RECTANGLE') {
                const bgFill = node.fills.find((fill) => fill.type === 'SOLID');
                if (bgFill) {
                    nodeCSS['background-color'] = (0, util_1.color2Css)(bgFill.color);
                }
                if (node.effects) {
                    const dropShadow = node.effects.find((effect) => effect.type === 'DROP_SHADOW');
                    if (dropShadow) {
                        nodeCSS['box-shadow'] = `${dropShadow.offset.x}px ${dropShadow.offset.y}px ${dropShadow.radius}px ${(0, util_1.color2Css)(dropShadow.color)}`;
                    }
                }
            }
            if (node.type === 'STAR' || node.type === 'REGULAR_POLYGON') {
                if (node.fillGeometry) {
                    const geometry = node.fillGeometry[0];
                    const shape = { path: geometry.path };
                    const imageFill = node.fills.find((fill) => fill.type === 'IMAGE');
                    if (imageFill) {
                        imageFill.imageRef;
                        shape.imagePattern = {
                            url: `${relativeAssetDir}/${imageFill.imageRef}.png`,
                        };
                    }
                    else {
                        const solidFill = node.fills.find((fill) => fill.type === 'SOLID');
                        shape.fillColor = (0, util_1.color2Css)(solidFill.color);
                    }
                    renderNode.shapes = [shape];
                }
            }
            if (node.type === 'TEXT') {
                const fillColor = node.fills.find((fill) => fill.type === 'SOLID');
                if (fillColor) {
                    nodeCSS.color = (0, util_1.color2Css)(fillColor.color);
                }
                nodeCSS['font-family'] = node.style.fontFamily;
                nodeCSS['font-weight'] = node.style.fontWeight;
                nodeCSS['font-size'] = node.style.fontSize + 'px';
                renderNode.content = node.characters;
                //           "fontPostScriptName": "MontserratRoman-Bold",
                //           "textAutoResize": "WIDTH_AND_HEIGHT",
                //           "textAlignHorizontal": "LEFT",
                //           "textAlignVertical": "TOP",
                //           "letterSpacing": 0,
                //           "lineHeightPx": 28.125,
                //           "lineHeightPercent": 100,
                //           "lineHeightUnit": "INTRINSIC_%"
                // node.charachter is the content!
            }
            const imageFill = node.fills.find((fill) => fill.type === 'IMAGE');
            if (imageFill && !renderNode.shapes) {
                imageFill.imageRef;
                nodeCSS.background = `url(${relativeAssetDir}/${imageFill.imageRef}.png)`;
                nodeCSS['background-size'] = 'cover!important';
                nodeCSS['background-position'] = 'center!important';
                const imageContentParameter = (_a = renderNode.parameters) === null || _a === void 0 ? void 0 : _a.find((param) => param.property === 'image-content');
                if (imageContentParameter) {
                    renderNode.inputs.push({
                        name: imageContentParameter.name,
                        type: 'string',
                        bindingType: 'STYLE',
                        bindingName: 'background',
                        bindingFunction: (val) => {
                            return `'url('+${val}+')'`;
                        },
                        default: `'${relativeAssetDir}/${imageFill.imageRef}.png'`,
                    });
                }
            }
            if (node.cornerRadius) {
                nodeCSS['border-radius'] = node.cornerRadius + 'px';
                const borderRadiusParameter = (_b = renderNode.parameters) === null || _b === void 0 ? void 0 : _b.find((p) => p.property === 'border-radius');
                if (borderRadiusParameter) {
                    renderNode.inputs.push({
                        name: borderRadiusParameter.name,
                        type: borderRadiusParameter.type,
                        bindingType: 'STYLE',
                        bindingName: 'borderRadius',
                        bindingUnit: 'px',
                        default: node.cornerRadius,
                    });
                }
            }
            if (node.strokes && node.strokes.length > 0) {
                const stroke = node.strokes[0];
                const borderColor = (0, util_1.color2Css)(stroke.color);
                nodeCSS.border = node.strokeWeight + 'px solid ' + borderColor;
            }
            if (node.layoutMode && node.layoutMode !== 'NONE') {
                // we have autolayout
                renderNode.autoLayout = true;
                nodeCSS.display = 'inline-flex';
                nodeCSS['flex-direction'] = node.layoutMode === 'VERTICAL' ? 'column' : 'row';
                if (node.itemSpacing) {
                    nodeCSS.gap = node.itemSpacing + 'px';
                }
            }
            else if (parent && !parent.autoLayout) {
                renderNode.autoLayout = false;
                nodeCSS.position = 'absolute';
                let x = node.absoluteBoundingBox.x;
                if (parent) {
                    x -= parent.originalNode.absoluteBoundingBox.x;
                }
                let y = node.absoluteBoundingBox.y;
                if (parent) {
                    y -= parent.originalNode.absoluteBoundingBox.y;
                }
                nodeCSS.left = x + 'px';
                nodeCSS.top = y + 'px';
            }
            else {
                nodeCSS.position = 'relative';
            }
            nodeCSS.width = node.absoluteBoundingBox.width + 'px';
            nodeCSS.height = node.absoluteBoundingBox.height + 'px';
            if (((node.paddingLeft === node.paddingRight) === node.paddingBottom) === node.paddingTop) {
                nodeCSS.padding = node.paddingLeft - node.strokeWeight + 'px';
            }
            else {
                if (node.paddingLeft) {
                    nodeCSS['padding-left'] = node.paddingLeft - node.strokeWeight + 'px';
                }
                if (node.paddingRight) {
                    nodeCSS['padding-right'] = node.paddingRight - node.strokeWeight + 'px';
                }
                if (node.paddingTop) {
                    nodeCSS['padding-top'] = node.paddingTop - node.strokeWeight + 'px';
                }
                if (node.paddingBottom) {
                    nodeCSS['padding-bottom'] = node.paddingBottom - node.strokeWeight + 'px';
                }
            }
            if (node.backgroundColor) {
                nodeCSS['background-color'] = (0, util_1.color2Css)(node.backgroundColor);
                const bgColorParameter = (_c = renderNode.parameters) === null || _c === void 0 ? void 0 : _c.find((p) => p.property === 'background-color');
                if (bgColorParameter) {
                    renderNode.inputs.push({
                        name: bgColorParameter.name,
                        type: 'string',
                        bindingType: 'STYLE',
                        bindingName: 'backgroundColor',
                        bindingUnit: '',
                        default: `'${(0, util_1.color2Css)(node.backgroundColor)}'`,
                    });
                }
            }
            renderNode.css = nodeCSS;
            renderNode.children = [];
            if (node.children) {
                for (let i = 0; i < node.children.length; i++) {
                    const childResult = yield transformNode(node.children[i], renderNode);
                    renderNode.children.push(childResult.renderNode);
                }
            }
            return { renderNode };
        });
        const transformResult = yield transformNode(node);
        return transformResult;
    });
}
function getComponent(aDir, relativeADir, fileKey, token) {
    return __awaiter(this, void 0, void 0, function* () {
        const api = new Figma.Api({
            personalAccessToken: token,
        });
        relativeAssetDir = relativeADir;
        assetDir = aDir;
        const file = yield api.getFile(fileKey, {
            plugin_data: relayPluginID,
            geometry: 'paths',
        });
        (0, fs_extra_1.ensureDirSync)(assetDir);
        const imageFills = yield api.getImageFills(fileKey);
        if (imageFills.meta) {
            for (let file in imageFills.meta.images) {
                const url = imageFills.meta.images[file];
                yield downloadFile(url, (0, path_1.join)(assetDir, `${file}.png`));
            }
        }
        const canvases = file.document.children.filter((child) => Figma.isNodeType(child, 'CANVAS'));
        const components = canvases[0].children.filter((child) => child.type === 'COMPONENT');
        const componentSets = canvases[0].children.filter((child) => child.type === 'COMPONENT_SET');
        const transformedComponentSets = [];
        for (let componentSet of componentSets) {
            const set = {
                components: [],
                original: componentSet,
            };
            for (let component of componentSet.children) {
                const transformResult = yield transformComponent(component);
                set.components.push(transformResult);
            }
            transformedComponentSets.push(set);
        }
        const componentTransforms = [];
        for (let component of components) {
            const transformResult = yield transformComponent(component);
            componentTransforms.push(transformResult);
        }
        return {
            components: componentTransforms,
            componentSets: transformedComponentSets,
        };
    });
}
exports.getComponent = getComponent;
//# sourceMappingURL=figma.js.map