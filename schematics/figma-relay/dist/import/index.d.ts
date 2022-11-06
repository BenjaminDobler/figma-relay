import { Rule } from '@angular-devkit/schematics';
interface ImportOptions {
    project: string;
    componentPrefix: string;
    token: string;
}
export declare function importComponent(schematicOptions: ImportOptions): Rule;
export {};
