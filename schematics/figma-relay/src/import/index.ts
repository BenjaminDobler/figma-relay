import { Rule, SchematicContext, Tree, url, template, apply, mergeWith, move, chain, MergeStrategy } from '@angular-devkit/schematics'
import * as inquirer from 'inquirer'
import { strings } from '@angular-devkit/core'
import { getWorkspace } from '@schematics/angular/utility/workspace'
import { getComponent } from './figma'

import { join } from 'path'
import prettier from 'prettier'

const stringsHelper = require('jsdom/lib/jsdom/living/helpers/strings.js')
const asciiLowercase_ = stringsHelper.asciiLowercase
stringsHelper.asciiLowercase = function (name: string) {
    if (name.startsWith('[')) {
        return name
    }
    return asciiLowercase_(name)
}
import { JSDOM } from 'jsdom'

const validateNames = require('jsdom/lib/jsdom/living/helpers/validate-names.js')

const name_ = validateNames.name
validateNames.name = function (name: string) {
    try {
        name_(name)
    } catch {}
}

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function importComponent(_options: any): Rule {
    return async (tree: Tree, _context: SchematicContext) => {
        let config: any
        const chainsOps = []
        if (tree.exists('.figma-relay')) {
            config = tree.readJson('.figma-relay')
        } else {
            console.log('figma config does not exist!')

            const question = [
                {
                    message: 'Please provide your Figma API token.',
                    name: 'token',
                },
            ]
            const answer = await inquirer.prompt(question)

            config = { token: answer.token }

            const fileQustion = [
                {
                    message: 'Please provide the link to your Figma file.',
                    name: 'file',
                },
            ]
            const fileAnswer = await inquirer.prompt(fileQustion)
            config.file = fileAnswer.file
            tree.create('.figma-relay', JSON.stringify(config))
        }

        if (!config.file) {
            const fileQustion = [
                {
                    message: 'Please provide the link to your Figma file.',
                    name: 'file',
                },
            ]
            const fileAnswer = await inquirer.prompt(fileQustion)
            config.file = fileAnswer.file
            tree.overwrite('.figma-relay', JSON.stringify(config))
        }

        let fileKey = config.file.substring(27)
        fileKey = fileKey.substring(0, fileKey.indexOf('/'))

        const workspace = await getWorkspace(tree)
        const project = workspace.projects.get('demo')

        const srcRoot = project?.sourceRoot as string

        const transformResult = await getComponent(join(srcRoot, 'assets', 'figma-relay'), '/assets/figma-relay', fileKey, config.token)

        const componentTransforms = transformResult.components
        const componentSets = transformResult.componentSets

        for (let componentSet of componentSets) {
            console.log('Component set', componentSet.original.name)
            console.log(strings.dasherize(componentSet.original.name))
            const subDir = 'figma-relay-' + strings.dasherize(componentSet.original.name) + '/variants/'

            let htmlContent = ''

            let componentSetImportClasses = ''
            let componentSetImportPaths = ''
            const firstComponentName = componentSet.original.children[0].originalName
            console.log(firstComponentName);
            const variantPropertyName = firstComponentName.split('=')[0]
            const variantNames = []

            for (let component of componentSet.components) {
                const options = getComponentOptions(component)
                chainsOps.push(addFiles(options, project?.sourceRoot as string, subDir))
                const tagName = 'figma-relay-' + strings.dasherize(component.renderNode.name) + '-component'
                htmlContent += `<${tagName} *ngIf="${variantPropertyName}=='${component.renderNode.name}'"></${tagName}>`

                const className = strings.classify(component.renderNode.name) + 'Component'
                componentSetImportClasses += className + ','

                //console.log('component name ', component.renderNode.name);
                variantNames.push(component.renderNode.name)

                const n = 'figma-relay-' + strings.dasherize(component.renderNode.name)
                const i = `import { ${className} } from './variants/${n}/${n}.component';`

                componentSetImportPaths += i + '\n'
            }

            const options: any = {
                htmlContent: htmlContent,
            }
            options.css = ''
            options.inputs = []
            options.inputString = ''
            options.outputString = ''
            
            options.typeDefinitions = `export type ${strings.classify(variantPropertyName)}Type = '${variantNames.join("' | '")}';`
            options.variantProperty = `@Input()\n${variantPropertyName}: ${strings.classify(variantPropertyName)}Type = '${variantNames[0]}'`
            console.log(options.typeDefinitions)

            ;(options.name = componentSet.original.name.split(' ').join('')), (options.componentSetImportPaths = componentSetImportPaths)
            options.componentSetImportClasses = componentSetImportClasses

            chainsOps.push(addFiles(options, project?.sourceRoot as string))
        }

        const questions = [
            {
                message: 'Which components do you want to import/update',
                type: 'checkbox',
                name: 'components',
                choices: componentTransforms.map((c: any) => c.renderNode.name),
            },
        ]
        const answer = await inquirer.prompt(questions)

        for (let component of componentTransforms) {
            if (answer.components.includes(component.renderNode.name)) {
                const options = getComponentOptions(component)
                chainsOps.push(addFiles(options, project?.sourceRoot as string))
            }
        }
        return chain(chainsOps)
    }
}

function addFiles(options: any, outDir: string, subDir?: string) {
    return mergeWith(
        apply(url(`./files`), [
            template({
                tmpl: '',
                ...options,
                ...strings,
            }),
            subDir ? move(outDir + '/app/generated/' + subDir) : move(outDir + '/app/generated/'),
        ]),
        MergeStrategy.Overwrite
    )
}

function getComponentOptions(component: any) {
    const inputs: any = []
    const outputs: any = []

    component.renderNode.isRoot = true

    let dom = new JSDOM('')
    const document = dom.window.document

    const getContent = (renderNode: any) => {
        const tag = document.createElement('div')
        tag.classList.add(renderNode.id)
        renderNode.inputs.forEach((input: any) => {
            if (input.bindingType === 'STYLE') {
                inputs.push({
                    type: input.type,
                    name: input.name,
                    default: input.default,
                })

                if (input.bindingUnit) {
                    tag.setAttribute(`[style.${input.bindingName}]`, `${input.name} + '${input.bindingUnit}'`)
                } else if (input.bindingFunction) {
                    tag.setAttribute(`[style.${input.bindingName}]`, input.bindingFunction(input.name))
                }
            }
        })

        if (renderNode.shapes) {
            renderNode.shapes.forEach((shape: any) => {
                let svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
                svgElement.setAttribute('width', '413')
                svgElement.setAttribute('height', '392')
                svgElement.setAttribute('viewBox', '0 0 413 392')

                let path = document.createElement('path')
                path.setAttribute('d', shape.path)
                path.setAttribute('fill', '#00ff00') // TODO find real value
                svgElement.appendChild(path)

                if (shape.imagePattern) {
                    const patternID = 'pattern0'
                    const imageID = 'image0'
                    let defs = document.createElement('defs')
                    let pattern = document.createElement('pattern')
                    pattern.setAttribute('id', patternID)
                    pattern.setAttribute('patternContentUnits', 'objectBoundingBox')
                    pattern.setAttribute('width', '1')
                    pattern.setAttribute('height', '1')
                    path.setAttribute('fill', `url(#${patternID})`)
                    defs.appendChild(pattern)
                    let use = document.createElement('use')
                    use.setAttribute('xlink:href', '#' + imageID)
                    pattern.appendChild(use)
                    let image = document.createElement('image')
                    image.setAttribute('id', imageID)
                    image.setAttribute('xlink:href', shape.imagePattern.url)
                    image.setAttribute('width', '378') // TODO find real value
                    image.setAttribute('height', '378') // TODO find real value
                    defs.appendChild(image)
                    svgElement.appendChild(defs)
                } else {
                    path.setAttribute('fill', shape.fillColor)
                }
                tag.appendChild(svgElement)
            })
        }

        if (renderNode.children) {
            renderNode.children.forEach((childNode: any) => {
                const childTag = getContent(childNode)
                tag.appendChild(childTag)
            })
        }

        if (renderNode.type === 'TEXT') {
            if (renderNode.parameters && renderNode.parameters.find((p: any) => p.property === 'text-content')) {
                const param = renderNode.parameters.find((p: any) => p.property === 'text-content')
                tag.textContent = '{{' + param.name + '}}'
                let textType = 'string'
                if (param.description?.startsWith('type:')) {
                    textType = param.description.split(':')[1]
                }
                inputs.push({
                    type: textType,
                    name: param.name,
                    default: textType === 'string' ? `'${renderNode.content}'` : `${renderNode.content}`,
                })
            } else if (renderNode.content) {
                tag.textContent = renderNode.content
            }
        }

        if (renderNode.interactions) {
            const tapInteraction = renderNode.interactions.find((interaction: any) => interaction.property === 'tap-handler')
            if (tapInteraction) {
                tag.setAttribute('(click)', tapInteraction.name + '.emit($event)')
                outputs.push(tapInteraction.name)
            }
        }

        return tag
    }

    const rootTag = getContent(component.renderNode)
    document.body.appendChild(rootTag)

    let htmlContent = document.body.innerHTML
    htmlContent = prettier.format(htmlContent, { parser: 'html' })

    let style = ''
    const getClass = (renderNode: any) => {
        style += '.' + renderNode.id + ' {\n'
        for (let i in renderNode.css) {
            style += '\t' + i + ':' + renderNode.css[i] + ';\n'
        }
        style += '}\n'
        if (renderNode.children) {
            renderNode.children.forEach((childNode: any) => {
                getClass(childNode)
            })
        }
    }

    getClass(component.renderNode)

    const options: any = {
        name: component.renderNode.name.split(' ').join(''),
    }

    const inputString = inputs.reduce((prev: any, curr: any) => {
        return prev + `    @Input()\n    ${curr.name}:${curr.type} = ${curr.default}; \n`
    }, '')

    const outputString = outputs.reduce((prev: string, curr: string) => {
        return prev + `    @Output()\n    ${curr}:EventEmitter<any> = new EventEmitter<any>(); \n`
    }, '')

    options.htmlContent = htmlContent
    options.css = style
    options.inputs = inputs
    options.inputString = inputString
    options.outputString = outputString
    options.componentSetImportPaths = ''
    options.componentSetImportClasses = ''
    options.typeDefinitions = ``;
    options.variantProperty = ``;

    options.renderNode = component.renderNode
    return options
}
