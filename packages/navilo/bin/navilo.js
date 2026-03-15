#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const SUPPORTED_PACKAGE_MANAGERS = ['pnpm', 'yarn', 'npm', 'bun'];

function parsePackageManagerArg(argv) {
    const pmEqArg = argv.find((arg) => arg.startsWith('--pm='));
    if (pmEqArg) return pmEqArg.split('=')[1]?.trim();

    const packageManagerEqArg = argv.find((arg) => arg.startsWith('--package-manager='));
    if (packageManagerEqArg) return packageManagerEqArg.split('=')[1]?.trim();

    const pmIndex = argv.findIndex((arg) => arg === '--pm');
    if (pmIndex !== -1) return argv[pmIndex + 1]?.trim();

    const packageManagerIndex = argv.findIndex((arg) => arg === '--package-manager');
    if (packageManagerIndex !== -1) return argv[packageManagerIndex + 1]?.trim();

    return null;
}

function detectPackageManagerFromLockFiles(cwd) {
    if (fs.existsSync(path.join(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
    if (fs.existsSync(path.join(cwd, 'yarn.lock'))) return 'yarn';
    if (fs.existsSync(path.join(cwd, 'bun.lockb')) || fs.existsSync(path.join(cwd, 'bun.lock'))) return 'bun';
    if (fs.existsSync(path.join(cwd, 'package-lock.json'))) return 'npm';
    return 'npm';
}

function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(query, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

async function resolvePackageManager() {
    const pmFromArgs = parsePackageManagerArg(process.argv.slice(3));

    if (pmFromArgs) {
        if (!SUPPORTED_PACKAGE_MANAGERS.includes(pmFromArgs)) {
            throw new Error(
                `Invalid package manager "${pmFromArgs}". Use one of: ${SUPPORTED_PACKAGE_MANAGERS.join(', ')}`
            );
        }
        return pmFromArgs;
    }

    const detected = detectPackageManagerFromLockFiles(process.cwd());
    const answer = await askQuestion(
        `Choose package manager [pnpm/yarn/npm/bun] (default: ${detected}): `
    );

    if (!answer) return detected;

    if (!SUPPORTED_PACKAGE_MANAGERS.includes(answer)) {
        console.log(`Invalid selection "${answer}". Falling back to ${detected}.`);
        return detected;
    }

    return answer;
}

function installDependency(packageManager, pkg) {
    const installCommands = {
        npm: `npm install ${pkg}`,
        pnpm: `pnpm add ${pkg}`,
        yarn: `yarn add ${pkg}`,
        bun: `bun add ${pkg}`,
    };

    execSync(installCommands[packageManager], { stdio: 'inherit' });
}

const commands = {
    init: async () => {
        console.log('Initializing Navilo...');

        const packageManager = await resolvePackageManager();
        console.log(`Using package manager: ${packageManager}`);

        const packageJsonPath = path.join(process.cwd(), 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
            const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

            if (!dependencies['navilo']) {
                console.log('Installing navilo...');
                installDependency(packageManager, 'navilo');
            }

            if (!dependencies['react-router-dom'] || dependencies['react-router-dom'] !== '^6.16.0') {
                console.log('Installing react-router-dom@^6.16.0...');
                installDependency(packageManager, 'react-router-dom@^6.16.0');
            }
        } else {
            console.log('package.json not found. Please run in a valid project directory.');
            return;
        }

        const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
        if (fs.existsSync(viteConfigPath)) {
            let viteConfig = fs.readFileSync(viteConfigPath, 'utf-8');
            if (!viteConfig.includes('navilo(')) {
                viteConfig = viteConfig.replace(/plugins: \[(.*)\]/s, (match, plugins) => {
                    return `plugins: [${plugins.trim()}, navilo({ pagesDir: 'src/app' })]`;
                });
                viteConfig = "import {navilo} from 'navilo';\n" + viteConfig;
                fs.writeFileSync(viteConfigPath, viteConfig);
                console.log('Updated vite.config.ts');
            }
        } else {
            console.log('vite.config.ts not found. Please ensure you are in a Vite project.');
        }

        const viteEnvDtsPath = path.join(process.cwd(), 'src/vite-env.d.ts');
        const declaration = `/// <reference types="vite/client" />
declare module 'virtual:navilo-routes' {
    export const router;
}
`;
        if (fs.existsSync(viteEnvDtsPath)) {
            let content = fs.readFileSync(viteEnvDtsPath, 'utf-8');
            if (!content.includes('virtual:navilo-routes')) {
                content += '\n' + declaration;
                fs.writeFileSync(viteEnvDtsPath, content);
            }
        } else {
            fs.writeFileSync(viteEnvDtsPath, declaration);
        }
        console.log('Updated/created vite-env.d.ts');


        const appFilePath = path.join(process.cwd(), 'src/App.tsx');
        if (fs.existsSync(appFilePath)) {
            let appFileContent = fs.readFileSync(appFilePath, 'utf-8');
            if (!appFileContent.includes('virtual:navilo-routes')) {
                appFileContent = `import { RouterProvider } from "react-router-dom";
import { router } from 'virtual:navilo-routes';

export function App() {
    return (
        <RouterProvider router={router} />
    );
}
`;
                fs.writeFileSync(appFilePath, appFileContent);
                console.log('Updated App.tsx');
            }
        } else {
            console.log('src/App.tsx not found. You will need to manually set up the router provider.');
        }

        console.log('Navilo initialization complete! 🎉');
    },
};

const command = process.argv[2];

if (commands[command]) {
    Promise.resolve(commands[command]())
        .catch((error) => {
            console.error(error.message);
            process.exit(1);
        });
} else {
    console.log('Unknown command. Available commands: init');
}
