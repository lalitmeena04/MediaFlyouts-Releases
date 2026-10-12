# Build Guide

This guide covers building MediaFlyouts and producing the release artifacts.

## Build the app

```powershell
# release build with the Qt runtime staged into bin\
.\mediaflyouts.ps1 build -Config release -Clean

# or with CMake presets directly
cmake --preset msvc-release -D "CMAKE_PREFIX_PATH=<Qt>/msvc2022_64"
cmake --build --preset msvc-release
& "<Qt>/msvc2022_64/bin/windeployqt.exe" --release --qmldir Views bin\MediaFlyouts.exe
```

The version comes from the top-level [`VERSION.txt`](../../VERSION.txt), which
CMake reads and injects into the app as `MEDIAFLYOUTS_VERSION`.

### Version numbering

`VERSION.txt` holds the plain base version (e.g. `1.4.1`). How CMake stamps it
depends on the build:

- **Release** builds ship the plain version: `1.4.1`.
- **Dev** builds (any non-Release config, or when a build number is passed
  explicitly) get a traceable `-<build number>` suffix. The number defaults to
  the git commit count and short hash, e.g. `1.4.1-157.d28b008`.

The suffix is compared away by the update checker, so a dev build is never
flagged as out of date against the plain release. Override the number with
`-DMEDIAFLYOUTS_BUILD_NUMBER=<n>` on the CMake command line, or
`.\mediaflyouts.ps1 build -BuildNumber <n>`.

### File logging

File logging is on by default. The compile-time level follows the build type:
`DEBUG` for Debug builds, `INFO` for Release (so `TRC_DEBUG` lines compile
out of shipped binaries). Override or disable it when needed:

```powershell
.\mediaflyouts.ps1 build -NoLogging
# or with CMake directly
cmake --preset msvc-release -D "MEDIAFLYOUTS_ENABLE_LOGGING=OFF"
cmake --preset msvc-release -D "MEDIAFLYOUTS_LOG_LEVEL=DEBUG"
```

Logs are written under `%LOCALAPPDATA%\MediaFlyouts\MediaFlyouts\logs\`, with
rotating 2 MB files and up to three retained files (`mf::kLogFileMaxBytes`,
`mf::kLogFilesKept`). Identical lines repeated within 5 s collapse into one
"Skipped N duplicates" line. Warnings flush at once; other levels every 2 s.
Qt and QML messages (`qWarning`, `console.warn`, binding loops) are routed
into the same file with a `[qt]` prefix. The logger also writes to the MSVC
debugger output when available.

`ErrorReporter` (About page → **Create error report**) copies these logs plus
`settings.ini` and a `report.txt` system summary into
`%LOCALAPPDATA%\MediaFlyouts\MediaFlyouts\reports\`, zips it with the built-in
`tar.exe`, and keeps the three newest reports.

## Release artifacts

The GitHub release consists of four artifacts (see the
[Installation Guide](../user/installation.md) for what each is):

| Artifact | Built from |
|----------|------------|
| `MediaFlyouts-<ver>-setup.exe` | Inno Setup — [`packaging/MediaFlyouts.iss`](../../packaging/MediaFlyouts.iss) |
| `MediaFlyouts-<ver>-win64.zip` | the deployed `bin/` folder |
| `MediaFlyouts-<ver>-src.zip` | `git archive` of the tag |
| `MediaFlyouts-<ver>.msix` | [`packaging/msix/AppxManifest.xml`](../../packaging/msix/AppxManifest.xml) via [`tools/stage-msix.ps1`](../../tools/stage-msix.ps1) — **unsigned**, the file uploaded to the Microsoft Store |

The MSIX is not installable from the release; the Store signs it and users
install the signed copy from the Store listing.

### Automated (CI)
Push a `v*.*.*` tag to run
[`.github/workflows/release.yml`](../../.github/workflows/release.yml), which
builds, tests, packages the four artifacts and publishes a GitHub Release in
the `MediaFlyouts-Releases` repo. The MSIX is then uploaded to Partner Center
by hand. The MSIX step is skipped until the `STORE_IDENTITY_*` variables
described in
[`packaging/README.md`](../../packaging/README.md#microsoft-store-submission) exist.

Before tagging, make sure both of these are on `main`:

- [`VERSION.txt`](../../VERSION.txt) matches the tag — the workflow fails the
  release if they disagree.
- [`docs/RELEASE_NOTES.md`](../RELEASE_NOTES.md) has a `## Version <ver>` section
  — its body becomes the GitHub Release description, and a missing section fails
  the release rather than publishing an empty one.

### MSIX startup task and Store signing

The MSIX manifest declares `MediaFlyoutsStartupTask`, so packaged installs can
launch at Windows sign-in through the platform startup-task API. Installer and
portable builds use the Windows `Run` registry key instead. The Settings toggle
selects the appropriate mechanism automatically.

The Store signs the MSIX with Microsoft's certificate, so the repo holds no
signing material and users never trust a `.cer`. [`tools/stage-msix.ps1`](../../tools/stage-msix.ps1)
stamps the version and the Store identity (`Identity Name` / `Publisher`) that
Partner Center reserved; the repo manifest carries placeholders.

### Local
Produce every artifact into a clean `release/` folder with one script — it does a
clean release build, deploys Qt, and builds the source/portable/installer plus
the unsigned Store MSIX:

```powershell
.\tools\release.ps1            # all artifacts
.\tools\release.ps1 -StoreIdentityName <name> -StoreIdentityPublisher 'CN=<GUID>'
.\tools\release.ps1 -SkipBuild # reuse the current bin\
.\tools\release.ps1 -DevBuild  # dev (pre-release) versioned build
```

`-DevBuild` stamps a `<base>-<git commit count>.<short sha>` version into the
binary and every artifact name (e.g. `MediaFlyouts-1.4.1-157.d28b008-setup.exe`).
The MSIX and installer keep a strictly numeric version (`<base>.<count>`, e.g.
`1.4.1.157`) since Windows packaging requires it.

Missing optional tools (Inno Setup, Windows SDK `makeappx`) are reported and
skipped rather than failing the run.

To run the steps by hand instead, after a release build:

```powershell
$ver = (Get-Content VERSION.txt -Raw).Trim()
New-Item -ItemType Directory -Force release | Out-Null

# source + portable
git archive --format=zip -o "release/MediaFlyouts-$ver-src.zip" HEAD
Compress-Archive bin\* "release/MediaFlyouts-$ver-win64.zip"

# installer (needs Inno Setup 6)
& "$env:LOCALAPPDATA\Programs\Inno Setup 6\ISCC.exe" "/O$(Resolve-Path release)" packaging\MediaFlyouts.iss
```

For the MSIX (packaging + signing) and the icon assets, see
[`packaging/README.md`](../../packaging/README.md) and
[`tools/generate_icon.ps1`](../../tools/generate_icon.ps1).

## Icons

The app icon (`packaging/assets/MediaFlyouts.ico`, embedded via
[`packaging/MediaFlyouts.rc`](../../packaging/MediaFlyouts.rc)) and the MSIX tile
logos are generated by
[`tools/generate_icon.ps1`](../../tools/generate_icon.ps1).
