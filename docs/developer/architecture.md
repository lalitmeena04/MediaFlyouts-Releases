# Architecture Overview

MediaFlyouts is a Qt 6 application split into three layers, plus a QML UI. The
guiding principle is that all portable domain logic lives in a small, testable
core, while Windows-specific integration is isolated in controllers.

## Layers

```
Views/ (QML)  ──binds to──▶  Controllers/ (C++/Qt, Windows integration)
                                   │
                                   ▼
                             Model/ (portable domain logic)
```

### Model (`Model/`, built as `mediaflyout_core`)
Portable, dependency-light C++ (only `Qt6::Core`) that is unit-tested in
isolation:

- **Settings** — persisted app settings (`QSettings`), exposed to QML.
- **Localization** — the shipped language list and the pure
  settings-plus-system → language-code resolution (`mf::resolveLanguage`).
- **TrackInfo / PlaybackController** — track model + transport abstraction
  (`IPlaybackController`) so playback logic is mockable.
- **Fft** — radix-2 FFT and frequency-band mapping for the visualizer.
- **FlyoutPositioner** — pure geometry for placing flyouts.
- **AlbumArtProvider** — `QQuickImageProvider` for album art.
- **WinMediaProvider** *(Windows)* — SMTC bridge feeding `TrackInfo`.
- **Peripheral battery models** — protocol parsers and `BatteryAlertPolicy`
  keep provider-specific parsing and alert rules portable and testable.
- **Entitlement / EntitlementStore** — pure Pro-tier resolution (add-on,
  grandfathering, trial, offline fallback) and its tamper-checked cache file.

### Controllers (`Controllers/`)
Qt objects that wire the model to Windows and to QML:

- **NowPlaying** — QML-facing now-playing model; forwards transport commands.
- **TrayController** — tray icon + context menu.
- **AppTranslator** — loads the app and Qt `.qm` files for the chosen language
  and swaps them at run time (`i18n` context property; see
  [localization.md](localization.md)).
- **ThemeController** — theme/accent palette exposed to QML.
- **FlyoutPlacement** — screen placement from settings.
- **SingleInstance** — single-instance guard (surfaces the dashboard on relaunch
  only when the tray icon is hidden).
- **UpdateChecker** — GitHub releases update check.
- **EntitlementController** — the Pro paywall as seen by QML (`entitlement`);
  resolves the tier from install kind, Store answer and cache, drives purchases
  through the `StoreGateway` interface.
- **ProGate** — effective values of the gated settings (`pro`): stored value
  when unlocked, free-tier default when locked.
- **DonationController** — the Support page (`donate`): page link, UPI/NEFT
  details for unpackaged builds, Store tips for the Store build.
- Windows-only: **VolumeController**, **VolumeMixer**, **AudioCapture**,
  **AccentWatcher**, **WindowEffects** (dark title bar), **LockKeysController**,
  **MediaKeyController**, **FullscreenDetector**, **NativeFlyoutSuppressor**,
  **StartupController**, **StoreLicensing** (Microsoft Store licenses and
  purchases), **TaskbarInfo**, **TaskbarBackdrop**,
  **BatteryStatusController**,
  **PeripheralAlerts**, and the Bluetooth/HID battery providers.

### Views (`Views/`, QML)
Flyouts and windows: `MediaFlyout`, `VolumeFlyout`, `LockKeysFlyout`,
`NowPlayingFlyout`, `TaskbarWidget` + `TaskbarVisualizer`, `Dashboard`,
`VolumeMixerWindow`, `OnboardingWindow`, plus shared pieces (`Fluent`, `Anim`,
`RoundedArt`, `IconLabel`, `Setting*`). `App.qml` is the non-visual root that
owns the windows and reacts to tray intents.

## Composition (`main.cpp`)
`main` initializes the WinRT apartment, creates the model + controllers, and
registers them as QML context properties (`nowPlaying`, `settings`, `theme`,
`volumeController`, `volumeMixer`, `audioCapture`, `taskbar`, `tray`, …), then
loads `App.qml`. `App.qml` owns the five flyouts and re-stacks visible windows
when their visibility, position or monitor changes. Matching flyouts are
stacked without overlap; the special above-taskbar position anchors a flyout
to the taskbar widget and clamps it to the screen.

Flyout windows share `FlyoutBase.qml`, while taskbar widgets share
`DockableWidget.qml`. This keeps auto-hide, monitor-aware positioning,
fullscreen suppression and taskbar z-order behavior consistent.

## Windows APIs used
- **Media:** `GlobalSystemMediaTransportControlsSessionManager` (WinRT SMTC).
- **Volume:** Core Audio (`IMMDeviceEnumerator`, `IAudioEndpointVolume`,
  `IAudioSessionManager2`, `ISimpleAudioVolume`, `IMMNotificationClient`).
- **Keys:** low-level keyboard hook (`WH_KEYBOARD_LL`).
- **Audio capture:** WASAPI loopback (`IAudioCaptureClient`) + FFT.
- **Title bars:** `DwmSetWindowAttribute` (dark frame).
- **Fullscreen:** `SHQueryUserNotificationState`.
- **Accent:** WinRT `UISettings`.
- **Startup:** MSIX startup task for packaged installs, Windows `Run` registry
  key for installer and portable installs.
- **Store:** `Windows.Services.Store` (`StoreContext`) for the Pro add-on
  license, the app's acquisition date and purchases; DPAPI
  (`CryptProtectData`) seals the local entitlement cache.

See the [Controllers API](../api/controllers.md) and [Model API](../api/models.md)
for class-level detail.
