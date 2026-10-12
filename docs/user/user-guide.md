# User Guide

MediaFlyouts lives in the system tray and shows overlays in response to media,
volume and lock keys. This guide covers day-to-day use and the settings
dashboard.

## The tray icon

Right-click the tray icon for the menu:

- **Settings** — open the dashboard.
- **Show Media Flyout** — pop the media flyout for the current track.
- **Volume Mixer** — open the standalone per-app mixer.
- **Repository / Report a Bug** — open the project on GitHub.
- **Open Config Folder** — open the folder holding your settings file.
- **Quit** — exit the app.

Left-click behavior (open Settings vs. show the flyout) is configurable; with the
"show flyout" option, a double-click opens Settings.

## Flyouts

### Media flyout
Press a media key (or a volume key, unless excluded) while a player is active to
show album art, title, artist and transport controls. The **seekbar** is
draggable; the pin/close control keeps it on screen ("always display") until you
dismiss it.

### Volume flyout
Press a volume key to show the master volume slider (it replaces the native
Windows OSD). Click the **chevron** to expand the **per-app mixer**, where each
app has its own volume slider, mute toggle and icon. Changes apply immediately.
The in-flyout mixer is **off by default** — switch it on from the Volume flyout
page in Settings.

### Lock-keys flyout
Toggling Caps / Num / Scroll / Insert shows a brief indicator. Enable or disable
each key, the duration, and the bold style in Settings.

### Up next
When a track auto-advances, a compact flyout shows what started playing. Choose
the **card** or **compact pill** style in Settings.

## Taskbar widget

Enable the taskbar widget to show the current track next to the tray. On first
run it docks to whichever edge your taskbar leaves free — left if your taskbar is
center-aligned, right if it is left-aligned. You can:

- dock it to the **left or right**, move it between **monitors**, and nudge it
  with an **offset**;
- **scroll** or **swipe** across it to switch between multiple playing apps;
- turn on the **audio visualizer** and pick a style — **Bars**, **Radial**,
  **Waveform** or **Particles**.

## Peripheral battery

MediaFlyouts reads the battery of supported wireless and wired peripherals —
Bluetooth headsets, mice and keyboards, earbuds that support Google Fast Pair,
DualSense controllers, and Razer or Logitech devices on their 2.4GHz dongles
or supported USB interfaces.

- The **Peripherals widget** shows a battery ring per device next to the tray.
  Choose which devices appear on the Taskbar Widget page, and hover a ring for
  the exact level, charging state and — for earbuds — the left / right / case
  breakdown.
- The **Peripheral flyout** announces devices as they connect or disconnect and
  warns when a battery gets low. If several devices connect at once they appear
  side by side. Turn individual events on or off on the Taskbar Widget page.
- Rename a device from the peripheral settings list. The custom name is shown
  in the widget, dashboard and flyouts; hidden devices are left out of lists and
  alerts.
- A **low battery** also raises a tray notification, so it isn't missed.

Charging events can use the dedicated charger flyout when enabled.

Battery alerts use a 20% low-battery threshold and a 10% very-low threshold,
with hysteresis so the same warning is not repeated on every poll. Connect,
disconnect, charging and low-battery events can be enabled independently.

Not every device can report a battery: it needs one of the supported
transports. A Bluetooth speaker with no microphone, for example, has no
Hands-Free profile and so reports nothing.

The widget hides automatically over fullscreen apps and stays out of screen
captures.

## The settings dashboard

Open it from the tray menu. The sidebar groups settings into pages (Media Flyout,
Volume, Lock Keys, Taskbar Widget, App Filtering, About, …). Use the **search
box** to jump to any setting. Highlights:

- **Theme & accent** — light/dark/system, and a default / match-system / custom
  accent (or tint it from album art).
- **Placement & animation** — flyout position, target monitor, duration,
  animation speed and easing.
- **App filtering** — blacklist or whitelist which players may trigger flyouts.
- **Backup / restore** — export and import all settings.

## Startup & updates

Enable **launch on startup** to have MediaFlyouts start with Windows (minimized
to tray). Installer and portable builds use the Windows `Run` registry key;
MSIX installs use the Windows startup-task mechanism. Turn on **automatic update
checks** to be notified when a newer release is available. The About page can
also check manually and install an available update.
