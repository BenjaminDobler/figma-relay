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
Object.defineProperty(exports, "__esModule", { value: true });
exports.importComponent = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const inquirer = __importStar(require("inquirer"));
const core_1 = require("@angular-devkit/core");
const workspace_1 = require("@schematics/angular/utility/workspace");
const figma_relay_1 = require("../figma-relay");
function importComponent(schematicOptions) {
    return (tree, _context) => __awaiter(this, void 0, void 0, function* () {
        var _a;
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
            tree.create('.figma-relay', JSON.stringify(config));
        }
        if (!(((_a = config.files) === null || _a === void 0 ? void 0 : _a.length) > 0)) {
            const fileQustion = [
                {
                    message: 'Please provide the link to a Figma file.',
                    name: 'file',
                },
            ];
            const fileAnswer = yield inquirer.prompt(fileQustion);
            config.files = [{ url: fileAnswer.file }];
            tree.overwrite('.figma-relay', JSON.stringify(config));
        }
        const workspace = yield (0, workspace_1.getWorkspace)(tree);
        const project = workspace.projects.get(schematicOptions.project);
        const srcRoot = project === null || project === void 0 ? void 0 : project.sourceRoot;
        let artifacts = [];
        for (let file of config.files) {
            let fileKey = file.url.substring(27);
            fileKey = fileKey.substring(0, fileKey.indexOf('/'));
            const a = yield (0, figma_relay_1.getArtifacts)(srcRoot, fileKey, config.token);
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
//# sourceMappingURL=index.js.map