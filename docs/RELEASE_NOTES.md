# MediaFlyouts Release Notes

## Version 1.3.0 — Wired peripheral and update improvements (September 2026)

Version 1.3.0 extends peripheral monitoring to wired devices and improves
device naming, charging alerts, update installation and release distribution.

### Peripheral support

- Adds wired USB and 2.4 GHz peripheral entries to the taskbar widget and
  peripheral flyouts.
- Adds a dedicated charger flyout for charging events.
- Allows peripheral names to be edited and uses those names throughout the
  dashboard, widget and flyouts.
- Excludes hidden peripherals from dashboard lists and alerts.

### Updates and release distribution

- Adds an in-app action to install an available update.
- Points update checks and release links at the separate
  `MediaFlyouts-Releases` repository.
- Publishes release files and documentation to the release repository.

### Polish

- Updates the charge-page icon.

### Downloads

See the [Releases page](https://github.com/scleaverzer0ne/MediaFlyouts-Releases/releases):
`MediaFlyouts-1.3.0-setup.exe`, `MediaFlyouts-1.3.0.msix` (+ `MediaFlyouts.cer`),
`MediaFlyouts-1.3.0-win64.zip`, and `MediaFlyouts-1.3.0-src.zip`.

## Version 1.2.0 — Peripheral battery and dashboard improvements (September 2026)

Version 1.2.0 adds a complete wireless peripheral battery experience and
improves the dashboard, media integration, fullscreen behavior and release
packaging.

### Peripheral battery monitoring

- Reads battery levels from Bluetooth Classic, Bluetooth LE, Google Fast Pair,
  DualSense / DualSense Edge, Razer and Logitech wireless devices.
- Shows selected devices in a taskbar widget with battery rings, charging state
  and per-component details for earbuds and other multi-battery devices.
- Announces connect, disconnect, charging and low-battery events in a dedicated
  peripheral flyout, with event toggles, alert debouncing and optional tray
  notifications.
- Adds device classification, grouped connection types, faster change detection
  and a dedicated peripheral settings page.

### Dashboard and visual polish

- Adds a collapsible, searchable dashboard sidebar with refreshed icons and page
  headers.
- Adds an option to apply album-art accent colors across the whole app.
- Keeps flyouts above the taskbar and improves widget behavior over the Start
  menu.

### Reliability and packaging

- Fixes dashboard startup, onboarding visibility and flyout/widget recovery
  after fullscreen apps close.
- Matches media sessions by app ID and refreshes media state more reliably.
- Gates audio capture while the taskbar widget is hidden.
- Adds optional file logging, MSIX startup-task support and a unified
  `mediaflyouts.ps1` build/test/run workflow.
- Improves MSIX signing so releases can use a persistent certificate.

### Downloads

See the [Releases page](https://github.com/scleaverzer0ne/MediaFlyouts/releases):
`MediaFlyouts-1.2.0-setup.exe`, `MediaFlyouts-1.2.0.msix` (+ `MediaFlyouts.cer`),
`MediaFlyouts-1.2.0-win64.zip`, and `MediaFlyouts-1.2.0-src.zip`.

## Version 1.1.0 — First-run polish (August 2026)

A small follow-up to 1.0.0 that cleans up the first-run experience and adjusts
two defaults. Existing installs keep their current settings.

### 🐣 First-run fixes

- Flyouts and the taskbar widget stayed hidden until the onboarding wizard is
  finished — previously they could pop up over the wizard while you were still
  choosing your settings.
- The native Windows volume OSD is no longer suppressed during onboarding, so
  volume changes still show feedback before our own flyout takes over.
- On first run the taskbar widget now docks to the taskbar edge the shell leaves
  free: **left** when your taskbar is center-aligned, **right** when it is
  left-aligned. Previously it always started on the left, which could sit under
  a center-aligned taskbar's buttons. If you have already positioned the widget,
  your choice is kept.

### ⚙️ Changed defaults

- The per-app mixer inside the volume flyout now starts **disabled**. Turn it
  back on from the dashboard under Volume flyout.

### Known limitations

- **English only** — no localization yet.
- **No window acrylic/mica backdrop** — flyouts use solid, theme-matched surfaces.
- The MSIX is signed with a self-signed certificate; installing it requires
  trusting that certificate (see the [Installation Guide](user/installation.md)).

### Downloads

See the [Releases page](https://github.com/scleaverzer0ne/MediaFlyouts/releases):
`MediaFlyouts-1.1.0-setup.exe`, `MediaFlyouts-1.1.0.msix` (+ `MediaFlyouts.cer`),
`MediaFlyouts-1.1.0-win64.zip`, and `MediaFlyouts-1.1.0-src.zip`.

## Version 1.0.0 — Initial Release (August 2026)

The first public release of MediaFlyouts — a complete media, volume and
lock-key overlay for Windows, written from scratch in Qt 6 / C++ / QML.

### 🎵 Media flyout

- Appears on media-key / volume-key presses while something is playing, driven
  by the System Media Transport Controls (SMTC).
- Album art (rounded), title, artist and an optional media-player name.
- Transport controls: previous, play/pause, next.
- Draggable, interactive seekbar with elapsed / duration (with an optional
  interactive sub-mode; can be turned off).
- Repeat and shuffle controls when the session supports them.
- Compact layout, centered title/artist, and an "always display" pinned mode
  with a close button that auto-hides when unpinned.

### 🔊 Volume flyout & per-app mixer

- Replaces and suppresses the native Windows volume OSD.
- Master volume slider with mute and a configurable duration.
- Follows the default output device and re-binds when it changes.
- Expandable, responsive per-app mixer inside the flyout, with real app icons.
- A standalone Volume Mixer window with the same per-process controls.

### 🔒 Lock-keys flyout

- Caps / Num / Scroll / Insert indicators with per-key toggles, a configurable
  duration and a bold-UI option.

### ⏭️ Now Playing / Up next

- Fires on track change; selectable "now playing card" or compact "Up next" pill
  style; sizes to its track text.

### 📊 Taskbar widget & visualizer

- Now-playing taskbar widget: left/right docking, per-monitor placement,
  adjustable offset, center alignment, pause overlay and scrolling titles.
- Scroll / swipe between multiple media sources; hidden over fullscreen apps and
  kept out of screen captures; optional integrated controls.
- Audio visualizer from WASAPI loopback + FFT, with **Bars**, **Radial**,
  **Waveform** and **Particles** (beat-driven) styles.

### 🎨 Theming, placement & animation

- Light / dark / system theme with dark title bars.
- Selectable accent color (default / match-system / custom) and an optional
  accent tinted from album art.
- Simultaneously visible flyouts stack and re-flow smoothly.
- Six on-screen positions plus "above the taskbar widget", monitor selection and
  on-screen clamping; configurable animation speed and easing.

### 🧰 App filtering, dashboard & system

- Blacklist / whitelist app filtering.
- Searchable settings dashboard with scrollable pages and settings
  backup / restore.
- Tray icon with a dark Fluent context menu; hide-tray and left-click options.
- Single-instance handling that surfaces the dashboard on relaunch.
- First-run onboarding wizard.
- Update checker against the GitHub releases API with optional auto-check.
- Launch on startup and fullscreen-app suppression.

### 🏗️ Engineering

- Cross-platform domain core (settings, track info, FFT, positioning) with
  GoogleTest + Qt Test suites (7 CTest targets).
- GitHub Actions CI building and testing both debug and release.
- Release pipeline producing an installer, an MSIX, a portable ZIP and a source
  ZIP.

### Known limitations

- **English only** — no localization yet.
- **No window acrylic/mica backdrop** — flyouts use solid, theme-matched surfaces.
- The MSIX is signed with a self-signed certificate; installing it requires
  trusting that certificate (see the [Installation Guide](user/installation.md)).

### Downloads

See the [Releases page](https://github.com/scleaverzer0ne/MediaFlyouts/releases):
`MediaFlyouts-1.0.0-setup.exe`, `MediaFlyouts-1.0.0.msix` (+ `MediaFlyouts.cer`),
`MediaFlyouts-1.0.0-win64.zip`, and `MediaFlyouts-1.0.0-src.zip`.
