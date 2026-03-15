#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const commands = {
  init: () => {
    console.log('Initializing Navilo...');    

    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      if (!dependencies['react-router-dom'] || dependencies['react-router-dom'] !== '^6.16.0') {
        console.log('Installing react-router-dom@^6.16.0...');
        execSync('npm install react-router-dom@^6.16.0', { stdio: 'inherit' });
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
            viteConfig = "import navilo from 'navilo';\n" + viteConfig;
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
  commands[command]();
} else {
  console.log('Unknown command. Available commands: init');
}
