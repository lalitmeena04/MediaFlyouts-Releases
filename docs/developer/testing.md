# Testing Guide

MediaFlyouts has a portable core that is unit-tested with two frameworks, run
together through CTest.

## Running the tests

```powershell
# build + run everything
.\mediaflyouts.ps1 test

# or directly
ctest --preset msvc-debug --output-on-failure
```

There are **7 CTest targets**: one aggregated GoogleTest executable
(`gtest_all`) plus six per-class Qt Test executables.

### Focused and repeated runs

The helper script forwards useful diagnostics to GoogleTest and CTest:

```powershell
.\mediaflyouts.ps1 test -Filter "RazerProtocolTest.*"
.\mediaflyouts.ps1 test -Quiet
.\mediaflyouts.ps1 test -FailFast
.\mediaflyouts.ps1 test -Shuffle -Repeat -RepeatCount 5
node --test tests/browser-extension.test.js
```

Every test is listed as it runs. `-Filter` selects matching GoogleTest cases,
`-Quiet` reduces the output to a per-target summary, `-FailFast` stops on the
first failure, and `-Shuffle` with `-RepeatCount` exercises ordering-sensitive
or intermittent failures.

## Layout

```PlainText
tests/
  gtest_main.cpp              # GoogleTest/GMock entry point (QCoreApplication)
  CMakeLists.txt
  Model/                      # Settings, TrackInfo, PlaybackController,
                              # FlyoutPositioner, AlbumArtProvider, Fft
  Controllers/                # NowPlaying, ThemeController, UpdateChecker,
                              # AppTranslator, TrayControllerQtTest,
                              # Win32ControllersTest (Windows-only smoke tests)
  I18n/                       # Shipped .ts files are complete and consistent
  TestSupport/                # Shared helpers (isolated settings store)
```

- **GoogleTest / GMock** — pure-logic and mock-based tests (e.g. transport
  forwarding through a mocked `IPlaybackController`, FFT behavior, settings).
- **Qt Test** — one guiless executable per class for the Qt-flavored cases.

### Settings isolation

Tests that touch `Settings` must never read or wipe the developer's real
`%APPDATA%\MediaFlyouts\MediaFlyouts.ini`. `QStandardPaths::setTestModeEnabled`
does **not** move `QSettings` ini files on Windows, so
`tests/TestSupport/IsolatedSettings.h` points user-scope ini settings at a
scratch folder with `QSettings::setPath`. `gtest_main.cpp` applies it once for
the whole GoogleTest run; Qt Test executables call
`mftest::isolateUserSettings()` in `initTestCase()`. Use
`mftest::clearUserSettings()` in fixtures instead of clearing a `QSettings`
object by hand. A guard test fails if the store ever lands under the profile.

## What is covered

- **Settings** — defaults, setters/signals, persistence, export/import, reset
  to defaults, app
  filtering, and the once-only first-run seeding of `taskbarWidgetSide`.
- **Peripheral battery** — protocol parsing (Fast Pair, DualSense, Razer,
  HID++), Class of Device and HID usage decoding, and the alert policy
  (buckets, threshold crossings, hysteresis, debounce). The providers
  themselves need real hardware and are not unit tested.
- **Fft** — spectrum peaks, band normalization, frequency-bar mapping and edge
  cases.
- **NowPlaying** — flyout-trigger logic, transport/seek/repeat/shuffle
  forwarding, player-name parsing, art accent.
- **TrackInfo / PlaybackController** — formatting, progress, play/pause toggle.
- **ThemeController / UpdateChecker** — palettes, accent modes, version compare.
- **Localization** — language matching (`pt-BR` → `pt_BR`, `de-AT` → `de`,
  script tags dropped), system fallback, RTL flag. `AppTranslatorTest` loads
  the embedded `.qm` files and checks that `tr()` strings, a live QML
  `qsTr()` binding (via `QQmlEngine::retranslate()`), Qt's own `qtbase`
  strings and the default `QLocale` all switch. `TrayControllerQtTest`
  (Qt Test, needs `QApplication`) checks the tray menu and tooltip follow
  `retranslate()` and the `languageChanged` signal. `TranslationFilesTest`
  parses every `i18n/*.ts`: one file per shipped language, the CMake language
  list matches `Localization.cpp`, no `unfinished` entries, `%1`/`%2`
  placeholders preserved, same source set in every file, most entries differ
  from English, and — the main drift guard — every `qsTr()` / `tr()` literal
  in `Views/`, `Controllers/`, `Model/` and the root sources has a matching
  `<source>` and vice versa (fails with a hint to run `update_translations`).
  `QmlContractTest` fails on a `text:`/`label:`/… string literal in `Views/`
  that is not wrapped in `qsTr()`, and on `qsTr("…") + x` concatenation that
  should be `qsTr("… %1").arg(x)`.
- **Windows controllers** — default-state smoke tests for `VolumeMixer`,
  `AudioCapture`, `WindowEffects`.

## Adding a test

1. Add a `*Test.cpp` (GoogleTest) or `*QtTest.cpp` (Qt Test) under `tests/`.
2. Register it in [`tests/CMakeLists.txt`](../../tests/CMakeLists.txt) — GoogleTest
   files join the `mediaflyout_gtest` target; Qt Test files are added to the
   per-class list.
3. Keep new logic in the portable **Model** where possible so it can be tested
   without Windows APIs.
4. Run `ctest --preset msvc-debug` and ensure everything passes.
