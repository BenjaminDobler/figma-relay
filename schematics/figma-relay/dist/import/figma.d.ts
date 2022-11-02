export interface ColorStyle {
    r: number;
    g: number;
    b: number;
    a: number;
}
export declare function getComponent(aDir: string, relativeADir: string, fileKey: string, token: string): Promise<{
    components: {
        renderNode: any;
    }[];
    componentSets: any[];
}>;
