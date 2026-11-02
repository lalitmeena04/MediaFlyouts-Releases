# Model API

The `Model/` sources build into the `mediaflyout_core` static library
(`Qt6::Core` only) and hold the app's portable, unit-tested domain logic.

## Settings

`Settings : QObject` — persisted application settings backed by `QSettings`,
exposed to QML as the `settings` context property.

- One `Q_PROPERTY` per setting with a `changed()` notify signal.
- `exportTo(QUrl)` / `importFrom(QUrl)` — backup and restore.
- `resetToDefaults()` — clears every stored value and reloads the defaults.
  `onboardingCompleted` is kept when it was set, so the wizard does not return.
- `playerAllowed(name)`, `filterMode`, `filterList`, `addFilterEntry` /
  `removeFilterEntry` — app filtering.
- `configDir()` — the settings folder (for "Open Config Folder").
- `language` — UI language code (`"de"`, `"pt_BR"`, …). Empty follows the
  Windows display language. `AppTranslator` applies it.
- Most defaults are literals in `reload()`; `taskbarWidgetSide` is the exception
  — on first run it is seeded from the system taskbar alignment and written to
  the store, so a later system change never moves a widget the user has placed.

## Localization (`namespace mf`)

The shipped language list and the pure resolution logic, with no Qt GUI
dependency. `supportedLanguages()` returns `{code, nativeName}` entries in
picker order (English first). `matchLanguage("pt-BR")` normalises separators,
case and script tags and falls back to the base language (`de-AT` → `de`,
`pt-PT` → `pt_BR`). `resolveLanguage(requested, systemUiLanguages)` prefers an
explicit request, then the first system language that matches, then English.
`translationFileName(code)` and `isRightToLeft(code)` round it out. See
[localization.md](../developer/localization.md).

## TrackInfo (`namespace mf`)

Plain struct describing the current track (title, artist, album, source app,
`PlaybackState`, position/duration, repeat/shuffle, capability flags) plus
helpers: `formatDuration(ms)`, `formatTrackLine(track)`,
`playbackProgress(track)`.

## PlaybackController

`IPlaybackController` — transport abstraction (`play`, `pause`, `next`,
`previous`, optional `seek` / `setRepeatMode` / `setShuffle` / session cycling)
so playback logic stays mockable. `togglePlayPause(controller, state)` is a free
helper.

## Fft

`mf::fft`, `mf::magnitudeSpectrum`, `mf::spectrumBands`, and `mf::frequencyBars`
— a radix-2 FFT and log-spaced, dB-mapped band extraction used by the visualizer.

## FlyoutPositioner

Pure geometry that computes a flyout's on-screen rectangle from a position enum,
screen bounds and size — the testable core behind `FlyoutPlacement`.

## TaskbarLayout (`namespace mf`)

`TaskbarReserve` holds the leading (Start / task buttons) and trailing (tray,
clock, show-desktop) taskbar rects a widget must not cover.
`taskbarWidgetX(screen, reserve, side, offset, width, margin)` returns the
widget's left edge; a reserve counts only when it sits within `kEdgeTolerance`
of its screen edge, and `kUnmeasuredTrayWidth` is held back when the tray could
not be measured. The testable core behind `TaskbarInfo`.

## BackdropContrast (`namespace mf`)

The testable core behind `TaskbarBackdrop`. `pixelLuma` / `meanLuma` turn
0xAARRGGBB pixels into a Rec. 601 luma (transparent pixels are skipped).
`BackdropTone` smooths samples and flips between dark and light with
hysteresis (`ToneThresholds`), so a live wallpaper does not make widget text
flicker. `readableLightness` returns the HSL lightness a foreground color needs
over the current backdrop. `sampleStripsBeside` builds the rects to sample on
each side of a widget, clipped to the screen and skipping sibling widgets.

## AlbumArtProvider

A `QQuickImageProvider` that serves the current album art to QML (`image://…`).

## Capabilities

`Capabilities : QObject` — tracks which platform subsystems answered, exposed to
QML as the `capabilities` context property. Every flag starts `true` and clears
only after a controller reports failure, so a working machine never flickers
into a degraded state at startup.

- `audioAvailable`, `mediaSessionAvailable`, `lockKeysAvailable`,
  `mediaKeysAvailable`, `chargerAvailable` — one flag per subsystem, each fed by
  the matching controller's `availabilityChanged` signal in
  `MainControllerClass`.
- `degraded` / `unavailableNames` — drive the dashboard status banner so a lost
  subsystem is explained instead of silently disabling settings.
- `statusSummary()` — one-line text used for the tray icon tooltip.
- `chargerAvailable` is excluded from `degraded`: a desktop with no battery is
  normal, not a failure.

## Entitlement (`namespace mf`)

The pure core of the Pro paywall (see
[dev-notes/PRO-PAYWALL-PLAN.md](../../dev-notes/PRO-PAYWALL-PLAN.md)). No Store
or Windows dependency, so every branch is unit-tested.

- `Tier` (`Free`, `Trial`, `Pro`), `ProFeature` (the gated features) and
  `EntitlementSource` (why a tier was granted: `AddOn`, `Grandfathered`,
  `StoreTrial`, `LocalTrial`, `Cached`, `Expired`, `Unlocked`).
- `resolveEntitlement(EntitlementInputs)` takes the install kind, what the
  Store answered (`StoreFacts`: add-on licensed, acquisition date), the last
  `EntitlementCache`, the `EntitlementPolicy` (gating flag, cutover, trial
  days) and `now`. It fails open: non-Store installs, gating off or a missing
  cutover are `Pro`. An acquisition before the cutover is grandfathered. A
  trial runs `trialDays` from the acquisition date, or from the first run when
  the Store does not answer. The clock cannot move backwards:
  `effectiveNow = max(now, cache.lastSeen)`.
- `cacheFrom(state)` is what a caller persists after a resolution.
- `isUnlocked(feature, tier)`, `trialDaysLeft(now, end)`, stable ids
  (`tierId`, `sourceId`, `featureId`, `featureFromId`, `allFeatureIds`) for
  QML and logs, and `describeEntitlement(state)` for one-line diagnostics.

## EntitlementStore (`namespace mf`)

Persists the `EntitlementCache` in one sealed file
(`MediaFlyouts/Entitlement.dat`, next to the user settings ini), apart from
`Settings`, so a settings export, import or reset never copies or restarts a
trial. The payload is compact JSON (`tier`, `trialEnd`, `lastSeen`, UTC)
passed through an `IEntitlementCodec` before it hits the disk:

- `DpapiCodec` *(Windows, default)* — `CryptProtectData` bound to the signed-in
  Windows user. Another user or PC cannot open the file. No key ships in the
  app; the OS holds it. An altered payload fails DPAPI's own integrity check.
- `ChecksumCodec` *(portable, tests)* — salted SHA-256 tag in front of the
  plain bytes. Detects edits, not copies.

File layout: `MFE1` magic, one codec id byte, sealed bytes. A file from another
codec, user or machine, a truncated or edited file, or malformed JSON all load
as an invalid cache (logged), which resolves like a first run. Writes go
through `QSaveFile`. `load()`, `save()`, `clear()`; `serializeEntitlementCache`
/ `parseEntitlementCache` are exposed for tests.

## ProBuildConfig (`namespace mf`)

The Store identifiers and gating policy compiled into the binary
(`MEDIAFLYOUTS_PRO_ADDON_STORE_ID`, `MEDIAFLYOUTS_STORE_CUTOVER_UTC`,
`MEDIAFLYOUTS_TRIAL_DAYS`, `MEDIAFLYOUTS_TIP_ADDON_STORE_IDS`).
`parseProBuildConfig()` is the pure parser: trims, reads the cutover as UTC
(a bare date-time counts as UTC, offsets are normalised), falls back to 15
trial days on bad input, de-duplicates tip ids. A bad or empty cutover leaves
gating off. `proBuildConfig()` returns the parsed build values and logs them
once.

## Donation (`namespace mf`)

`DonationConfig` holds the public payee details compiled in
(`MEDIAFLYOUTS_DONATE_*`): page URL (http(s) only), UPI VPA (must contain
`@`), payee name, and the NEFT fields (bank, account, IFSC upper-cased,
holder). `donationLayoutFor(kind)` is the policy rule: `StoreLink` for Store
installs, `Direct` otherwise. `upiPaymentUri(vpa, payee, note)` builds the
`upi://pay?pa=…&pn=…&cu=INR&tn=…` deep link with the `@` kept literal.

## QrCode

`mf::renderQrCode(text, modulePx, quiet)` draws a QR code (qrcodegen, MIT,
fetched by CMake) into a `QImage`; null for empty or oversized text.
`QrImageProvider` serves it as `image://qr/<base64url text>`, scaling by
whole modules so edges stay crisp at the requested `sourceSize`.

## Peripheral battery helpers

Pure, unit-tested logic shared by the battery providers, so the protocol and
policy rules can be exercised without real hardware:

- **BatteryUtils** — strips Bluetooth profile suffixes from device names,
  converts milliwatt-hours to a percentage, and decodes the Bluetooth Class of
  Device into a category ("mouse", "keyboard", "headset", "gamepad"). Device
  categories come from Bluetooth or HID metadata rather than the display name.
- **FastPairProtocol** — frames the Google Fast Pair message stream and decodes
  battery events, including the per-component levels of a true-wireless set and
  the charging flag.
- **DualSenseProtocol** — CRC32 and report parsing for DualSense controllers.
- **RazerProtocol** — builds the 90-byte feature reports and reads the battery
  level (reported on a 0-255 scale) and charging state.
- **HidppProtocol** — Logitech HID++ 2.0 requests and replies, covering both the
  modern `0x1004` UnifiedBattery and the legacy `0x1000` feature, plus the
  `0x0005` DeviceName feature (name, type), charging state, long-report
  rewriting and request / reply matching.
- **JabraGnpProtocol** — Jabra GN protocol frames (64-byte report 5 on the
  `0xFF00` vendor collection): GET requests addressed to a headset behind a
  Link adapter or on USB, reply matching by sequence, NACK reasons, battery
  level / charging flag and the length-prefixed headset name.
- **BatteryAlertPolicy** — decides which changes deserve an alert: battery
  buckets, downward threshold crossings with hysteresis, connect/disconnect
  debouncing, and baseline seeding so launching the app is silent.

`BatteryAlertPolicy` uses Full (90-100%), Good (41-89%), Half (21-40%), Low
(11-20%), Very low (1-10%) and Unknown buckets. Low and very-low warnings fire
when crossing downward and re-arm after charging back above the threshold.
Repeated connect/disconnect events are debounced, and the initial snapshot is
seeded without producing an alert burst.

## WinMediaProvider *(Windows)*

Bridges the WinRT **System Media Transport Controls** to `TrackInfo`, feeding
`NowPlaying`.
