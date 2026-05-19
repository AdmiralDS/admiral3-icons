import { StrictMode, useState } from 'react';

import { themes, themeModes, typography, type ThemeMode } from '@admiral-ds/admiral3-tokens';
import { FontsSourceCodePro, FontsVTBGroup } from '@admiral-ds/admiral3-tokens/fonts';
import { createRoot } from 'react-dom/client';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';

import { playgroundScenarios } from './scenarios';
import '@admiral-ds/admiral3-tokens/css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Playground root container is missing');
}

const scenarioId = new URLSearchParams(window.location.search).get('scenario') ?? playgroundScenarios[0]?.id;
const scenario = playgroundScenarios.find((item) => item.id === scenarioId);
const cssThemeMode = (mode: ThemeMode) => mode.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
const playgroundThemeStorageKey = 'admiral-playground-theme';
const isThemeMode = (value: string | null): value is ThemeMode => themeModes.includes(value as ThemeMode);

const getStoredThemeMode = (): ThemeMode => {
  try {
    const storedThemeMode = window.localStorage.getItem(playgroundThemeStorageKey);

    return isThemeMode(storedThemeMode) ? storedThemeMode : 'light';
  } catch {
    return 'light';
  }
};

const storeThemeMode = (mode: ThemeMode) => {
  try {
    window.localStorage.setItem(playgroundThemeStorageKey, mode);
  } catch {
    // Keep the playground usable in restricted browser contexts.
  }
};

if (!scenario) {
  throw new Error(`Unknown playground scenario: ${scenarioId}`);
}

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    min-height: 100dvh;
    color: var(--admiral-color-text-neutral-text1-rest);
    background: var(--admiral-color-base-neutral-base1-rest);
    font-family: ${typography.primitives.fontFamily.primary};
  }

  #root {
    min-height: 100dvh;
  }
`;

const PlaygroundShell = styled.main`
  display: flex;
  flex-direction: column;
  align-items: start;
  min-height: 100dvh;
  padding: 12px;
  color: var(--admiral-color-text-neutral-text1-rest);
  background: var(--admiral-color-base-neutral-base1-rest);
`;

const PlaygroundHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: fit-content;
  gap: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--admiral-color-stroke-neutral-subtle-rest);
`;

const PageTitle = styled.h1`
  margin: 0;
  ${typography.textStyles.header.h5};
`;

const HeaderControls = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
`;

const ThemeLabel = styled.label`
  color: var(--admiral-color-text-neutral-text2-rest);
  ${typography.textStyles.body.body2Long};
`;

const ThemeSelect = styled.select`
  min-height: 32px;
  padding: 0 8px;
  color: var(--admiral-color-text-neutral-text1-rest);
  border: 1px solid var(--admiral-color-stroke-neutral-stroke1-rest);
  border-radius: var(--admiral-radius-by-base-4-medium);
  background: var(--admiral-color-base-neutral-base1-rest);
  ${typography.textStyles.body.body2Long};
`;

const PlaygroundLayout = styled.section<{ $isSidebarOpen: boolean }>`
  display: grid;
  grid-template-columns: ${({ $isSidebarOpen }) => ($isSidebarOpen ? '250px minmax(0, 1fr)' : 'minmax(0, 1fr)')};
  align-items: start;
  width: 100%;
  min-height: 100dvh;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const PlaygroundSidebar = styled.aside`
  align-self: start;
  height: 100%;
  padding: 4px;
  border-right: 1px solid var(--admiral-color-stroke-neutral-subtle-rest);

  @media (max-width: 900px) {
    padding-right: 0;
    padding-bottom: 20px;
    border-right: 0;
    border-bottom: 1px solid var(--admiral-color-stroke-neutral-subtle-rest);
  }
`;

const PlaygroundContent = styled.section`
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 8px;
  padding: 8px;

  @media (max-width: 900px) {
    padding-left: 0;
  }
`;

const PlaygroundToggle = styled.button`
  padding: 0;
  color: var(--admiral-color-text-neutral-text1-rest);
  text-decoration: underline;
  cursor: pointer;
  border: 0;
  background: var(--admiral-color-base-neutral-base1-rest);
  ${typography.textStyles.body.body2Long};

  &:hover {
    color: var(--admiral-color-text-primary-text1-hover);
  }
`;

const PlaygroundNav = styled.nav`
  display: grid;
  gap: 8px;
`;

const PlaygroundNavLink = styled.a`
  display: block;
  overflow: hidden;
  padding: 2px 0;
  color: var(--admiral-color-text-neutral-text1-rest);
  text-overflow: ellipsis;
  text-decoration: none;
  white-space: nowrap;
  transition: color 160ms ease;
  ${typography.textStyles.body.body2Long};

  &:hover,
  &[aria-current='page'] {
    color: var(--admiral-color-text-primary-text1-rest);
  }
`;

const PlaygroundPreview = styled.div`
  display: flex;
  align-items: flex-start;
  width: 100%;
  min-height: 100dvh;
  padding: 0;
`;

document.title = `${scenario.title} | Admiral Internal Playground`;

export const PlaygroundApp = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [themeMode, setThemeMode] = useState<ThemeMode>(getStoredThemeMode);

  const handleThemeModeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    storeThemeMode(mode);
  };

  return (
    <ThemeProvider theme={themes[themeMode]}>
      <GlobalStyle />
      <PlaygroundShell className="playground-shell" data-admiral-theme={cssThemeMode(themeMode)}>
        <PlaygroundHeader>
          <PageTitle>Internal E2E Playground</PageTitle>
          <HeaderControls>
            <ThemeLabel htmlFor="playground-theme">Theme</ThemeLabel>
            <ThemeSelect
              id="playground-theme"
              onChange={(event) => handleThemeModeChange(event.target.value as ThemeMode)}
              value={themeMode}
            >
              {themeModes.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </ThemeSelect>
            <PlaygroundToggle onClick={() => setIsSidebarOpen((value) => !value)} type="button">
              {isSidebarOpen ? 'Hide menu' : 'Show menu'}
            </PlaygroundToggle>
          </HeaderControls>
        </PlaygroundHeader>
        <PlaygroundLayout $isSidebarOpen={isSidebarOpen}>
          {isSidebarOpen ? (
            <PlaygroundSidebar>
              <PlaygroundNav aria-label="Playground scenarios">
                {playgroundScenarios.map((item) => {
                  const isActive = item.id === scenario.id;

                  return (
                    <PlaygroundNavLink
                      key={item.id}
                      aria-current={isActive ? 'page' : undefined}
                      href={`/?scenario=${encodeURIComponent(item.id)}`}
                      title={item.title}
                    >
                      {item.title}
                    </PlaygroundNavLink>
                  );
                })}
              </PlaygroundNav>
            </PlaygroundSidebar>
          ) : null}
          <PlaygroundContent>
            <div>
              {scenario.title} ({scenario.id})
            </div>
            <PlaygroundPreview>{scenario.render()}</PlaygroundPreview>
          </PlaygroundContent>
        </PlaygroundLayout>
      </PlaygroundShell>
    </ThemeProvider>
  );
};

createRoot(rootElement).render(
  <StrictMode>
    <FontsVTBGroup />
    <FontsSourceCodePro />
    <PlaygroundApp />
  </StrictMode>,
);
