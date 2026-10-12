# MediaFlyouts — Features

MediaFlyouts is a Windows media, volume and lock-key overlay built with
Qt 6 / C++ / QML. This document describes the features that ship in the app.

> Anything not listed here is not implemented yet. In particular there is **no
> window acrylic/mica backdrop** (flyouts use solid, theme-matched surfaces with
> dark title bars), **no localization** (English only for now) and **no
> telemetry**.

## Media flyout

- Appears on media-key or volume-key presses while something is playing, driven
  by the System Media Transport Controls (SMTC).
- Shows album art (rounded), title, artist and an optional media-player name.
- Transport controls: previous, play/pause, next.
- Draggable, interactive seekbar with elapsed / duration, plus an optional
  "interactive" sub-mode; the seekbar can be turned off entirely.
- Optional repeat and shuffle controls (shown when the session supports them).
- Compact layout, centered title/artist, and an "always display" pinned mode
  with a close button that auto-hides once unpinned.

## Volume flyout & per-app mixer

- Replaces the native Windows volume OSD.
- Master volume slider with mute, and a configurable stay duration.
- Follows the default output device and re-binds automatically when the default
  device changes.
- Expandable per-app mixer (chevron) directly inside the flyout, with a live,
  responsive slider and mute per application and the real app icon. Off by
  default — enable it on the Volume flyout page.
- A standalone Volume Mixer window offering the same per-process controls.

## Lock-keys flyout

- Indicators for Caps Lock, Num Lock, Scroll Lock and Insert.
- Per-key enable toggles, a configurable stay duration and a bold-UI option.

## Now Playing / Up next flyout

- Pops when the track changes so it reflects the newly started track.
- Two user-selectable styles: a "now playing" card or a compact "Up next:" pill.
- Sizes itself to the track text; configurable stay duration.

## Taskbar widget

- A compact now-playing widget docked next to the system tray.
- Dock to the left or right side, move between monitors, and nudge with an
  offset that can shift either direction.
- On first run it picks the taskbar edge the shell leaves free — left for a
  center-aligned taskbar, right for a left-aligned one. Your own choice is kept
  afterwards.
- Center alignment, a pause overlay, and marquee scrolling for long titles.
- Scroll wheel / swipe to switch between multiple simultaneous media sources,
  with source indicator dots.
- Hidden automatically over fullscreen apps.
- Optional integrated playback controls.

## Peripheral battery

- Battery level for wireless peripherals, read over several transports:
  - **Bluetooth Classic** via the Hands-Free profile (headsets, mice, keyboards)
  - **Bluetooth LE** via the GATT Battery Service
  - **Google Fast Pair**, which reports each battery of a true-wireless set
    (left / right / case) and whether it is charging
  - **DualSense / DualSense Edge** controllers over raw HID
  - **Razer** wireless devices on their 2.4GHz dongle
  - **Logitech** HID++ devices (Unifying / Lightspeed / Bolt receivers)
- Wired USB and 2.4 GHz devices are listed when their battery data is exposed
  through a supported HID interface.
- Device type (mouse / keyboard / headset / gamepad) is decoded from the
  Bluetooth Class of Device or the HID usage, not guessed from the name.
- Connect and disconnect are picked up immediately by device watchers rather
  than waiting for the next poll.
- User-defined peripheral names are used across the dashboard, widget and
  flyouts. Hidden devices are omitted from dashboard lists and alerts.

## Peripherals widget

- A compact taskbar widget with a battery ring per selected peripheral.
- Pick which devices appear; hover for the exact level, charging state and the
  per-component breakdown.
- Follows the now-playing widget's monitor, side and offset so the two line up.
- Optional accent-coloured rings instead of green / amber / red.

## Peripheral flyout

- Announces peripherals as they connect, disconnect, or run low on battery.
- Several devices reported at once appear side by side in one flyout.
- Battery is shown as a bucket (Full / Good / Half / Low / Very low) alongside
  the exact percentage and a ring.
- Low battery warns once when crossing 20%, and again below 10% — it does not
  repeat on every poll, and re-arms only after charging back up.
- Per-event toggles (connect / disconnect / low battery / charging), its own
  position, monitor and duration.
- Charging events can use the dedicated charger flyout.
- Optional tray notification for a low battery, so it isn't missed if the
  flyout is not seen.

## Taskbar visualizer

- Real-time audio spectrum from WASAPI loopback capture with an FFT, mapped to
  log-spaced frequency bands.
- Selectable styles: **Bars**, **Radial**, **Waveform** and **Particles**
  (the particle burst is driven by a bass beat detector).
- Mirrored / centered bars option; colored by the current accent.

## Flyout stacking, animation & placement

- Multiple simultaneously visible flyouts stack above each other and re-flow
  smoothly when one disappears.
- Configurable animation speed and easing style.
- Six on-screen positions plus a "dock above the taskbar widget" option, a
  monitor selector, and clamping so above-widget flyouts stay on screen.

## Theming & accent

- Light / Dark / System theme, with theme-matched (dark) window title bars.
- Selectable accent color: default, match the Windows system accent, or a custom
  color.
- Optional accent tint derived from the current album art.

## App filtering

- Blacklist or whitelist mode to control which players may trigger flyouts,
  with a per-player allow check.

## Dashboard (settings)

- Sidebar navigation with scrollable pages and a settings search box.
- Backup and restore of all settings via export / import.

## System tray & single instance

- Tray icon with a dark, Fluent-style context menu (Settings, Show Media
  Flyout, Volume Mixer, Repository, Report a Bug, Open Config Folder, Quit),
  each with an icon.
- Option to hide the tray icon and to choose the left-click behavior; the
  dashboard opens on double-click when single-click is set to show the flyout.
- Single-instance handling: a second launch exits after signaling the running
  instance, which only surfaces its dashboard if the tray icon is hidden.

## Onboarding & updates
- First-run onboarding wizard. Flyouts and the taskbar widget stay hidden, and
  the native volume OSD is left alone, until you finish it.
- Update checker against the GitHub releases API, with an optional automatic
  check and a tray notification when an update is available.

## System integration

- Launch on startup via the Windows `Run` registry key.
- Fullscreen / exclusive-app detection to suppress flyouts during full-screen
  games and apps.

## Windows APIs used

- **Media:** `GlobalSystemMediaTransportControlsSessionManager` (WinRT SMTC).
- **Volume:** Core Audio — `IMMDeviceEnumerator`, `IAudioEndpointVolume`,
  `IAudioSessionManager2`, `ISimpleAudioVolume`, `IMMNotificationClient`.
- **Keys:** low-level keyboard hook (`WH_KEYBOARD_LL`), `GetKeyState`.
- **Audio capture:** WASAPI loopback (`IAudioCaptureClient`) + a radix-2 FFT.
- **Title bars:** `DwmSetWindowAttribute` (dark frame).
- **Fullscreen detection:** `SHQueryUserNotificationState`.
- **Accent:** WinRT `UISettings` accent color.
- **Startup:** Windows `Run` registry key.
