# MediaFlyouts

Fluent-styled flyouts and taskbar widgets for Windows, built with Qt 6 / C++ /
QML. MediaFlyouts replaces the dated Windows media and volume popups and adds
lock-key, now-playing, peripheral-battery and charger flyouts, a per-app volume
mixer, and a taskbar widget stack with a now-playing readout, battery rings and
a live audio visualizer.

> **Status:** stable — `v1.4.2`. Windows 10/11 (x64).

## Highlights

- **Media flyout** on media/volume keys with album art, transport controls,
  repeat / shuffle and a draggable seekbar.
- **Volume flyout** that replaces the native OSD, follows the default output
  device, and expands into an optional **per-app mixer** with real app icons.
- **Lock-keys flyout** for Caps / Num / Scroll / Insert.
- **Now Playing** flyout on track change, in a card or compact-pill style.
- **Taskbar widgets** — a now-playing widget with transport controls, a
  "Pause all" button and a multi-style **audio visualizer** (bars, radial,
  waveform, beat-driven particles), plus a **peripheral battery widget**; side
  by side or stacked in one scrollable slot.
- **Peripheral battery monitoring** over Bluetooth Classic / LE, Google Fast
  Pair, DualSense, Razer and Logitech (Unifying / Bolt / Lightspeed) plus wired
  USB, with connect / disconnect / low-battery flyouts and a **charger flyout**.
- **Theming** — light / dark / system, dark title bars, and a selectable accent
  (default, match-system, or custom, or tinted from album art).
- **App filtering**, a searchable **settings dashboard** with a status banner
  for unavailable Windows subsystems, settings **backup/restore**, a first-run
  **onboarding** wizard, launch on startup and an **update checker**.

See [docs/FEATURES.md](docs/FEATURES.md) for the full list, and
[CHANGELOG.md](CHANGELOG.md) for release notes.

## Documentation

Full documentation lives in [docs/](docs/README.md):

- **Users** — [Installation](docs/user/installation.md) · [User Guide](docs/user/user-guide.md) · [FAQ](docs/user/faq.md) · [Privacy Policy](docs/PRIVACY.md)
- **Developers** — [Architecture](docs/developer/architecture.md) · [Development Setup](docs/developer/development-setup.md) · [Build Guide](docs/developer/build-guide.md) · [Testing](docs/developer/testing.md) · [Contributing](docs/developer/contributing.md)
- **Reference** — [Features](docs/FEATURES.md) · [Controllers](docs/api/controllers.md) · [Model](docs/api/models.md) · [QML UI](docs/api/qml-ui.md)
- **Releases** — [Release Notes](docs/RELEASE_NOTES.md)

## Install

Grab the latest build from the [Releases page](https://github.com/scleaverzer0ne/MediaFlyouts/releases):

- **Installer** — `MediaFlyouts-<version>-setup.exe`. Recommended for most users.
- **Microsoft Store** — search for **Media Flyouts** in the Store. Signed by
  Microsoft and updated automatically.
- **Portable ZIP** — `MediaFlyouts-<version>-win64.zip`. Unzip and run
  `MediaFlyouts.exe`; no installation required.
- **Source ZIP** — `MediaFlyouts-<version>-src.zip` for building yourself.
- **MSIX** — `MediaFlyouts-<version>.msix` is the **unsigned** package that is
  submitted to the Store, published for transparency. Windows will not install
  it directly; use the Store listing instead.

MediaFlyouts is a self-contained C++ app; no .NET runtime is required.

## Build from source

Prerequisites:

- **Qt 6.8+** (msvc2022_64) — the CI builds against 6.8; local development uses
  6.11.
- **Visual Studio 2022** (MSVC toolchain)
- **CMake ≥ 3.21** and **Ninja**

```powershell
# configure + build (release)
cmake --preset msvc-release -D "CMAKE_PREFIX_PATH=<path-to-Qt>/msvc2022_64"
cmake --build --preset msvc-release

# run the tests
ctest --preset msvc-release --output-on-failure

# stage the Qt runtime next to the exe
& "<path-to-Qt>/msvc2022_64/bin/windeployqt.exe" --release --qmldir Views bin/MediaFlyouts.exe
```

The runnable app and its deployed Qt runtime are written to `bin/`. Presets are
defined in [CMakePresets.json](CMakePresets.json) (`msvc-debug`,
`msvc-release`).

Packaging the installer / MSIX / ZIP artifacts is described in
[packaging/README.md](packaging/README.md) and automated in
[.github/workflows/release.yml](.github/workflows/release.yml).

## Project layout

| Path | Contents |
|------|----------|
| `Model/` | Cross-platform domain logic (settings, track info, FFT, positioning) |
| `Controllers/` | App + Windows integration (media, volume, tray, taskbar, etc.) |
| `Views/` | QML UI (flyouts, dashboard, taskbar widget, visualizer) |
| `tests/` | GoogleTest + Qt Test suites |
| `packaging/` | Installer / MSIX packaging inputs |
| `docs/` | Feature documentation |

## Contributing

Issues and pull requests are welcome. Please run the test suite
(`ctest --preset msvc-release`) and format C++ with the repository
[`.clang-format`](.clang-format) before submitting.

## License

MediaFlyouts is released under the [MIT License](LICENSE).
