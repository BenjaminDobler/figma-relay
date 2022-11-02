"use strict";
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
exports.importComponent = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const inquirer = __importStar(require("inquirer"));
const core_1 = require("@angular-devkit/core");
const workspace_1 = require("@schematics/angular/utility/workspace");
const figma_1 = require("./figma");
const path_1 = require("path");
const prettier_1 = __importDefault(require("prettier"));
const stringsHelper = require('jsdom/lib/jsdom/living/helpers/strings.js');
const asciiLowercase_ = stringsHelper.asciiLowercase;
stringsHelper.asciiLowercase = function (name) {
    if (name.startsWith('[')) {
        return name;
    }
    return asciiLowercase_(name);
};
const jsdom_1 = require("jsdom");
const validateNames = require('jsdom/lib/jsdom/living/helpers/validate-names.js');
const name_ = validateNames.name;
validateNames.name = function (name) {
    try {
        name_(name);
    }
    catch (_a) { }
};
// You don't have to export the function as default. You can also have more than one rule factory
// per file.
function importComponent(_options) {
    return (tree, _context) => __awaiter(this, void 0, void 0, function* () {
        let config;
        const chainsOps = [];
        if (tree.exists('.figma-relay')) {
            config = tree.readJson('.figma-relay');
        }
        else {
            console.log('figma config does not exist!');
            const question = [
                {
                    message: 'Please provide your Figma API token.',
                    name: 'token',
                },
            ];
            const answer = yield inquirer.prompt(question);
            config = { token: answer.token };
            const fileQustion = [
                {
                    message: 'Please provide the link to your Figma file.',
                    name: 'file',
                },
            ];
            const fileAnswer = yield inquirer.prompt(fileQustion);
            config.file = fileAnswer.file;
            tree.create('.figma-relay', JSON.stringify(config));
        }
        if (!config.file) {
            const fileQustion = [
                {
                    message: 'Please provide the link to your Figma file.',
                    name: 'file',
                },
            ];
            const fileAnswer = yield inquirer.prompt(fileQustion);
            config.file = fileAnswer.file;
            tree.overwrite('.figma-relay', JSON.stringify(config));
        }
        let fileKey = config.file.substring(27);
        fileKey = fileKey.substring(0, fileKey.indexOf('/'));
        const workspace = yield (0, workspace_1.getWorkspace)(tree);
        const project = workspace.projects.get('demo');
        const srcRoot = project === null || project === void 0 ? void 0 : project.sourceRoot;
        const transformResult = yield (0, figma_1.getComponent)((0, path_1.join)(srcRoot, 'assets', 'figma-relay'), '/assets/figma-relay', fileKey, config.token);
        const componentTransforms = transformResult.components;
        const componentSets = transformResult.componentSets;
        for (let componentSet of componentSets) {
            console.log('Component set', componentSet.original.name);
            console.log(core_1.strings.dasherize(componentSet.original.name));
            const subDir = 'figma-relay-' + core_1.strings.dasherize(componentSet.original.name) + '/variants/';
            let htmlContent = '';
            let componentSetImportClasses = '';
            let componentSetImportPaths = '';
            const firstComponentName = componentSet.original.children[0].originalName;
            console.log(firstComponentName);
            const variantPropertyName = firstComponentName.split('=')[0];
            const variantNames = [];
            for (let component of componentSet.components) {
                const options = getComponentOptions(component);
                chainsOps.push(addFiles(options, project === null || project === void 0 ? void 0 : project.sourceRoot, subDir));
                const tagName = 'figma-relay-' + core_1.strings.dasherize(component.renderNode.name) + '-component';
                htmlContent += `<${tagName} *ngIf="${variantPropertyName}=='${component.renderNode.name}'"></${tagName}>`;
                const className = core_1.strings.classify(component.renderNode.name) + 'Component';
                componentSetImportClasses += className + ',';
                //console.log('component name ', component.renderNode.name);
                variantNames.push(component.renderNode.name);
                const n = 'figma-relay-' + core_1.strings.dasherize(component.renderNode.name);
                const i = `import { ${className} } from './variants/${n}/${n}.component';`;
                componentSetImportPaths += i + '\n';
            }
            const options = {
                htmlContent: htmlContent,
            };
            options.css = '';
            options.inputs = [];
            options.inputString = '';
            options.outputString = '';
            options.typeDefinitions = `export type ${core_1.strings.classify(variantPropertyName)}Type = '${variantNames.join("' | '")}';`;
            options.variantProperty = `@Input()\n${variantPropertyName}: ${core_1.strings.classify(variantPropertyName)}Type = '${variantNames[0]}'`;
            console.log(options.typeDefinitions);
            (options.name = componentSet.original.name.split(' ').join('')), (options.componentSetImportPaths = componentSetImportPaths);
            options.componentSetImportClasses = componentSetImportClasses;
            chainsOps.push(addFiles(options, project === null || project === void 0 ? void 0 : project.sourceRoot));
        }
        const questions = [
            {
                message: 'Which components do you want to import/update',
                type: 'checkbox',
                name: 'components',
                choices: componentTransforms.map((c) => c.renderNode.name),
            },
        ];
        const answer = yield inquirer.prompt(questions);
        for (let component of componentTransforms) {
            if (answer.components.includes(component.renderNode.name)) {
                const options = getComponentOptions(component);
                chainsOps.push(addFiles(options, project === null || project === void 0 ? void 0 : project.sourceRoot));
            }
        }
        return (0, schematics_1.chain)(chainsOps);
    });
}
exports.importComponent = importComponent;
function addFiles(options, outDir, subDir) {
    return (0, schematics_1.mergeWith)((0, schematics_1.apply)((0, schematics_1.url)(`./files`), [
        (0, schematics_1.template)(Object.assign(Object.assign({ tmpl: '' }, options), core_1.strings)),
        subDir ? (0, schematics_1.move)(outDir + '/app/generated/' + subDir) : (0, schematics_1.move)(outDir + '/app/generated/'),
    ]), schematics_1.MergeStrategy.Overwrite);
}
function getComponentOptions(component) {
    const inputs = [];
    const outputs = [];
    component.renderNode.isRoot = true;
    let dom = new jsdom_1.JSDOM('');
    const document = dom.window.document;
    const getContent = (renderNode) => {
        var _a;
        const tag = document.createElement('div');
        tag.classList.add(renderNode.id);
        renderNode.inputs.forEach((input) => {
            if (input.bindingType === 'STYLE') {
                inputs.push({
                    type: input.type,
                    name: input.name,
                    default: input.default,
                });
                if (input.bindingUnit) {
                    tag.setAttribute(`[style.${input.bindingName}]`, `${input.name} + '${input.bindingUnit}'`);
                }
                else if (input.bindingFunction) {
                    tag.setAttribute(`[style.${input.bindingName}]`, input.bindingFunction(input.name));
                }
            }
        });
        if (renderNode.shapes) {
            renderNode.shapes.forEach((shape) => {
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
                else {
                    path.setAttribute('fill', shape.fillColor);
                }
                tag.appendChild(svgElement);
            });
        }
        if (renderNode.children) {
            renderNode.children.forEach((childNode) => {
                const childTag = getContent(childNode);
                tag.appendChild(childTag);
            });
        }
        if (renderNode.type === 'TEXT') {
            if (renderNode.parameters && renderNode.parameters.find((p) => p.property === 'text-content')) {
                const param = renderNode.parameters.find((p) => p.property === 'text-content');
                tag.textContent = '{{' + param.name + '}}';
                let textType = 'string';
                if ((_a = param.description) === null || _a === void 0 ? void 0 : _a.startsWith('type:')) {
                    textType = param.description.split(':')[1];
                }
                inputs.push({
                    type: textType,
                    name: param.name,
                    default: textType === 'string' ? `'${renderNode.content}'` : `${renderNode.content}`,
                });
            }
            else if (renderNode.content) {
                tag.textContent = renderNode.content;
            }
        }
        if (renderNode.interactions) {
            const tapInteraction = renderNode.interactions.find((interaction) => interaction.property === 'tap-handler');
            if (tapInteraction) {
                tag.setAttribute('(click)', tapInteraction.name + '.emit($event)');
                outputs.push(tapInteraction.name);
            }
        }
        return tag;
    };
    const rootTag = getContent(component.renderNode);
    document.body.appendChild(rootTag);
    let htmlContent = document.body.innerHTML;
    htmlContent = prettier_1.default.format(htmlContent, { parser: 'html' });
    let style = '';
    const getClass = (renderNode) => {
        style += '.' + renderNode.id + ' {\n';
        for (let i in renderNode.css) {
            style += '\t' + i + ':' + renderNode.css[i] + ';\n';
        }
        style += '}\n';
        if (renderNode.children) {
            renderNode.children.forEach((childNode) => {
                getClass(childNode);
            });
        }
    };
    getClass(component.renderNode);
    const options = {
        name: component.renderNode.name.split(' ').join(''),
    };
    const inputString = inputs.reduce((prev, curr) => {
        return prev + `    @Input()\n    ${curr.name}:${curr.type} = ${curr.default}; \n`;
    }, '');
    const outputString = outputs.reduce((prev, curr) => {
        return prev + `    @Output()\n    ${curr}:EventEmitter<any> = new EventEmitter<any>(); \n`;
    }, '');
    options.htmlContent = htmlContent;
    options.css = style;
    options.inputs = inputs;
    options.inputString = inputString;
    options.outputString = outputString;
    options.componentSetImportPaths = '';
    options.componentSetImportClasses = '';
    options.typeDefinitions = ``;
    options.variantProperty = ``;
    options.renderNode = component.renderNode;
    return options;
}
//# sourceMappingURL=index.js.map