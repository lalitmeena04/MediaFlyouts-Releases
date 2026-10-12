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
.\mediaflyouts.ps1 test -ShowOutput
.\mediaflyouts.ps1 test -FailFast
.\mediaflyouts.ps1 test -Shuffle -Repeat -RepeatCount 5
```

`-Filter` selects matching GoogleTest cases, `-ShowOutput` enables verbose CTest
output, `-FailFast` stops on the first failure, and `-Shuffle` with
`-RepeatCount` exercises ordering-sensitive or intermittent failures.

## Layout

```
tests/
  gtest_main.cpp              # GoogleTest/GMock entry point (QCoreApplication)
  CMakeLists.txt
  Model/                      # Settings, TrackInfo, PlaybackController,
                              # FlyoutPositioner, AlbumArtProvider, Fft
  Controllers/                # NowPlaying, ThemeController, UpdateChecker,
                              # Win32ControllersTest (Windows-only smoke tests)
```

- **GoogleTest / GMock** — pure-logic and mock-based tests (e.g. transport
  forwarding through a mocked `IPlaybackController`, FFT behavior, settings).
- **Qt Test** — one guiless executable per class for the Qt-flavored cases.

## What is covered

- **Settings** — defaults, setters/signals, persistence, export/import, app
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
