# Controllers API

The `Controllers/` sources connect the model to Windows and to QML. Cross-platform
controllers build everywhere; the rest are Windows-only.

## Cross-platform

### NowPlaying
QML-facing now-playing model (`nowPlaying`). Applies `TrackInfo` updates, exposes
title/artist/art/progress and transport `Q_INVOKABLE`s, and decides whether a
change should raise the media flyout or the "Now Playing" flyout. Forwards transport
commands to an `IPlaybackController`. Windows media sessions are matched by app
ID and refreshed through queued hooks, which keeps source and playback changes
reliable during rapid switching.

### TrayController
Owns the `QSystemTrayIcon` and its dark, Fluent-style context menu; emits intents
(open dashboard, show flyout, open mixer) and `notify()` toasts. Menu text is
set through `tr()` in `retranslate()`, which `AppTranslator::languageChanged`
triggers after a language switch.

### AppTranslator
Runtime side of localization (`i18n` context property). `apply(code)` resolves
the request against `QLocale::system().uiLanguages()` with
`mf::resolveLanguage`, installs `:/i18n/MediaFlyouts_<code>.qm` plus Qt's own
`qtbase_<code>` when deployed, sets the default `QLocale`, calls
`QQmlEngine::retranslate()` and emits `languageChanged()`. Repeated calls with
the same request are no-ops, so it can be driven straight from
`Settings::changed`. `languages` lists picker entries (`code`, native `name`);
the first entry has an empty code and means "follow the system".
`rightToLeft` is true for Arabic.

### ThemeController
Computes the theme/accent palette (`theme` context property) from `Settings` and
the system accent; honors light/dark/system and default/match-system/custom
accent.

### FlyoutPlacement
Resolves a flyout's screen position from the placement settings for QML
(`Q_INVOKABLE position(w, h)`, `monitorNames()`). Monitors come from
`MonitorMapper`.

### MonitorMapper
One app-wide `QScreen` → native monitor map (`HMONITOR` on Windows, built from
`QNativeInterface::QWindowsScreen`). `TaskbarInfo`, `FlyoutPlacement` and
`FullscreenDetector` consume it instead of resolving monitors on their own.
Exposes `geometry(index)` / `availableGeometry(index)` to QML and converts
native rects to logical pixels.

### SingleInstance
Ensures a single running instance (via a local server); a second launch signals
the primary, which surfaces its dashboard only if the tray icon is hidden.

### UpdateChecker
Queries the GitHub releases API and exposes `updateAvailable`, `latestVersion`,
etc. `isNewerVersion(current, latest)` does the dotted-numeric comparison. The
running version comes from `MEDIAFLYOUTS_VERSION`. A newer release emits
`updateFound(version)`; `Views/UpdateDialog.qml` offers **Skip this version**
(stored in `settings.skippedUpdateVersion`) or **Download & install**.
`download()` fetches the `*-setup.exe` asset picked by `pickInstallerAsset()`
into the temp folder, verifies the release `digest` (or size), then `install()`
starts it and emits `installStarted` so the app quits. The in-app installer is
offered only when `mf::detectInstallKind()` (`Model/InstallSource.h`) reports
`Installer` — i.e. not packaged and running from the Inno Setup
`InstallLocation`. Store copies are sent to `ms-windows-store://downloadsandupdates`
(`openStorePage()`); portable copies to the release page.

### ErrorReporter
Builds a local diagnostics bundle for bug reports. `createReport()` writes
`report.txt` (`systemSummary()`: version, OS, Qt, screens, capabilities),
`settings.ini` (via `Settings::exportTo`) and copies of `logs/*.log` into
`reportsDir()`, zips the folder with the OS `tar` when available, and prunes to
`kReportsKept` reports. `reportsDir()` is the first writable entry of
`reportRootCandidates()`: `%ProgramData%\MediaFlyouts\reports`, then
`Downloads\MediaFlyouts\reports`, then `AppDataLocation/reports`. AppData is
last because Store (MSIX) builds have it redirected into the package
`LocalCache`, invisible to Explorer. `revealReport()` selects the file in
Explorer, or opens the reports folder when the file is gone;
`openIssuePage()` opens GitHub's new-issue page with a prefilled template
(`issueUrlFor()`). The template names only the report file. System details
stay in the report. Nothing is uploaded by the app.
`mf::hostVisiblePath()` (`Model/InstallSource.h`) maps a virtualised AppData
path to its real `LocalCache` location for packaged installs; the tray's
**Open Config Folder** and the report's "Settings file" line use it.

### AppRestarter
Restarts the app from the tray menu (**Restart MediaFlyouts**) or the About
page (**Save report and restart**). `restart()` first calls
`ErrorReporter::createReport()`, so the log of the session that misbehaved is
kept, flushes logging, starts a new process with
`relaunchArguments()` (the current arguments plus `--wait-for-pid <pid>`) and
quits. At startup `waitForPredecessor()` reads that switch and blocks (up to
`kPredecessorTimeoutMs`) until the old process is gone, *before*
`SingleInstance` is created; otherwise the new process would hand over to the
one it replaces and exit. `status` tells QML whether the relaunch failed.

### WindowScaleRefresher
Keeps every top-level window at the logical size the app asked for across
DPI changes. Windows defers `WM_DPICHANGED` for hidden windows, so after a
monitor is removed or added a hidden flyout can be bound by Qt to a screen
whose DPI differs from the DPI its native window still has. Qt then scales the
native size for the new screen and Windows scales it again on show. The
refresher calls a window *settled* only when `GetDpiForWindow` equals the DPI
of `QWindow::screen()` (`mf::scaleIsSettled`). Resize events seen while
unsettled, or that do not match what Qt computes now, are not recorded
(`mf::resizeIsAuthoritative`). Once settled, drift from the recorded size is
undone (`mf::sizeToRestore`), with a one pixel nudge when Qt already reports
the target size but the last resize event did not (`mf::needsNudge`). Checks
run on `MonitorMapper::changed`, on `Show`, on `DevicePixelRatioChange`, and
after each suspicious resize. The pure rules live in
`Model/WindowScalePolicy.h`.

### EntitlementController
The `entitlement` context property: the Pro paywall seen from QML (see
[dev-notes/PRO-PAYWALL-PLAN.md](../../dev-notes/PRO-PAYWALL-PLAN.md)). It
feeds `mf::resolveEntitlement` with the install kind, the Store answer
(`StoreSnapshot`) and the cached state, persists the result through
`EntitlementStore`, and re-resolves at the trial end (and daily) so the UI
flips without a restart. A Store answer that settles nothing (no add-on, no
acquisition date; typically the first launch after logon before the network
is up) is retried after 1, 5, 15, then 60 minutes, so a buyer is recognised
without a restart instead of running out the local trial.

- `tier` / `source` / `unlocked` / `isPro` / `isTrial` / `trialDaysLeft`, plus
  `gatingEnabled`, `storeAvailable`, `canPurchase`, `price`, `purchasing`,
  `refreshing`, `lastPurchaseStatus`, `tipAddOnStoreIds`, `featureIds`.
- `licensed` — Pro through a licence (add-on, grandfathered, cached), false
  for the always-unlocked installer build and for trials. Switches the tray,
  window and `AppLogo` icons to the Pro mark.
- `locked` — map of feature id → bool (`entitlement.locked.visualizer`) with
  `NOTIFY changed`, the thing Dashboard rows bind to. `isUnlocked(id)` is the
  same answer as an invokable; it does not notify, so a binding on it would
  freeze at the startup tier. An unknown id reads as unlocked and logs a
  warning: a typo must never lock a feature.
- `purchase(window)` buys the Pro add-on, `purchaseAddOn(id, window)` any
  add-on (tips). The QML `Window` becomes the owner of the Store dialog.
  `purchaseFinished(ok, statusId, storeId)` reports stable ids from
  `mf::purchase` (`succeeded`, `alreadyPurchased`, `notPurchased`,
  `networkError`, `serverError`, `unavailable`, `notConfigured`, `busy`);
  QML maps them to text.
- Talks to the Store through the `StoreGateway` interface
  (`StoreLicensing` on Windows, a fake in tests). Without a gateway the Store
  never answers and the offline fallbacks apply. Non-Store installs are
  always `Pro`; the Store is still queried for the logs.
- Debug builds honour `MEDIAFLYOUTS_ENTITLEMENT=free|trial|pro`
  (`source` = `override`, never cached).
- Build constants come from `mf::proBuildConfig()` (`MEDIAFLYOUTS_PRO_ADDON_STORE_ID`,
  `MEDIAFLYOUTS_STORE_CUTOVER_UTC`, `MEDIAFLYOUTS_TRIAL_DAYS`,
  `MEDIAFLYOUTS_TIP_ADDON_STORE_IDS`; see the build guide).

### ProGate
The `pro` context property: the *effective* value of every gated setting.
Reads `Settings` and `EntitlementController` and answers the stored value when
the feature is unlocked, the free-tier default when it is locked
(`visualizerEnabled`, `mixerEnabled`, `mixerWindowAllowed`,
`peripheralsWidgetEnabled`, `peripheralFlyoutEnabled`,
`peripheralLowBatteryToast`, `nextUpStyle`, `taskbarWidget*`). Emits
`changed` on either source. Flyouts and widgets bind to it; the stored
settings are never modified, so a purchase brings the user's choices back.
`MainControllerClass` also consults it for the low-battery tray toast.

### DonationController
The `donate` context property behind the Dashboard **Support** page. Built
from `mf::donationConfig()` (payee details stamped at build time) and the
install kind. `showDirect` (UPI QR + NEFT details) is true only for
installer/portable builds; the Store build gets `showStoreTips` (consumable
tip add-ons bought through `entitlement.purchaseAddOn`) and the page link,
which satisfies Store policy §10.8.2. `upiUri` is the `upi://pay` deep link,
`upiQrSource` the `image://qr/<base64url>` URL served by `QrImageProvider`.
`openPage()` opens the donation web page, `copyToClipboard(text)` backs the
Copy buttons. Donations unlock nothing.

### WhatsNewController
The `whatsNew` context property. On `start()` it compares
`Settings::lastSeenVersion` with the running base version
(`mf::baseVersion`, suffix stripped): a first run records the version and
stays quiet; a different version sets `pending`, and `App.qml` opens
`WhatsNewDialog` once onboarding is done. Closing the dialog calls
`markSeen()`. `requestShow()` reopens it from **About → What's new**. `text`
/ `body` come from the bundled `WHATS_NEW.md` (`:/whatsnew/`), the same file
pasted into the Store "What's new" field; `mf::whatsNewVersion` parses its
`Version x.y.z` first line and `WhatsNewTest` fails the build when it does
not match `VERSION.txt`.

## Windows-only

- **StoreLicensing** — the `StoreGateway` for packaged builds, over
  `Windows.Services.Store`. `refresh()` reads `GetAppLicenseAsync`
  (add-on licenses), `GetStoreProductForCurrentAppAsync` (the app's
  `AcquiredDate` from its owned SKU; `GetUserCollectionAsync` does not list a
  Desktop Bridge app itself) and
  `GetAssociatedStoreProductsAsync` (localized price) on a worker thread with
  a multi-threaded WinRT apartment, then answers with one `StoreSnapshot`.
  `purchase(id)` initializes the context with the owner HWND
  (`IInitializeWithWindow`) and runs `RequestPurchaseAsync` on the UI thread
  with a `Completed` handler; a successful consumable (tip) purchase is then
  reported with `ReportConsumableFulfillmentAsync` so it can be bought again.
  `OfflineLicensesChanged` is forwarded as
  `licensesChanged`. Unpackaged processes report `supported() == false` and
  answer every call with an unavailable snapshot. Every HRESULT is logged.
- **VolumeController** — master volume/mute via `IAudioEndpointVolume`; follows
  the default output device (`IMMNotificationClient`).
- **VolumeMixer** — per-app sessions via `IAudioSessionManager2` /
  `ISimpleAudioVolume`, with process icons; exposes `sessions` to QML.
- **AudioCapture** — WASAPI loopback + FFT; exposes `bands`, `level` and a
  `beat()` signal for the visualizer.
- **AccentWatcher** — polls the WinRT `UISettings` accent color.
- **WindowEffects** — applies a dark title bar via `DwmSetWindowAttribute`.
- **LockKeysController / MediaKeyController** — low-level keyboard hook for lock
  keys and media keys.
- **FullscreenDetector** — suppresses flyouts over fullscreen/exclusive apps.
- **NativeFlyoutSuppressor** — hides the native Windows volume OSD. `main.cpp`
  only starts/arms it once onboarding is complete, so the system OSD keeps
  working during the first-run wizard.
- **StartupController** — launch-on-startup via the MSIX startup-task API for
  packaged installs, or the `Run` registry key for unpackaged installs.
- **TaskbarInfo** — taskbar geometry for placing the widget. Finds the taskbar
  window that owns each monitor and measures its tray via UI Automation when
  the Win32 child is missing (Windows 11 secondary taskbars). Results are
  cached per taskbar for 2 s. Placement math is in `mf::taskbarWidgetX`.
- **TaskbarBackdrop** — reads the taskbar pixels beside a docked widget with
  `BitBlt` from the screen DC and reports `light` / `luminance` to QML. Two
  small strips left and right of the widget are sampled, never the widget
  itself, so it stays visible in captures. Windows passed to `sample()` earlier
  are kept out of later samples, so a sibling widget never skews the result.
  `readable(color, lightBackdrop)` returns an accent with a lightness that
  stays visible. Smoothing and hysteresis live in `mf::BackdropTone`.
- **BatteryStatusController** — aggregates peripheral battery from all providers
  into one list for QML. Real providers poll on a worker thread; connect and
  disconnect events arriving mid-poll are coalesced rather than dropped.
- **BatteryProviders/** — one per transport: Bluetooth Classic (Hands-Free
  battery property), Bluetooth LE (GATT), Fast Pair (RFCOMM message stream),
  DualSense (raw HID), Razer (90-byte feature reports), Logitech (HID++,
  long-report collection, all receiver slots probed at once) and Jabra (GN
  protocol through a Link adapter or the headset cable; wired-provider nodes
  of the same product are suppressed).
  `HidCollections` is the shared HID enumeration helper; `DevNodeHelpers`
  holds the shared `CM_*` device-node property and Bluetooth address helpers.
- **BluetoothConnectionWatcher / HidChangeWatcher** — instant connect and
  disconnect notifications, so the UI doesn't wait for the next poll.
- **PeripheralAlerts** — turns battery snapshots into connect / disconnect /
  low-battery events using `mf::BatteryAlertPolicy`; it also handles charging
  events, per-event settings, debounce and flyout/tray notification channels.
- **QmlLogger** — exposes debug, info, warning and error logging methods to QML.
