# Controllers API

The `Controllers/` sources connect the model to Windows and to QML. Cross-platform
controllers build everywhere; the rest are Windows-only.

## Cross-platform

### NowPlaying
QML-facing now-playing model (`nowPlaying`). Applies `TrackInfo` updates, exposes
title/artist/art/progress and transport `Q_INVOKABLE`s, and decides whether a
change should raise the media flyout or the "Now Playing" flyout. Forwards transport
commands to an `IPlaybackController`. Windows media sessions are matched by app
ID and refreshed through queued hooks, which keeps source and playback changes
reliable during rapid switching.

### TrayController
Owns the `QSystemTrayIcon` and its dark, Fluent-style context menu; emits intents
(open dashboard, show flyout, open mixer) and `notify()` toasts.

### ThemeController
Computes the theme/accent palette (`theme` context property) from `Settings` and
the system accent; honors light/dark/system and default/match-system/custom
accent.

### FlyoutPlacement
Resolves a flyout's screen position from the placement settings for QML
(`Q_INVOKABLE position(w, h)`, `monitorNames()`). Monitors come from
`MonitorMapper`.

### MonitorMapper
One app-wide `QScreen` → native monitor map (`HMONITOR` on Windows, built from
`QNativeInterface::QWindowsScreen`). `TaskbarInfo`, `FlyoutPlacement` and
`FullscreenDetector` consume it instead of resolving monitors on their own.
Exposes `geometry(index)` / `availableGeometry(index)` to QML and converts
native rects to logical pixels.

### SingleInstance
Ensures a single running instance (via a local server); a second launch signals
the primary, which surfaces its dashboard only if the tray icon is hidden.

### UpdateChecker
Queries the GitHub releases API and exposes `updateAvailable`, `latestVersion`,
etc. `isNewerVersion(current, latest)` does the dotted-numeric comparison. The
running version comes from `MEDIAFLYOUTS_VERSION`. A newer release emits
`updateFound(version)`; `Views/UpdateDialog.qml` offers **Skip this version**
(stored in `settings.skippedUpdateVersion`) or **Download & install**.
`download()` fetches the `*-setup.exe` asset picked by `pickInstallerAsset()`
into the temp folder, verifies the release `digest` (or size), then `install()`
starts it and emits `installStarted` so the app quits. The in-app installer is
offered only when `mf::detectInstallKind()` (`Model/InstallSource.h`) reports
`Installer` — i.e. not packaged and running from the Inno Setup
`InstallLocation`. Store copies are sent to `ms-windows-store://downloadsandupdates`
(`openStorePage()`); portable copies to the release page.

### ErrorReporter
Builds a local diagnostics bundle for bug reports. `createReport()` writes
`report.txt` (`systemSummary()`: version, OS, Qt, screens, capabilities),
`settings.ini` (via `Settings::exportTo`) and copies of `logs/*.log` into
`reportsDir()`, zips the folder with the OS `tar` when available, and prunes to
`kReportsKept` reports. `revealReport()` selects the file in Explorer;
`openIssuePage()` opens GitHub's new-issue page with a prefilled template
(`issueUrlFor()`). The template names only the report file. System details
stay in the report. Nothing is uploaded by the app.

## Windows-only

- **VolumeController** — master volume/mute via `IAudioEndpointVolume`; follows
  the default output device (`IMMNotificationClient`).
- **VolumeMixer** — per-app sessions via `IAudioSessionManager2` /
  `ISimpleAudioVolume`, with process icons; exposes `sessions` to QML.
- **AudioCapture** — WASAPI loopback + FFT; exposes `bands`, `level` and a
  `beat()` signal for the visualizer.
- **AccentWatcher** — polls the WinRT `UISettings` accent color.
- **WindowEffects** — applies a dark title bar via `DwmSetWindowAttribute`.
- **LockKeysController / MediaKeyController** — low-level keyboard hook for lock
  keys and media keys.
- **FullscreenDetector** — suppresses flyouts over fullscreen/exclusive apps.
- **NativeFlyoutSuppressor** — hides the native Windows volume OSD. `main.cpp`
  only starts/arms it once onboarding is complete, so the system OSD keeps
  working during the first-run wizard.
- **StartupController** — launch-on-startup via the MSIX startup-task API for
  packaged installs, or the `Run` registry key for unpackaged installs.
- **TaskbarInfo** — taskbar geometry for placing the widget. Finds the taskbar
  window that owns each monitor and measures its tray via UI Automation when
  the Win32 child is missing (Windows 11 secondary taskbars). Results are
  cached per taskbar for 2 s. Placement math is in `mf::taskbarWidgetX`.
- **BatteryStatusController** — aggregates peripheral battery from all providers
  into one list for QML. Real providers poll on a worker thread; connect and
  disconnect events arriving mid-poll are coalesced rather than dropped.
- **BatteryProviders/** — one per transport: Bluetooth Classic (Hands-Free
  battery property), Bluetooth LE (GATT), Fast Pair (RFCOMM message stream),
  DualSense (raw HID), Razer (90-byte feature reports) and Logitech (HID++,
  long-report collection, all receiver slots probed at once).
  `HidCollections` is the shared HID enumeration helper; `DevNodeHelpers`
  holds the shared `CM_*` device-node property and Bluetooth address helpers.
- **BluetoothConnectionWatcher / HidChangeWatcher** — instant connect and
  disconnect notifications, so the UI doesn't wait for the next poll.
- **PeripheralAlerts** — turns battery snapshots into connect / disconnect /
  low-battery events using `mf::BatteryAlertPolicy`; it also handles charging
  events, per-event settings, debounce and flyout/tray notification channels.
- **QmlLogger** — exposes debug, info, warning and error logging methods to QML.
