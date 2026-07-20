import Sound from 'react-native-sound';

// Cross-platform SFX manager built on react-native-sound.
//
// Asset locations (same lowercase names both platforms):
//   Android -> android/app/src/main/res/raw/<name>.wav   (auto-bundled)
//   iOS     -> add the .wav files (src/assets/sounds) to the Xcode project so
//              they land in the app bundle (MAIN_BUNDLE).
//
// react-native-sound resolves a name like 'pour.wav' to res/raw/pour on
// Android and to pour.wav in the bundle on iOS, so one name works everywhere.

const NAMES = ['select', 'pour', 'error', 'win'];

const pool = {};
let enabled = true;
let initialised = false;

export function setSoundEnabled(value) {
  enabled = value;
}

export function initSounds() {
  if (initialised) return;
  initialised = true;

  // iOS audio session: 'Ambient' respects the mute switch and mixes with other
  // audio. No-op on Android. Must run before instantiating Sound objects.
  try {
    Sound.setCategory('Ambient', true);
  } catch (e) {
    // ignore
  }

  NAMES.forEach(name => {
    try {
      const s = new Sound(`${name}.wav`, Sound.MAIN_BUNDLE, error => {
        if (error) {
          pool[name] = null; // failed to load -> play() becomes a no-op
        }
      });
      s.setVolume(0.7);
      pool[name] = s;
    } catch (e) {
      pool[name] = null;
    }
  });
}

export function play(name) {
  if (!enabled) return;
  const s = pool[name];
  if (!s) return;
  try {
    // Rewind so rapid repeats (e.g. quick pours) always retrigger cleanly.
    s.stop(() => {
      s.play(() => {});
    });
  } catch (e) {
    // never let audio crash the game
  }
}

export function releaseSounds() {
  Object.keys(pool).forEach(name => {
    try {
      pool[name] && pool[name].release();
    } catch (e) {
      // ignore
    }
    pool[name] = null;
  });
  initialised = false;
}
