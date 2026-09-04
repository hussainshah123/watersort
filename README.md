This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.

---

## AdMob setup (going live)

The app ships wired to **Google's official test ads**, so it runs and shows ads
out of the box without touching your AdMob account. Two files hold every real
ID you need to swap in.

### 1. Ad unit IDs — `src/ads/config.js`

Replace the `ca-app-pub-0000000000000000/0000000000` placeholders in the `REAL`
object with your own banner and interstitial unit IDs, per platform.

While `__DEV__` is true the app **always** serves test ads regardless of what is
in that file — clicking your own live ads is the fastest way to get an AdMob
account suspended, so this guard is deliberate. Release builds use your real IDs.

### 2. App IDs — `app.json`

```json
"react-native-google-mobile-ads": {
  "android_app_id": "ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY",
  "ios_app_id": "ca-app-pub-XXXXXXXXXXXXXXXX~ZZZZZZZZZZ"
}
```

Note the `~` separator — app IDs use `~`, ad unit IDs use `/`.

**Current state:** Android is wired to the real app ID and a real banner unit.
Still outstanding:

- An **Android interstitial** unit (`REAL.android.interstitial` in
  `src/ads/config.js`) — interstitials serve test ads until it is created.
- A separate **iOS AdMob app** with its own app ID and its own units. AdMob unit
  IDs are per-platform: an Android unit will never fill on iOS, so iOS stays on
  test ads until you add them.

After editing `app.json` you must rebuild the native app (`npm run android` /
`npm run ios`); the IDs are baked into the Android manifest and the iOS
`Info.plist` at build time, so a Metro reload is not enough. On iOS also re-run
`cd ios && pod install` after installing or upgrading the ads package.

### Where ads appear

| Format | Placement |
| --- | --- |
| Anchored adaptive banner | Bottom of Home, Level Map, Settings and the game board |
| Interstitial | Between levels — after every 3rd completion, with a 60s minimum gap |

Both knobs live at the bottom of `src/ads/config.js`
(`INTERSTITIAL_EVERY`, `INTERSTITIAL_MIN_GAP_MS`). The banner reserves zero
height until an ad actually loads, so a no-fill never leaves a grey gap.

### Consent (EEA/UK)

`initAds()` runs Google's UMP `gatherConsent()` on first launch, which shows the
consent form only where it is legally required. Configure the form itself in the
AdMob console under *Privacy & messaging*.

## Kotlin / AdMob SDK version note

`react-native-google-mobile-ads` is pinned to **16.0.0**. Newer 16.2+ releases
pull `play-services-ads` 25.x, which is compiled with Kotlin 2.3 metadata and
fails to build against the Kotlin 2.1.20 that React Native 0.86's Gradle plugin
uses. Upgrade the ads package only together with `kotlinVersion` in
`android/build.gradle`, and rebuild Android to confirm.
