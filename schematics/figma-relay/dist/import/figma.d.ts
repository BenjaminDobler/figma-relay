import { RenderNode } from './types';
export declare function getComponent(aDir: string, relativeADir: string, fileKey: string, token: string): Promise<{
    components: {
        renderNode: RenderNode;
    }[];
    componentSets: any[];
}>;
