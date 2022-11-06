import { Rule, SchematicContext, Tree, url, template, apply, mergeWith, move, chain, MergeStrategy } from '@angular-devkit/schematics';
import * as inquirer from 'inquirer';
import { strings } from '@angular-devkit/core';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import { Artifact } from '../figma-relay/types';
import { getArtifacts } from '../figma-relay';

interface ImportOptions {
    project: string;
    componentPrefix: string;
    token: string;
}

export function importComponent(schematicOptions: ImportOptions): Rule {
    return async (tree: Tree, _context: SchematicContext) => {
        let config: any;
        const chainsOps: any = [];
        if (tree.exists('.figma-relay')) {
            config = tree.readJson('.figma-relay');
        } else {
            console.log('figma config does not exist!');

            const question = [
                {
                    message: 'Please provide your Figma API token.',
                    name: 'token',
                },
            ];
            const answer = await inquirer.prompt(question);

            config = { token: answer.token };
            tree.create('.figma-relay', JSON.stringify(config));
        }

        if (!(config.files?.length > 0)) {
            const fileQustion = [
                {
                    message: 'Please provide the link to a Figma file.',
                    name: 'file',
                },
            ];
            const fileAnswer = await inquirer.prompt(fileQustion);
            config.files = [{ url: fileAnswer.file }];
            tree.overwrite('.figma-relay', JSON.stringify(config));
        }

        const workspace = await getWorkspace(tree);
        const project = workspace.projects.get(schematicOptions.project);
        const srcRoot = project?.sourceRoot as string;

        let artifacts: Artifact[] = [];
        for (let file of config.files) {
            let fileKey = file.url.substring(27);
            fileKey = fileKey.substring(0, fileKey.indexOf('/'));
            const a = await getArtifacts(srcRoot, fileKey, config.token);
            artifacts.push(...a);
        }

        const questions = [
            {
                message: 'Which components do you want to import/update',
                type: 'checkbox',
                name: 'components',
                choices: artifacts.map((artifact) => artifact.name),
            },
        ];
        const answer = await inquirer.prompt(questions);

        const artifactsToBuild = artifacts.filter((artifact) => answer.components.includes(artifact.name));
        artifactsToBuild.forEach((artifact) => {
            artifact.children?.forEach((childArtifact) => {
                chainsOps.push(addFiles(childArtifact.options, childArtifact.root as string, childArtifact.subDir));
            });
            chainsOps.push(addFiles(artifact.options, artifact.root as string, artifact.subDir));
        });
        return chain(chainsOps);
    };
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
    );
}
