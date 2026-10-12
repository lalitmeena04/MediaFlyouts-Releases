# Model API

The `Model/` sources build into the `mediaflyout_core` static library
(`Qt6::Core` only) and hold the app's portable, unit-tested domain logic.

## Settings
`Settings : QObject` — persisted application settings backed by `QSettings`,
exposed to QML as the `settings` context property.
- One `Q_PROPERTY` per setting with a `changed()` notify signal.
- `exportTo(QUrl)` / `importFrom(QUrl)` — backup and restore.
- `playerAllowed(name)`, `filterMode`, `filterList`, `addFilterEntry` /
  `removeFilterEntry` — app filtering.
- `configDir()` — the settings folder (for "Open Config Folder").
- Most defaults are literals in `reload()`; `taskbarWidgetSide` is the exception
  — on first run it is seeded from the system taskbar alignment and written to
  the store, so a later system change never moves a widget the user has placed.

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

## AlbumArtProvider
A `QQuickImageProvider` that serves the current album art to QML (`image://…`).

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
  modern `0x1004` UnifiedBattery and the legacy `0x1000` feature.
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
