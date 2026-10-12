# FAQ & Troubleshooting

## Does MediaFlyouts need .NET or any runtime?
No. It's a self-contained C++/Qt application. Everything it needs ships with the
installer, MSIX or portable ZIP.

## The MSIX won't install (error `0x800B010A`)
The MSIX is signed with a self-signed certificate that isn't trusted yet. In an
**elevated** PowerShell:

```powershell
Import-Certificate -FilePath MediaFlyouts.cer -CertStoreLocation Cert:\LocalMachine\Root
```

Then install the `.msix`. Prefer the installer or portable ZIP to avoid this.

## A flyout doesn't appear when I press media/volume keys
- Make sure the relevant flyout is enabled in **Settings**.
- The media flyout only appears when a player is actually playing (it reads the
  Windows System Media Transport Controls).
- If a **fullscreen** app is in the foreground, flyouts are suppressed by design
  (this can be disabled in Settings).
- Check **App Filtering** — a whitelist/blacklist may be hiding the player.

## The native Windows volume popup still shows
The app suppresses the native OSD while the volume flyout is enabled. If both
appear briefly, ensure the volume flyout is enabled and restart the app. During
the first-run wizard the native OSD is deliberately left alone, so it is normal
to see it until you finish onboarding.

## The per-app mixer is missing from the volume flyout
It is off by default from v1.1.0 on. Turn on the in-flyout mixer from the Volume
flyout page in Settings, or use **Volume Mixer** in the tray menu for the
standalone window.

## The taskbar widget disappears or moves
It hides over fullscreen apps and re-anchors when the taskbar changes (monitor,
DPI). Use the Taskbar Widget page to set the side, monitor and offset. On first
run the side is chosen to avoid your taskbar buttons — left for a center-aligned
taskbar, right for a left-aligned one — and is never changed again once set.

## One of my peripherals shows no battery
The device has to report its level over a transport we can read: Bluetooth
Hands-Free, Bluetooth LE, Google Fast Pair, or a supported vendor protocol
(DualSense, Razer, Logitech HID++). Devices that report nothing include:

- Bluetooth **speakers**, which have no microphone and therefore no Hands-Free
  profile — Windows itself shows no battery for them either.
- Keyboards and mice on a **generic 2.4GHz dongle** using an undocumented
  vendor protocol.
- Some headsets on their own dongle, even when the same headset reports fine
  over Bluetooth — pairing it over Bluetooth instead will show the battery.

If Windows Settings → Bluetooth & devices shows no battery for the device
either, there is nothing for MediaFlyouts to read.

## Where are my settings stored?
Use **Open Config Folder** in the tray menu. Settings live in a per-user `.ini`
file; you can also **export/import** them from the dashboard.

## Where are the log files?

When file logging is enabled, diagnostic logs are stored in
`%LOCALAPPDATA%\MediaFlyouts\logs\`. Files rotate at 5 MB and up to three
files are retained. Open the config folder from the tray menu to reach the
`logs` directory.

## How do I start MediaFlyouts with Windows?
Enable **launch on startup** in Settings (it uses the Windows `Run` registry
key). It starts minimized to the tray.

## How do I report a bug or request a feature?
Use **Report a Bug** in the tray menu, or open an issue on the
[repository](https://github.com/scleaverzer0ne/MediaFlyouts).
