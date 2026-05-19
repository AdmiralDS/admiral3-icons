import { Code, Page, Panel, Text } from './storyComponents';

const viteExample = `
import svgr from 'vite-plugin-svgr';

export default {
  plugins: [svgr()],
};
`;

const svgModuleExample = `
/// <reference types="vite-plugin-svgr/client" />
`;

export const LoadersTemplate = () => (
  <Page>
    <Text>
      В проектах на Vite для импорта SVG как React-компонентов используется `vite-plugin-svgr`.
      <Panel>
        <Code>{viteExample}</Code>
      </Panel>
      Для TypeScript нужно подключить декларации SVG-модулей. В этом пакете они подключены в `src/vite-env.d.ts`.
      <Panel>
        <Code>{svgModuleExample}</Code>
      </Panel>
      <ul>
        <li>
          <a href="https://react-svgr.com/docs/getting-started/">SVGR - Getting started</a>
        </li>
        <li>
          <a href="https://www.npmjs.com/package/vite-plugin-svgr">vite-plugin-svgr - npm</a>
        </li>
      </ul>
    </Text>
  </Page>
);
