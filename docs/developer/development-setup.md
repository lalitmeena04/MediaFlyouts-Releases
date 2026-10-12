# Development Setup

## Prerequisites

- **Windows 10/11 (x64)**
- **Qt 6.8+** for **msvc2022_64** (development uses 6.11; CI builds against 6.8)
- **Visual Studio 2022** with the C++ (MSVC) toolset
- **CMake ≥ 3.21** and **Ninja**
- **Git**

## Get the code

```powershell
git clone https://github.com/scleaverzer0ne/MediaFlyouts.git
cd MediaFlyouts
```

## Configure & build

The quickest path is the helper script, which locates the MSVC toolchain and
deploys the Qt runtime into `bin/`:

```powershell
.\mediaflyouts.ps1 build                 # debug build
.\mediaflyouts.ps1 build -Config release # release build
.\mediaflyouts.ps1 build -RunTests       # build then run the tests
.\mediaflyouts.ps1 build -Clean          # clean build
.\mediaflyouts.ps1 build -NoLogging      # disable file logging
.\mediaflyouts.ps1 build -SkipDeploy     # skip windeployqt
.\mediaflyouts.ps1 build -NoTests        # skip test configuration
```

Run tests directly, or use the helper's focused and repeatable test options:

```powershell
.\mediaflyouts.ps1 test
.\mediaflyouts.ps1 test -Filter "RazerProtocolTest.*"
.\mediaflyouts.ps1 test -ShowOutput -FailFast
.\mediaflyouts.ps1 test -Shuffle -Repeat -RepeatCount 10
```

The helper script configures the MSVC and Qt environment, supports debug and
release builds, and keeps deployment in `bin/`. Use the CMake presets directly
when you need to customize the generator or cache.

Or use CMake presets directly:

```powershell
cmake --preset msvc-debug -D "CMAKE_PREFIX_PATH=<Qt>/msvc2022_64"
cmake --build --preset msvc-debug
```

Presets (`msvc-debug`, `msvc-release`) are defined in
[`CMakePresets.json`](../../CMakePresets.json). The app and its deployed Qt
runtime are written to `bin/`.

## Run

```powershell
.\bin\MediaFlyouts.exe
```

It starts minimized to the tray. A second launch just activates the
already-running instance; open the dashboard from the tray icon.

## Editor

Any editor works; VS Code with the CMake Tools and C++ extensions is convenient.
Point CMake at the `msvc-debug` preset. Format C++ with the repository
[`.clang-format`](../../.clang-format) before committing.

## Next steps

- [Architecture Overview](architecture.md)
- [Build Guide](build-guide.md) (packaging the release artifacts)
- [Testing Guide](testing.md)
- [Contributing Guide](contributing.md)
