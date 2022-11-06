import { strings } from '@angular-devkit/core';
import { join } from 'path';
import { getComponent } from './figma';
import { Artifact, ComponentInput, ComponentOptions, ComponentOutput } from './types';
import { JSDOM } from 'jsdom';
import { shapeToSVG } from '../import/util';
import prettier from 'prettier';

const validateNames = require('jsdom/lib/jsdom/living/helpers/validate-names.js');
const stringsHelper = require('jsdom/lib/jsdom/living/helpers/strings.js');

const asciiLowercase_ = stringsHelper.asciiLowercase;
stringsHelper.asciiLowercase = function (name: string) {
    if (name.startsWith('[')) {
        return name;
    }
    return asciiLowercase_(name);
};

const name_ = validateNames.name;
validateNames.name = function (name: string) {
    try {
        name_(name);
    } catch {}
};

const defaultOptions: ComponentOptions = {
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

export async function getArtifacts(root: string, fileKey: string, token: string): Promise<Artifact[]> {
    const artifacts: Artifact[] = [];
    const transformResult = await getComponent(join(root, 'assets', 'figma-relay'), '/assets/figma-relay', fileKey, token);

    const componentTransforms = transformResult.components;
    const componentSets = transformResult.componentSets;

    for (let componentSet of componentSets) {
        const componentSetArtifact: Artifact = { type: 'ComponentSet', children: [], name: componentSet.original.name, root };
        const subDir = 'figma-relay-' + strings.dasherize(componentSet.original.name) + '/variants/';
        let htmlContent = '';

        let componentSetImportClasses = '';
        let componentSetImportPaths = '';
        const firstComponentName = componentSet.original.children[0].originalName;
        const variantPropertyName = firstComponentName.split('=')[0];
        const variantNames = [];
        const allInputs: any[] = [];
        for (let component of componentSet.components) {
            const componentArtifact: Artifact = { type: 'Component', name: component.renderNode.name, root, subDir };
            const options = getComponentOptions(component);
            const tagName = 'figma-relay-' + strings.dasherize(component.renderNode.name) + '-component';

            const inputString = options.inputs.reduce((prev: string, input: any) => {
                return prev + `[${input.name}]="${input.name}" `;
            }, '');

            htmlContent += `<${tagName} *ngIf="${variantPropertyName}=='${component.renderNode.name}'" ${inputString}></${tagName}>`;

            const className = strings.classify(component.renderNode.name) + 'Component';
            componentSetImportClasses += className + ',';

            variantNames.push(component.renderNode.name);
            const n = 'figma-relay-' + strings.dasherize(component.renderNode.name);
            const i = `import { ${className} } from './variants/${n}/${n}.component';`;
            componentSetImportPaths += i + '\n';

            options.inputs.forEach((inp: ComponentInput) => {
                if (!allInputs.find((input) => input.name === inp.name)) {
                    allInputs.push(inp);
                }
            });

            componentArtifact.options = options;
            componentSetArtifact.children?.push(componentArtifact);
        }

        const componentSetOptions: ComponentOptions = { ...defaultOptions };

        allInputs.push({
            name: variantPropertyName,
            type: strings.classify(variantPropertyName) + 'Type',
            default: `'${variantNames[0]}'`,
        });
        componentSetOptions.htmlContent = htmlContent;
        componentSetOptions.css = '';
        componentSetOptions.inputs = allInputs;
        componentSetOptions.typeDefinitions = `export type ${strings.classify(variantPropertyName)}Type = '${variantNames.join("' | '")}';`;
        componentSetOptions.name = componentSet.original.name;
        componentSetOptions.componentSetImportPaths = componentSetImportPaths;
        componentSetOptions.componentSetImportClasses = componentSetImportClasses;

        componentSetArtifact.options = componentSetOptions;
        artifacts.push(componentSetArtifact);
    }

    for (let component of componentTransforms) {
        const options = getComponentOptions(component);
        const componentArtifact: Artifact = { name: component.renderNode.name, type: 'Component', options, root };
        artifacts.push(componentArtifact);
    }
    return artifacts;
}

function getComponentOptions(component: any): ComponentOptions {
    const inputs: ComponentInput[] = [];
    const outputs: ComponentOutput[] = [];

    component.renderNode.isRoot = true;

    let dom = new JSDOM('');
    const document = dom.window.document;

    const getContent = (renderNode: any) => {
        const tag = document.createElement('div');
        tag.classList.add(renderNode.id);
        renderNode.inputs.forEach((input: any) => {
            if (input.bindingType === 'STYLE') {
                inputs.push({
                    type: input.type,
                    name: input.name,
                    default: input.default,
                });

                if (input.bindingUnit) {
                    tag.setAttribute(`[style.${input.bindingName}]`, `${input.name} + '${input.bindingUnit}'`);
                } else if (input.bindingFunction) {
                    tag.setAttribute(`[style.${input.bindingName}]`, input.bindingFunction(input.name));
                }
            }
        });

        renderNode.shapes?.forEach((shape: any) => {
            const svgElement = shapeToSVG(document, shape);
            tag.appendChild(svgElement);
        });

        renderNode.children?.forEach((childNode: any) => {
            const childTag = getContent(childNode);
            tag.appendChild(childTag);
        });

        if (renderNode.type === 'TEXT') {
            if (renderNode.parameters && renderNode.parameters.find((p: any) => p.property === 'text-content')) {
                const param = renderNode.parameters.find((p: any) => p.property === 'text-content');
                tag.textContent = '{{' + param.name + '}}';
                let textType = 'string';
                if (param.description?.startsWith('type:')) {
                    textType = param.description.split(':')[1];
                }
                inputs.push({
                    type: textType,
                    name: param.name,
                    default: textType === 'string' ? `'${renderNode.content}'` : `${renderNode.content}`,
                });
            } else if (renderNode.content) {
                tag.textContent = renderNode.content;
            }
        }

        if (renderNode.interactions) {
            const tapInteraction = renderNode.interactions.find((interaction: any) => interaction.property === 'tap-handler');
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
    htmlContent = prettier.format(htmlContent, { parser: 'html' });

    let style = '';
    const getClass = (renderNode: any) => {
        style += '.' + renderNode.id + ' {\n';
        for (let i in renderNode.css) {
            style += '\t' + i + ':' + renderNode.css[i] + ';\n';
        }
        style += '}\n';
        if (renderNode.children) {
            renderNode.children.forEach((childNode: any) => {
                getClass(childNode);
            });
        }
    };

    getClass(component.renderNode);

    const options = { ...defaultOptions };
    options.name = component.renderNode.name.split(' ').join('');
    options.htmlContent = htmlContent;
    options.css = style;
    options.inputs = inputs;
    options.renderNode = component.renderNode;
    return options;
}
