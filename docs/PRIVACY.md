# MediaFlyouts Privacy Policy

**Effective date:** 11 November 2026
**Applies to:** MediaFlyouts / "Media Flyouts" for Windows, all distribution
channels (Microsoft Store, installer, portable ZIP).

MediaFlyouts is a proprietary desktop utility published by ScleaverZer0ne.
All rights to the source code are reserved. The Microsoft Store edition is
free and offers a one-time **MediaFlyouts Pro** add-on and optional tips as
in-app purchases, all processed by Microsoft. Buying any of them does not
change anything in this policy: the app has no account and no licence server
of its own.
This policy explains what information the app handles and what it does with
it. The short version: **MediaFlyouts collects no personal data, contains no
telemetry, analytics or advertising, and sends nothing about you to the
developer.**

## 1. Data the app processes locally

To do its job MediaFlyouts reads information from your PC. The following data
is processed locally and is not sent to the developer.

| Information | Why it is read | Where it goes |
|---|---|---|
| Now-playing metadata (track title, artist, album, album art, playback state) from the Windows System Media Transport Controls | Media and Now Playing flyouts, taskbar widget | Memory only; discarded when the track changes or the app exits |
| Optional browser extension: the title and favicon of one audible, remembered, or active tab, and the number of audible tabs | Fallback image when a browser session has no album art | Sent locally to MediaFlyouts through a native messaging host; not saved or sent to the developer. The extension reads the favicon URL to fetch the icon as described in section 3 |
| Optional browser extension: audio and video elements in audible tabs | Pause all browser tabs when you use MediaFlyouts' Pause all control | The extension runs a pause command in audible tabs only after you press Pause all. It does not read page text or collect page content. |
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
- **Browser integration** — when you choose to set it up, a native-host
  manifest is saved in the app's local data folder and its path is registered
  under your Windows user account for the chosen browser. For Chrome, Edge and
  Brave, the app also attempts to register the extension ID and official store
  update URL in that browser's system-wide external-install registry key. If
  Windows denies access, the app opens the store page for a normal install.
  These entries contain no browsing data.
- **Pro entitlement cache** (Store version) — a small file
  (`Entitlement.dat`, next to the settings file) remembers the last answer the
  Store gave: your tier (free, trial or Pro), the trial end date and the last
  time the app ran. It lets Pro features keep working when you are offline. It
  is encrypted with Windows Data Protection for your Windows account, holds no
  account identifiers or payment data, and is not included in settings export
  or error reports. Deleting it is harmless; the app asks the Store again.
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
- **Error reports** — only when you ask for one: **Create error report** or
  **Save report and restart** on the About page, or **Restart MediaFlyouts**
  in the tray menu (**Report a Bug** in the tray menu opens the About page).
  The restart actions save a report first so the log of the session you are
  restarting is kept. The app
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
  opens your browser on a blank issue template that names the report file.
  No system details are placed in the URL. You can open and edit the report
  before posting. Once posted, it is public under GitHub's policies.

Apart from error reports and the browser registry entry described above,
nothing is written outside your user profile. Nothing is uploaded.

## 3. Network access

MediaFlyouts and its optional browser extension make network requests only in
the situations described here:

- **Microsoft Store licence check (Store version only)** — at start, after a
  purchase, and when Windows reports a licence change, the app asks the
  Windows Store APIs (`Windows.Services.Store`) for three things: whether your
  account owns the **MediaFlyouts Pro** add-on, the date your account
  acquired the app (this decides the 15-day trial and keeps earlier buyers on
  Pro), and the localized add-on prices. Windows performs these requests
  against Microsoft's Store services under the
  [Microsoft Privacy Statement](https://privacy.microsoft.com/privacystatement);
  the app sends nothing of its own and never talks to a server run by the
  developer. The installer and portable versions do not make this request.
  Buying Pro or a tip opens the Microsoft Store purchase dialog; Microsoft
  handles the payment and the developer receives no personal or payment data.
- **Update check and download** — when "check for updates" is enabled (or
  triggered manually from the dashboard), the app sends an HTTPS `GET` to
  `https://api.github.com/repos/lalitmeena04/MediaFlyouts-Releases/releases/latest`
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
- **Browser favicon** — when the optional extension is installed, it may fetch
  the favicon URL of a single audible tab or, when none is audible, the last
  identified or active tab, from the site or its icon provider. The request
  omits credentials and can expose your IP address to that server. The URL is
  not sent to MediaFlyouts or the developer. When you use **Pause all**, the
  extension also queries which tabs are audible and runs a script in those
  tabs to pause their audio and video elements. This uses the extension's
  `scripting` permission and does not send page content over the network. You
  can remove the extension in your browser to stop these requests and controls.

Links in the tray menu or dashboard (Repository, Open new issue, release page,
the donation page on the **Support** page) open in your default browser; those
sites have their own policies. The Support page itself shows payment details
that are compiled into the app; it sends nothing anywhere, and **Copy** only
writes to your clipboard.

Album art is obtained from the media player through Windows. Browser favicons
are fetched separately by the optional extension as described above.

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
of the app, of **MediaFlyouts Pro** or of a tip is processed entirely by
Microsoft: the developer never receives your name, email address or payment
details, only anonymous sales totals. The app checks your licence through the
Windows Store APIs (§3) and never contacts a developer server to verify it.

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
<https://github.com/lalitmeena04/MediaFlyouts-Releases/issues>.
