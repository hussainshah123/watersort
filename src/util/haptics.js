import { Vibration } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

// Cross-platform haptics. react-native-haptic-feedback maps these semantic
// types to the correct native feedback on both iOS (Taptic Engine) and Android
// (VibrationEffect). We keep a try/catch + Vibration fallback so a missing
// permission or native module can never crash gameplay.
const OPTIONS = {
  enableVibrateFallback: true, // iOS devices without a Taptic engine
  ignoreAndroidSystemSettings: false, // respect the user's system setting
};

let enabled = true;

export function setHapticsEnabled(value) {
  enabled = value;
}

/**
 * @param {'selection'|'impactLight'|'impactMedium'|'notificationSuccess'|'notificationError'} type
 */
export function haptic(type = 'impactLight') {
  if (!enabled) return;
  try {
    ReactNativeHapticFeedback.trigger(type, OPTIONS);
  } catch (e) {
    try {
      Vibration.vibrate(12);
    } catch (e2) {
      // haptics are optional polish — never crash
    }
  }
}
