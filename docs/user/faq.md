# FAQ & Troubleshooting

## Does MediaFlyouts need .NET or any runtime?
No. It's a self-contained C++/Qt application. Everything it needs ships with the
installer, MSIX or portable ZIP.

## The MSIX from the Releases page won't install (error `0x800B0100`)
That file is the **unsigned** package submitted to the Microsoft Store; it is
published so the Store build can be matched to a release, not for direct
install. Install **Media Flyouts** from the Store (Microsoft signs it), or use
the installer or portable ZIP. Releases before 1.4.1 shipped a self-signed MSIX
with a `MediaFlyouts.cer`; that is no longer the case.

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
standalone window. In the Store version the mixer is a **Pro** feature (see
below); after the trial the toggle is greyed out until you get Pro.

## What is MediaFlyouts Pro?
The Microsoft Store version is free. Five features are part of **Pro**: the
audio visualizer, the per-app mixer, peripheral battery (widget, flyout and
low-battery notification), the Now Playing styles and the media widget options
(controls, pause/play all, layout, pause overlay, title scrolling, adaptive
colors). Everything else is free. Pro is a one-time purchase through the
Microsoft Store, made from the card on the **Home** page.

## I bought MediaFlyouts when it was a paid app. Do I have to pay again?
No. If your Microsoft account acquired the app before it became free, you have
Pro for good on every PC where you sign in with that account. The app reads
this from the Store; nothing to enter. If the Home page still shows an upgrade
card, make sure you are signed in to the Microsoft Store app and online, then
restart MediaFlyouts. Still wrong? **Report a Bug** with an error report; the
log shows what the Store answered.

## My trial ended and some features switched off
Every new Store install gets 15 days of Pro, counted from the day your account
acquired the app. When it ends the Pro features turn off quietly; their
toggles stay visible but greyed out with a **PRO** badge, and your choices are
kept. Getting Pro restores them exactly as they were. Reinstalling does not
restart the trial.

## I use the installer or portable ZIP. Is anything locked?
No. Only the Store build has the paywall. The installer and portable builds
include every feature, and the **Support** page in the dashboard shows how to
leave a donation if you want to say thanks.

## How do I donate?
Open the dashboard and go to **Support**. Every build links to the donation
page. The installer and portable builds also show a UPI QR code and bank
transfer details with Copy buttons; the Store build offers one-time tips
through the Microsoft Store instead. Donations are voluntary and unlock
nothing.

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

## How do I reset everything to the defaults?
Open the dashboard, go to **Additional Settings** and click **Restore default
settings…**. Confirm the prompt and every setting returns to its factory value.
The first-run wizard does not show again. Export your settings first if you
may want them back.

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
[repository](https://github.com/lalitmeena04/MediaFlyouts).
