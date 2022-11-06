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
const jsdom_1 = require("jsdom");
const util_1 = require("./util");
const path_1 = require("path");
const prettier_1 = __importDefault(require("prettier"));
const validateNames = require('jsdom/lib/jsdom/living/helpers/validate-names.js');
const stringsHelper = require('jsdom/lib/jsdom/living/helpers/strings.js');
const defaultOptions = {
    name: '',
    outputs: [],
    inputs: [],
    htmlContent: '',
    componentSetImportClasses: '',
    componentSetImportPaths: '',
    typeDefinitions: '',
    css: '',
    renderNode: {},
};
const asciiLowercase_ = stringsHelper.asciiLowercase;
stringsHelper.asciiLowercase = function (name) {
    if (name.startsWith('[')) {
        return name;
    }
    return asciiLowercase_(name);
};
const name_ = validateNames.name;
validateNames.name = function (name) {
    try {
        name_(name);
    }
    catch (_a) { }
};
// You don't have to export the function as default. You can also have more than one rule factory
// per file.
function importComponent(schematicOptions) {
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
                    message: 'Please provide the link to a Figma file.',
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
        const project = workspace.projects.get(schematicOptions.project);
        const srcRoot = project === null || project === void 0 ? void 0 : project.sourceRoot;
        const artifacts = yield getArtifacts(srcRoot, fileKey, config.token);
        const questions = [
            {
                message: 'Which components do you want to import/update',
                type: 'checkbox',
                name: 'components',
                choices: artifacts.map((artifact) => artifact.name),
            },
        ];
        const answer = yield inquirer.prompt(questions);
        const artifactsToBuild = artifacts.filter((artifact) => answer.components.includes(artifact.name));
        artifactsToBuild.forEach((artifact) => {
            var _a;
            (_a = artifact.children) === null || _a === void 0 ? void 0 : _a.forEach((childArtifact) => {
                chainsOps.push(addFiles(childArtifact.options, childArtifact.root, childArtifact.subDir));
            });
            chainsOps.push(addFiles(artifact.options, artifact.root, artifact.subDir));
        });
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
function getArtifacts(root, fileKey, token) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const artifacts = [];
        const transformResult = yield (0, figma_1.getComponent)((0, path_1.join)(root, 'assets', 'figma-relay'), '/assets/figma-relay', fileKey, token);
        const componentTransforms = transformResult.components;
        const componentSets = transformResult.componentSets;
        for (let componentSet of componentSets) {
            const componentSetArtifact = { type: 'ComponentSet', children: [], name: componentSet.original.name, root };
            const subDir = 'figma-relay-' + core_1.strings.dasherize(componentSet.original.name) + '/variants/';
            let htmlContent = '';
            let componentSetImportClasses = '';
            let componentSetImportPaths = '';
            const firstComponentName = componentSet.original.children[0].originalName;
            const variantPropertyName = firstComponentName.split('=')[0];
            const variantNames = [];
            const allInputs = [];
            for (let component of componentSet.components) {
                const componentArtifact = { type: 'Component', name: component.renderNode.name, root, subDir };
                const options = getComponentOptions(component);
                const tagName = 'figma-relay-' + core_1.strings.dasherize(component.renderNode.name) + '-component';
                const inputString = options.inputs.reduce((prev, input) => {
                    return prev + `[${input.name}]="${input.name}" `;
                }, '');
                htmlContent += `<${tagName} *ngIf="${variantPropertyName}=='${component.renderNode.name}'" ${inputString}></${tagName}>`;
                const className = core_1.strings.classify(component.renderNode.name) + 'Component';
                componentSetImportClasses += className + ',';
                variantNames.push(component.renderNode.name);
                const n = 'figma-relay-' + core_1.strings.dasherize(component.renderNode.name);
                const i = `import { ${className} } from './variants/${n}/${n}.component';`;
                componentSetImportPaths += i + '\n';
                options.inputs.forEach((inp) => {
                    if (!allInputs.find((input) => input.name === inp.name)) {
                        allInputs.push(inp);
                    }
                });
                componentArtifact.options = options;
                (_a = componentSetArtifact.children) === null || _a === void 0 ? void 0 : _a.push(componentArtifact);
            }
            const componentSetOptions = Object.assign({}, defaultOptions);
            allInputs.push({
                name: variantPropertyName,
                type: core_1.strings.classify(variantPropertyName) + 'Type',
                default: `'${variantNames[0]}'`,
            });
            componentSetOptions.htmlContent = htmlContent;
            componentSetOptions.css = '';
            componentSetOptions.inputs = allInputs;
            componentSetOptions.typeDefinitions = `export type ${core_1.strings.classify(variantPropertyName)}Type = '${variantNames.join("' | '")}';`;
            componentSetOptions.name = componentSet.original.name;
            componentSetOptions.componentSetImportPaths = componentSetImportPaths;
            componentSetOptions.componentSetImportClasses = componentSetImportClasses;
            componentSetArtifact.options = componentSetOptions;
            artifacts.push(componentSetArtifact);
        }
        for (let component of componentTransforms) {
            const options = getComponentOptions(component);
            const componentArtifact = { name: component.renderNode.name, type: 'Component', options, root };
            artifacts.push(componentArtifact);
        }
        return artifacts;
    });
}
function getComponentOptions(component) {
    const inputs = [];
    const outputs = [];
    component.renderNode.isRoot = true;
    let dom = new jsdom_1.JSDOM('');
    const document = dom.window.document;
    const getContent = (renderNode) => {
        var _a, _b, _c;
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
        (_a = renderNode.shapes) === null || _a === void 0 ? void 0 : _a.forEach((shape) => {
            const svgElement = (0, util_1.shapeToSVG)(document, shape);
            tag.appendChild(svgElement);
        });
        (_b = renderNode.children) === null || _b === void 0 ? void 0 : _b.forEach((childNode) => {
            const childTag = getContent(childNode);
            tag.appendChild(childTag);
        });
        if (renderNode.type === 'TEXT') {
            if (renderNode.parameters && renderNode.parameters.find((p) => p.property === 'text-content')) {
                const param = renderNode.parameters.find((p) => p.property === 'text-content');
                tag.textContent = '{{' + param.name + '}}';
                let textType = 'string';
                if ((_c = param.description) === null || _c === void 0 ? void 0 : _c.startsWith('type:')) {
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
                outputs.push({
                    name: tapInteraction.name,
                    type: 'any',
                });
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
    const options = Object.assign({}, defaultOptions);
    (options.name = component.renderNode.name.split(' ').join('')), (options.htmlContent = htmlContent);
    options.css = style;
    options.inputs = inputs;
    options.componentSetImportPaths = '';
    options.componentSetImportClasses = '';
    options.typeDefinitions = ``;
    options.renderNode = component.renderNode;
    return options;
}
//# sourceMappingURL=index.js.map