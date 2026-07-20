/**
 * Water Sort Master — entry point + minimal screen router.
 * No navigation library needed: a single piece of state swaps screens.
 */
import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Home from './src/screens/home/Home';
import Game from './src/screens/game/Game';

function App(): React.JSX.Element {
  const [screen, setScreen] = useState<'home' | 'game'>('home');
  const [level, setLevel] = useState(1);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#141A33" />
      {screen === 'home' ? (
        <Home
          level={level}
          onPlay={() => setScreen('game')}
          onReset={() => setLevel(1)}
        />
      ) : (
        <Game
          key={level}
          level={level}
          onExit={() => setScreen('home')}
          onNext={() => setLevel(l => l + 1)}
        />
      )}
    </SafeAreaProvider>
  );
}

export default App;
