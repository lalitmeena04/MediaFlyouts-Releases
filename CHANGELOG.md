# Changelog

All notable changes to MediaFlyouts are documented here. This project follows
[Semantic Versioning](https://semver.org/).

## [1.4.0] — 2026-10-09

Adds a stacked widget layout and a "Pause all" media control, fixes taskbar
widget placement on secondary monitors and Logitech receiver detection, and
surfaces unavailable Windows subsystems in the dashboard.

### Added

- Widget layout option. Media and peripheral widgets can sit side by side or
  share one taskbar slot as a scrollable stack. In stack mode the scroll wheel
  pages between the media widget and separate 2.4 GHz, Bluetooth and wired
  peripheral pages. Every page uses one frame sized to the largest widget,
  with the content centered.
- Slide-and-fade transitions when switching media sources on the media widget
  and when paging through the widget stack.
- Media widget "Pause all" button that pauses every playing media source at
  once. An optional follow-up turns the same button into "Play all" whenever
  every source is paused, and resumes them. With the follow-up off, the button
  hides while everything is paused but keeps its slot.
- Dashboard status banner and tray tooltip that name any Windows subsystem
  (audio, media sessions, lock keys, media keys) that did not answer, so a
  disabled setting is explained instead of failing silently.

### Changed

- Flyout hover and seekbar drag handling moved to shared `PeekArea` and
  `ScrubArea` components, and animation durations are centralized in
  `Anim.qml`.
- One app-wide monitor map (`MonitorMapper`) now backs taskbar, flyout
  placement and fullscreen detection instead of each resolving monitors on
  its own. Placement math lives in the unit-tested `TaskbarLayout` model.
- Battery providers share one set of device-node helpers for PnP properties
  and Bluetooth address lookups.
- The build script's `-ShowOutput` switch was replaced by `-Quiet`.
- Removed the obsolete `run_app.ps1` and `setup_env.ps1` scripts; use
  `mediaflyouts.ps1` instead.

### Fixed

- Taskbar widgets on a secondary monitor no longer leave the primary tray's
  gap. Each monitor's own taskbar is measured, and on Windows 11 the tray and
  clock are read through UI Automation when the Win32 child window is missing.
- "Play all" now resumes every paused media source. It used to resume only
  the sources that "Pause all" had paused, so a source paused by hand before
  stayed silent.
- Logitech devices on Bolt and Unifying receivers are now detected. HID++
  requests use the long-report collection, all receiver slots are probed at
  once, and the device reports its own name, type and charging state.

## [1.3.0] — 2026-09-10

Adds wired peripheral support and improves peripheral management, charger
alerts, update installation and release distribution.

### Added

- Wired USB and 2.4 GHz peripheral flyouts and taskbar widget entries.
- Dedicated charger flyout support for charging events.
- An in-app action to install an available update.

### Changed

- Peripheral names can be edited, with the custom name used consistently in
  the widget, dashboard and flyouts.
- Hidden peripherals are excluded from dashboard lists and alerts.
- Update checks and release links now use the separate
  `MediaFlyouts-Releases` repository.
- Release automation publishes application files and documentation to the
  release repository.

### Fixed

- Peripheral display logic now handles wired devices and hidden-device state
  more reliably.
- Charging and transient peripheral events are presented through the correct
  flyout behavior.
- Updated the charge-page icon.

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

### Now Playing / Now Playing

- Fires on track change; selectable "now playing card" or compact "Now Playing"
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
[1.3.0]: https://github.com/scleaverzer0ne/MediaFlyouts-Releases/releases/tag/v1.3.0
[1.4.0]: https://github.com/scleaverzer0ne/MediaFlyouts-Releases/releases/tag/v1.4.0
