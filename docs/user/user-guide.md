# User Guide

MediaFlyouts lives in the system tray and shows overlays in response to media,
volume and lock keys, track changes, and peripheral battery or charger events.
It also docks now-playing and battery widgets on the taskbar. This guide covers
day-to-day use and the settings dashboard.

## The tray icon

Right-click the tray icon for the menu:

- **Settings** — open the dashboard.
- **Show Media Flyout** — pop the media flyout for the current track.
- **Volume Mixer** — open the standalone per-app mixer.
- **Repository / Report a Bug** — open the project on GitHub.
- **Open Config Folder** — open the folder holding your settings file.
- **Restart MediaFlyouts** — save an error report, then close and reopen the
  app. Use it when a flyout or widget looks wrong; the report keeps the log
  of the session that misbehaved. The same button is on the About page.
- **Quit** — exit the app.

Left-click behavior (open Settings vs. show the flyout) is configurable; with the
"show flyout" option, a double-click opens Settings.

## Flyouts

Open **Flyouts** in Settings for expandable Media, Volume, Lock Keys, Peripheral
and Charger cards. Each card contains its own controls. Shared fullscreen,
swipe and animation settings stay at the top. The shared position and monitor
apply to Media, Now Playing and Lock Keys; Volume, Peripheral and Charger
retain their own placement controls. Search results and Home shortcuts expand
the relevant card. Each flyout and widget card has its master switch in the
header. The switch works while the card is collapsed; click the title or
chevron to expand its other controls.

### Media flyout
Press a media key (or a volume key, unless excluded) while a player is active to
show album art, title, artist and transport controls. The **seekbar** is
draggable; the pin/close control keeps it on screen ("always display") until you
dismiss it.

For browser media without album art, the optional browser extension can supply
the website's icon. See
[Install the browser extension](#install-the-browser-extension) for setup steps.
The app uses the icon when a single audible tab, or a remembered or active tab
when no tabs are audible, matches the selected media title. It keeps the icon
while that media is paused. When the source cannot be identified, the usual
placeholder remains.

## Install the browser extension

The browser extension is optional. It connects your browser to MediaFlyouts so
the app can show a website icon when browser media has no album art. Keep
MediaFlyouts installed; the app includes the extension and the native messaging
host it needs. Open the full user guide from **About → User guide**. For the
short browser setup instructions, use **How to install** beside the browser
extension controls.

### Chrome, Edge, and Brave

These browsers use a manual unpacked-extension setup when no store listing is
configured. The app opens the browser's extension page and the extension folder
for you.

1. Open **Settings → Taskbar Widget**. Under **Browser artwork**, select
   **Chrome**, **Edge**, or **Brave**.
2. Click **Install browser extension**. MediaFlyouts registers its browser
   connection and opens the browser's extensions page and the bundled extension
   folder.
3. On the extensions page, turn on **Developer mode**.
4. Click **Load unpacked**.
5. In the folder picker, select the `chromium` folder that MediaFlyouts opened.
   Select the folder itself, not `manifest.json`.
   MediaFlyouts copies the extension into a writable App Data folder first.
   This works for Microsoft Store installations because WindowsApps is not
   directly usable for manual extension setup.
6. Confirm any browser warning and check that **MediaFlyouts Browser
   Integration** appears enabled in the extensions list.

The app may show a brief instruction after opening the folder. The extension is
not installed from the Chrome Web Store in this flow. Chrome and other
Chromium-based browsers require this manual step for unpacked extensions, and a
work or school policy may block Developer mode.

Keep the MediaFlyouts app in the same folder after setup. If you move or
reinstall the app, run **Install browser extension** again and load the
extension from its new `chromium` folder. Repeat the setup for each Chromium
browser you use.

To check that it works, play media in a browser tab and enable the taskbar
widget. When the browser media session matches the tab, its website icon can be
used if album art is unavailable. The extension also lets **Pause all** pause
audio and video in audible browser tabs.

### Firefox

In **Settings → Taskbar Widget**, select **Firefox** and click **Install browser
extension**. Firefox opens the MediaFlyouts listing in Mozilla Add-ons; confirm
the installation there. The extension also requires the native messaging host
included with MediaFlyouts.

### Volume flyout
Press a volume key to show the master volume slider (it replaces the native
Windows OSD). Click the **chevron** to expand the **per-app mixer**, where each
app has its own volume slider, mute toggle and icon. Changes apply immediately.
The in-flyout mixer is **off by default** — switch it on in the Volume card on
the Flyouts page in Settings.

### Lock-keys flyout
Toggling Caps / Num / Scroll / Insert shows a brief indicator. Enable or disable
each key, the duration, and the bold style in Settings.

### Now Playing
When a track auto-advances, a compact flyout shows what started playing. Choose
the **card** or **compact pill** style in Settings.

## Taskbar widget

The Taskbar Widget settings page keeps shared placement controls at the top.
Click the **Media Widget** or **Peripheral Widget** card header to expand its
settings inside the same card. You can also focus a header with **Tab** and
toggle it with **Space**.

Enable the taskbar widget to show the current track next to the tray. On first
run it docks to whichever edge your taskbar leaves free — left if your taskbar is
center-aligned, right if it is left-aligned. You can:

- dock it to the **left or right**, move it between **monitors**, and nudge it
  with an **offset**;
- **scroll** or **swipe** across it to switch between multiple playing apps;
- turn on the **Pause all button** to pause every playing app at once. With the
  optional browser extension installed, it also pauses media in all audible
  browser tabs. With **Play all after pausing** on, the same button resumes
  media sessions once everything is paused;
- pick a **Widget layout** — **Side by side** keeps the media and peripheral
  widgets next to each other, **Stack** puts them in one slot and lets you
  scroll between the media page and the 2.4 GHz, Bluetooth and wired pages;
- choose **Compact**, **Standard** or **Large** widget sizing;
- assign global **Keyboard shortcuts** for play/pause, next track, mute,
  opening the media flyout, showing or hiding the media or peripheral widget,
  and toggling focus mode. Shortcuts need a modifier and one key. The dashboard
  reports shortcuts that Windows cannot register because another app already
  uses them;
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
  side by side. Turn individual events on or off in the Peripheral Flyout card
  on the Flyouts page.
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

Open it from the tray menu. The sidebar groups settings into pages (Flyouts,
Taskbar Widget, App Filtering, About, …). Use the **search
box** to jump to any setting. Highlights:

- **Theme & accent** — light/dark/system, and a default / match-system / custom
  accent (or tint it from album art).
- **Placement & animation** — flyout position, target monitor, duration,
  animation speed and easing.
- **Focus mode** — suppress automatic flyouts and hide taskbar widgets while
  you work. Manual media flyout access remains available.
- **Reduce motion** — shorten transitions and stop decorative motion. The
  default follows the Windows animation setting.
- **App filtering** — blacklist or whitelist which players may trigger flyouts.
- **Backup / restore** — export and import all settings.

If Windows did not provide a subsystem (for example audio or media sessions),
a banner at the top of the dashboard names it and the related settings are
disabled. The tray icon tooltip shows the same summary.

## MediaFlyouts Pro (Store version)

The Microsoft Store version is free. The audio visualizer, the per-app mixer,
peripheral battery, the Now Playing styles and the media widget options are
**Pro**. New installs get all of them for 15 days; after that they switch off
quietly and their toggles show a **PRO** badge. The card on the **Home** page
shows the days left and the price, and a click opens the Store purchase. Your
settings are kept, so buying Pro brings everything back as you had it. If you
bought MediaFlyouts while it was a paid app, you already have Pro. The
installer and portable builds are not gated.

## Support

The **Support** page in the dashboard is where to say thanks. Every build links
to the donation page; the installer and portable builds also show a UPI QR
code and bank transfer details with Copy buttons, and the Store build offers
donations through the web page. Donations unlock nothing.

## Startup & updates

Enable **launch on startup** to have MediaFlyouts start with Windows (minimized
to tray). Installer and portable builds use the Windows `Run` registry key;
MSIX installs use the Windows startup-task mechanism. Turn on **automatic update
checks** to be notified when a newer release is available. The About page can
also check manually and install an available update. After an update, the
first launch shows a short **What's new** note; **About → What's new** shows
it again.
