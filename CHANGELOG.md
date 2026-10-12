# Changelog

All notable changes to MediaFlyouts are documented here. This project follows
[Semantic Versioning](https://semver.org/).

## [1.2.0] — 2026-09-06

A major feature release adding wireless peripheral battery monitoring and
flyouts, alongside dashboard, media-session, fullscreen and packaging fixes.

### Added
- Wireless peripheral battery support for Bluetooth Classic, Bluetooth LE,
  Google Fast Pair, DualSense, Razer and Logitech devices.
- A selectable peripherals taskbar widget with battery rings, charging state
  and multi-component device details.
- Peripheral connect, disconnect, charging and low-battery flyouts with
  per-event settings, alert debouncing and optional tray notifications.
- A dedicated peripheral settings page, grouped device lists and improved
  device classification and naming.
- A unified `mediaflyouts.ps1` build/test/run entry point and optional file
  logging for troubleshooting.
- MSIX startup-task support and a release workflow that can reuse a stored
  signing certificate.

### Changed
- The dashboard now has a collapsible, searchable sidebar with refreshed
  icons, page headers and album-art app-wide accent support.
- Shared flyout and dockable-widget window behavior is centralized, keeping
  flyouts above the taskbar and reducing duplicate positioning logic.
- Media sessions are matched by app ID and refreshed through queued hooks for
  more reliable source and playback updates.

### Fixed
- Dashboard startup and onboarding visibility edge cases.
- Flyout and widget visibility after fullscreen apps or games close.
- Taskbar widget visibility over the Start menu and unnecessary audio capture
  while the widget is hidden.
- Fast Pair disconnect detection, Bluetooth naming and transient peripheral
  disconnect alerts.

## [1.1.0] — 2026-08-28

A small follow-up release that fixes first-run behavior and adjusts two
defaults. No changes to existing installs beyond the fixes below.

### Fixed
- Flyouts and the taskbar widget no longer appear while the first-run
  onboarding wizard is still open; they now wait until it is finished.
- The native Windows volume OSD is left alone until onboarding completes, so
  volume changes still show feedback during the wizard.

### Changed
- The per-app volume mixer inside the volume flyout is now off by default and
  can be enabled from the dashboard.
- On first run the taskbar widget is placed on the taskbar edge the shell leaves
  free — left when the taskbar is center-aligned, right when it is
  left-aligned — instead of always docking left. An existing placement is never
  overridden.

## [1.0.0] — 2026-08-27

First public release. A complete media / volume / lock-key overlay for Windows,
written from scratch in Qt 6 / C++ / QML.

### Media flyout
- Media flyout on media / volume keys via the System Media Transport Controls,
  with album art, title, artist and optional player name.
- Previous / play-pause / next transport controls.
- Draggable interactive seekbar with elapsed / duration, plus a seekbar toggle
  and interactive sub-option.
- Repeat and shuffle controls when the session supports them.
- Compact layout, centered text, and an "always display" pinned mode with a
  close button that auto-hides when unpinned.
- Rounded album art.

### Volume flyout & mixer
- Volume flyout that replaces and suppresses the native Windows volume OSD.
- Master volume slider with mute and a configurable duration.
- Follows the default output device and re-binds on device changes.
- Expandable, responsive per-app mixer inside the flyout, with per-app icons.
- Standalone Volume Mixer window with per-process volume / mute.

### Lock-keys flyout
- Caps / Num / Scroll / Insert indicators with per-key toggles, a configurable
  duration and a bold-UI option.

### Now Playing / Up next
- Fires on track change; selectable "now playing card" or compact "Up next"
  pill style; sizes to its track text; configurable duration.

### Taskbar widget & visualizer
- Now-playing taskbar widget: left/right docking, per-monitor placement,
  adjustable offset, center alignment, pause overlay and scrolling titles.
- Scroll / swipe between multiple media sources; hidden over fullscreen apps and
  kept out of screen captures; optional integrated controls.
- Audio visualizer from WASAPI loopback + FFT with **Bars**, **Radial**,
  **Waveform** and **Particles** (beat-driven) styles and mirrored bars.

### Flyouts, theming & placement
- Simultaneously visible flyouts stack and re-flow smoothly.
- Configurable animation speed and easing.
- Six positions plus "above the taskbar widget", monitor selection and
  on-screen clamping.
- Light / dark / system theme with dark title bars.
- Selectable accent color (default / match-system / custom) and optional accent
  tinted from album art.

### App filtering, dashboard & system
- Blacklist / whitelist app filtering.
- Searchable settings dashboard with scrollable pages and settings
  backup / restore.
- Tray icon with a dark Fluent context menu; hide-tray and left-click behavior
  options; open dashboard on double-click.
- Single-instance handling that surfaces the dashboard on relaunch.
- First-run onboarding wizard.
- Update checker against the GitHub releases API with an optional automatic
  check and tray notification.
- Launch on startup and fullscreen-app suppression.

### Engineering
- Cross-platform domain core (settings, track info, FFT, positioning) with
  GoogleTest + Qt Test suites.
- GitHub Actions CI building and testing both debug and release, running on
  Node 24 action runtimes.

[1.1.0]: https://github.com/scleaverzer0ne/MediaFlyouts/releases/tag/v1.1.0
[1.0.0]: https://github.com/scleaverzer0ne/MediaFlyouts/releases/tag/v1.0.0
[1.2.0]: https://github.com/scleaverzer0ne/MediaFlyouts/releases/tag/v1.2.0
