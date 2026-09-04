/**
 * Water Sort Master — entry point + minimal screen router.
 * No navigation library needed: a small screen stack drives everything, so
 * "back" always returns to wherever a screen was actually opened from.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler, StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initAds } from './src/ads/ads';
import Game from './src/screens/game/Game';
import Home from './src/screens/home/Home';
import Levels from './src/screens/levels/Levels';
import Settings from './src/screens/settings/Settings';
import Themes from './src/screens/themes/Themes';
import { AppStateProvider, useApp } from './src/state/AppState';

type Screen = 'home' | 'levels' | 'settings' | 'themes' | 'game';

function Router(): React.JSX.Element {
  const { ready, theme } = useApp();
  const [stack, setStack] = useState<Screen[]>(['home']);
  const [level, setLevel] = useState(1);

  const push = useCallback((s: Screen) => setStack(st => [...st, s]), []);
  // The stack never empties: Home is the floor.
  const pop = useCallback(
    () => setStack(st => (st.length > 1 ? st.slice(0, -1) : st)),
    [],
  );
  const goHome = useCallback(() => setStack(['home']), []);

  const openLevel = useCallback(
    (n: number) => {
      setLevel(n);
      push('game');
    },
    [push],
  );

  // Android's hardware back button walks the same stack. Returning false on
  // Home lets the system default (leave the app) take over.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stack.length <= 1) return false;
      pop();
      return true;
    });
    return () => sub.remove();
  }, [stack.length, pop]);

  // Hold the first frame until the save file is read, otherwise the menu
  // flashes "level 1" before the real progress arrives.
  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: theme.bgTop }} />;
  }

  switch (stack[stack.length - 1]) {
    case 'game':
      return (
        <Game
          key={level}
          level={level}
          onExit={pop}
          onHome={goHome}
          onNext={() => setLevel(l => l + 1)}
        />
      );
    case 'levels':
      return <Levels onBack={pop} onPlay={openLevel} />;
    case 'settings':
      return <Settings onBack={pop} onThemes={() => push('themes')} />;
    case 'themes':
      return <Themes onBack={pop} />;
    default:
      return (
        <Home
          onPlay={openLevel}
          onLevels={() => push('levels')}
          onSettings={() => push('settings')}
          onThemes={() => push('themes')}
        />
      );
  }
}

function Chrome(): React.JSX.Element {
  const { theme } = useApp();
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={theme.bgTop} />
      <Router />
    </>
  );
}

function App(): React.JSX.Element {
  // Kick off the AdMob SDK + consent flow once, in the background.
  useEffect(() => {
    initAds();
  }, []);

  return (
    <SafeAreaProvider>
      <AppStateProvider>
        <Chrome />
      </AppStateProvider>
    </SafeAreaProvider>
  );
}

export default App;
