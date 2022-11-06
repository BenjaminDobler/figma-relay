export interface ComponentInput {
    name: string;
    type: string;
    default: string;
}
export interface ComponentOutput {
    name: string;
    type: string;
}
export interface ComponentOptions {
    name: string;
    outputs: ComponentOutput[];
    inputs: ComponentInput[];
    htmlContent: string;
    css: string;
    componentSetImportPaths: string;
    componentSetImportClasses: string;
    typeDefinitions: string;
    renderNode: any;
}
export interface RelayParameter {
    name: string;
    property: string;
    description: string;
    type: string;
}
export interface ColorStyle {
    r: number;
    g: number;
    b: number;
    a: number;
}
export interface RenderNodeInput {
    name: string;
    type: string;
    bindingType: string;
    bindingName: string;
    bindingFunction?: (val: string) => string;
    bindingUnit?: string;
    default: string;
}
export interface RenderNodeShape {
    path: string;
    fillColor?: string;
    imagePattern?: {
        url: string;
    };
}
export interface RenderNode {
    id?: string;
    type?: string;
    name?: string;
    parameters?: RelayParameter[];
    interactions?: any[];
    originalNode?: any;
    content?: string;
    inputs?: RenderNodeInput[];
    autoLayout?: boolean;
    shapes?: RenderNodeShape[];
    children?: RenderNode[];
    css?: any;
}
export interface Artifact {
    type: 'Component' | 'ComponentSet';
    children?: Artifact[];
    root?: string;
    subDir?: string;
    options?: ComponentOptions;
    name?: string;
    sourceFile?: string;
}
