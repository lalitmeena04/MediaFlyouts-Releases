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

`VERSION.txt` holds the plain base version (e.g. `1.2.1`). How CMake stamps it
depends on the build:

- **Release** builds ship the plain version: `1.2.1`.
- **Dev** builds (any non-Release config, or when a build number is passed
  explicitly) get a traceable `-<build number>` suffix. The number defaults to
  the git commit count and short hash, e.g. `1.2.1-157.d28b008`.

The suffix is compared away by the update checker, so a dev build is never
flagged as out of date against the plain release. Override the number with
`-DMEDIAFLYOUTS_BUILD_NUMBER=<n>` on the CMake command line, or
`.\mediaflyouts.ps1 build -BuildNumber <n>`.

### Optional file logging

File logging is enabled by default for local builds. Disable it when needed:

```powershell
.\mediaflyouts.ps1 build -NoLogging
# or with CMake directly
cmake --preset msvc-release -D "MEDIAFLYOUTS_ENABLE_LOGGING=OFF"
```

Logs are written under `%LOCALAPPDATA%\MediaFlyouts\logs\`, with rotating
5 MB files and up to three retained files. The logger also writes to the MSVC
debugger output when available. Release CI builds disable file logging.

## Release artifacts

The release consists of four artifacts (see the
[Installation Guide](../user/installation.md) for what each is):

| Artifact | Built from |
|----------|------------|
| `MediaFlyouts-<ver>-setup.exe` | Inno Setup — [`packaging/MediaFlyouts.iss`](../../packaging/MediaFlyouts.iss) |
| `MediaFlyouts-<ver>.msix` | [`packaging/msix/AppxManifest.xml`](../../packaging/msix/AppxManifest.xml) |
| `MediaFlyouts-<ver>-win64.zip` | the deployed `bin/` folder |
| `MediaFlyouts-<ver>-src.zip` | `git archive` of the tag |

### Automated (CI)
Push a `v*.*.*` tag to run
[`.github/workflows/release.yml`](../../.github/workflows/release.yml), which
builds, tests, packages all four artifacts, signs the MSIX (with the stored
`MSIX_CERT_*` certificate, or a self-signed one generated on the runner) and
publishes a GitHub Release.

Before tagging, make sure both of these are on `main`:

- [`VERSION.txt`](../../VERSION.txt) matches the tag — the workflow fails the
  release if they disagree.
- [`docs/RELEASE_NOTES.md`](../RELEASE_NOTES.md) has a `## Version <ver>` section
  — its body becomes the GitHub Release description, and a missing section fails
  the release rather than publishing an empty one.

### MSIX startup task and signing

The MSIX manifest declares `MediaFlyoutsStartupTask`, so packaged installs can
launch at Windows sign-in through the platform startup-task API. Installer and
portable builds use the Windows `Run` registry key instead. The Settings toggle
selects the appropriate mechanism automatically.

The release workflow can reuse a persistent certificate through the
`MSIX_CERT_BASE64` and `MSIX_CERT_PASSWORD` secrets. Export a development
certificate with:

```powershell
.\tools\new-signing-cert.ps1 -ExportPfx -PfxPassword (Read-Host 'PFX password' -AsSecureString)
```

Without those secrets, CI creates a new self-signed certificate for the
release, so users must trust each release certificate separately. A trusted CA
certificate can be used for production releases. SignTool may report the
self-signed package as untrusted on the GitHub runner; the workflow records
that warning but does not fail after a successful signing operation. Users
must install `MediaFlyouts.cer` as a trusted root before installing the MSIX.

### Local
Produce every artifact into a clean `release/` folder with one script — it does a
clean release build, deploys Qt, and builds the source/portable/installer/MSIX
(signing the MSIX with the self-signed dev cert):

```powershell
.\tools\release.ps1            # all artifacts, signed MSIX
.\tools\release.ps1 -NoSign    # skip MSIX signing
.\tools\release.ps1 -SkipBuild # reuse the current bin\
.\tools\release.ps1 -DevBuild  # dev (pre-release) versioned build
```

`-DevBuild` stamps a `<base>-<git commit count>.<short sha>` version into the
binary and every artifact name (e.g. `MediaFlyouts-1.2.1-157.d28b008-setup.exe`).
The MSIX and installer keep a strictly numeric version (`<base>.<count>`, e.g.
`1.2.1.157`) since Windows packaging requires it.

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
