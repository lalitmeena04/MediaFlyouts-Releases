# MediaFlyouts Privacy Policy

**Effective date:** 9 October 2026
**Applies to:** MediaFlyouts / "Media Flyouts" for Windows, all distribution
channels (Microsoft Store, installer, portable ZIP, source build).

MediaFlyouts is an open-source desktop utility published by ScleaverZer0ne.
The source code is available under the MIT License; the Microsoft Store
edition is a paid listing. Paying for it does not change anything in this
policy: the app has no account, no licence server and no in-app purchases.
This policy explains what information the app handles and what it does with
it. The short version: **MediaFlyouts collects no personal data, contains no
telemetry, analytics or advertising, and sends nothing about you to the
developer.**

## 1. Data the app processes locally

To do its job MediaFlyouts reads information from your PC. All of this is
processed in memory on your device and is never transmitted anywhere.

| Information | Why it is read | Where it goes |
|---|---|---|
| Now-playing metadata (track title, artist, album, album art, playback state) from the Windows System Media Transport Controls | Media and Now Playing flyouts, taskbar widget | Memory only; discarded when the track changes or the app exits |
| Master and per-application volume, mute state, running audio app names and icons | Volume flyout and per-app mixer | Memory only |
| System audio output (WASAPI loopback) | Audio visualizer on the taskbar widget | Converted to a frequency spectrum in memory in real time; the audio is never recorded, stored or sent. Capture runs only while the visualizer is enabled and visible |
| Media and lock-key presses (`Play/Pause`, `Next`, `Previous`, `Stop`, `Volume Up/Down/Mute`, `Caps`, `Num`, `Scroll`, `Insert`) via a low-level keyboard hook | Triggering the flyouts | Only these specific keys are inspected. No other keystrokes are read, logged or stored. MediaFlyouts is not a keylogger |
| Peripheral device names, device type, battery level, charging state, Bluetooth address and connection state | Peripheral battery widget and flyouts | Memory only; custom names you assign are saved in settings (see §2) |
| Lock-key state, foreground fullscreen state, monitor layout, taskbar position, system theme and accent colour | Placing and styling the flyouts and widgets | Memory only |

## 2. Data the app stores on your device

- **Settings** — your preferences (enabled flyouts, positions, theme, custom
  peripheral names, app filter list, etc.) are saved in a local settings file in
  your user profile. "Open Config Folder" in the tray menu shows where. You can
  export, import or delete this file at any time; uninstalling the Store or
  installer version removes it.
- **Logs** — the app writes a diagnostic log under its local data folder
  (`%LOCALAPPDATA%\MediaFlyouts\MediaFlyouts\logs\`). It records app events:
  start and exit, which subsystems came up or failed (audio, media session,
  keyboard hook, Bluetooth, HID), display layout, update checks, and warnings
  raised by the app or by Qt. It can include peripheral device names and model
  identifiers (for example "MX Master 4") because they are needed to diagnose
  battery problems. It never contains media titles, album art, audio,
  keystrokes, volume levels you set, or any account information. Logs rotate
  at 2 MB and at most three files are kept (about 6 MB total). Repeated
  identical lines are collapsed. Delete the folder at any time; the app
  recreates an empty log on next start. Developer builds log at a more
  verbose level.
- **Error reports** — only when you click **Create error report** on the About
  page (or **Report a Bug** in the tray menu, which opens that page). The app
  writes a report under `C:\ProgramData\MediaFlyouts\reports\` (or
  `Downloads\MediaFlyouts\reports\` when that folder is not writable)
  containing: `report.txt` (app version, Windows version and build, CPU
  architecture, Qt version, locale, monitor layout, which subsystems are
  unavailable, the path of your settings file), `settings.ini` (a copy of your
  settings, which includes custom peripheral names and your app filter list),
  and `logs/` (the log files above). It is zipped when the Windows archiver is
  available. At most three reports are kept. `ProgramData` is shared by every
  account on the PC, so other users of the same PC can read a report there.
  **The report stays on your PC.**
  You decide whether to attach it to a GitHub issue; **Open new issue** only
  opens your browser with a prefilled issue template that contains the short
  system summary from `report.txt`. You can open and edit the report before
  posting. Once posted, it is public under GitHub's policies.

Nothing is written outside your user profile and nothing is uploaded.

## 3. Network access

MediaFlyouts makes exactly one kind of network request, and only if you let it:

- **Update check and download** — when "check for updates" is enabled (or
  triggered manually from the dashboard), the app sends an HTTPS `GET` to
  `https://api.github.com/repos/scleaverzer0ne/MediaFlyouts-Releases/releases/latest`
  to compare version numbers. If you installed with the setup program and then
  choose **Download & install**, the app downloads the installer file listed in
  that release from `github.com` over HTTPS, verifies its checksum, and starts
  it when you click **Install**. Store installs are updated by the Microsoft
  Store and the app only offers to open it; portable copies are pointed to the
  release page. To tell these apart the app reads its own package identity and
  the installer's uninstall registry entry; neither is sent anywhere.
  These requests carry the user agent `MediaFlyouts` and the standard
  connection information any web request exposes (your IP address). They are
  handled by GitHub under the
  [GitHub Privacy Statement](https://docs.github.com/site-policy/privacy-policies/github-privacy-statement).
  MediaFlyouts sends no identifiers, settings or usage data with them.

Links in the tray menu or dashboard (Repository, Open new issue, release page)
open in your default browser; those sites have their own policies.

Album art is obtained from the media player through Windows, not downloaded by
MediaFlyouts.

## 4. Data the developer receives

None automatically. There is no account, sign-in, crash reporter, telemetry,
analytics or advertising SDK in the app. The developer cannot see who installs
or uses MediaFlyouts. The only way information reaches the developer is when
you choose to post it yourself, for example by attaching an error report (§2)
to a GitHub issue.

If you install from the **Microsoft Store**, Microsoft may collect install and
usage statistics under the
[Microsoft Privacy Statement](https://privacy.microsoft.com/privacystatement);
the developer only sees aggregated, anonymous Store statistics. Your purchase
is processed entirely by Microsoft: the developer never receives your name,
email address or payment details, only anonymous sales totals. The Store
licence is checked by Windows when the app is launched, not by the app itself,
and MediaFlyouts never contacts any server to verify it.

If you open an issue on GitHub, anything you post there is public and governed
by GitHub's policies.

## 5. Permissions

The Store package declares the `runFullTrust` capability. It is required for a
packaged desktop app to use the Windows APIs listed in §1 (keyboard hook, Core
Audio, WASAPI loopback, taskbar window placement, HID and Bluetooth battery
queries). It does not grant the app any network or cloud access beyond §3.

## 6. Children

MediaFlyouts is a general-purpose utility, is not directed at children, and
collects no data from anyone.

## 7. Changes to this policy

Changes are published in this file in the project repository and noted in the
changelog. The effective date at the top is updated with each change.

## 8. Contact

Questions about this policy: open an issue at
<https://github.com/scleaverzer0ne/MediaFlyouts-Releases/issues>.
