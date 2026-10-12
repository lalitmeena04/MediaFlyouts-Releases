# Packaging

MediaFlyouts ships four GitHub release artifacts, all produced by
[`.github/workflows/release.yml`](../.github/workflows/release.yml) when a
`v*.*.*` tag is pushed:

| Artifact | File | Built from |
|----------|------|------------|
| Installer | `MediaFlyouts-<ver>-setup.exe` | [`MediaFlyouts.iss`](MediaFlyouts.iss) (Inno Setup) |
| Portable ZIP | `MediaFlyouts-<ver>-win64.zip` | the deployed `bin/` folder |
| Source ZIP | `MediaFlyouts-<ver>-src.zip` | `git archive` of the tag |
| Store MSIX (unsigned) | `MediaFlyouts-<ver>.msix` | [`msix/AppxManifest.xml`](msix/AppxManifest.xml) via [`tools/stage-msix.ps1`](../tools/stage-msix.ps1) |

The MSIX is the exact file uploaded to the Microsoft Store, which signs and
distributes it. It is unsigned, so it cannot be installed from the release
directly; it is published so the Store build can be matched to a tag. See
[Microsoft Store submission](#microsoft-store-submission).

All artifacts are built from the **release** preset with the Qt runtime staged
next to the executable by `windeployqt`.

## Build locally

```powershell
# 1. build + deploy the app into bin\
cmake --preset msvc-release -D "CMAKE_PREFIX_PATH=<Qt>/msvc2022_64"
cmake --build --preset msvc-release
& "<Qt>/msvc2022_64/bin/windeployqt.exe" --release --qmldir Views bin\MediaFlyouts.exe

# 2. installer (needs Inno Setup 6; version is read from the VERSION file)
& "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe" packaging\MediaFlyouts.iss

# 3. source zip
git archive --format=zip -o dist\MediaFlyouts-1.4.1-src.zip HEAD

# 4. unsigned Store MSIX (needs the Windows SDK: makeappx)
.\tools\stage-msix.ps1 -Version 1.4.1.0 -Output dist\MediaFlyouts-1.4.1.msix `
    -IdentityName <Store Identity Name> -IdentityPublisher 'CN=<GUID>'
```

The version comes from the top-level [`VERSION.txt`](../VERSION.txt) file, which
is the single source of truth for the app, the installer and the release
workflow.

## Icon assets

The app icon (`packaging/assets/MediaFlyouts.ico`, embedded into the exe via
[`MediaFlyouts.rc`](MediaFlyouts.rc)) and the MSIX tile logos
(`packaging/msix/Images/`) are generated from code by
[`tools/generate_icon.ps1`](../tools/generate_icon.ps1). Re-run it to regenerate
them after changing the design:

```powershell
powershell -ExecutionPolicy Bypass -File tools\generate_icon.ps1
```

## Microsoft Store submission

The Store signs the MSIX with Microsoft's certificate, so no code-signing
certificate is needed anywhere in this repo and users never have to trust a
`.cer`. The installer and ZIP artifacts are unsigned. The signed, installable
MSIX exists only in the Store; the one on GitHub is the unsigned input.

[`tools/stage-msix.ps1`](../tools/stage-msix.ps1) stages `bin\`, the manifest
and the tile images, stamps the version and the Store identity, and packs the
unsigned `.msix`. The package is then **uploaded by hand** in Partner Center;
submission is not automated.

### Setup

1. Reserve the app name (**Media Flyouts**) in Partner Center and note the
   values on **Product identity**.
2. Add these **repository variables** (public values, they appear in every
   shipped package):
   - `STORE_IDENTITY_NAME` — Product identity → Package/Identity/Name
   - `STORE_IDENTITY_PUBLISHER` — Product identity → Package/Identity/Publisher (`CN=<GUID>`)

Until the variables exist the MSIX step is skipped and the GitHub release
ships only the installer and ZIPs.

### Releasing to the Store

1. Push the `v*.*.*` tag. The workflow builds the unsigned MSIX and attaches
   it to the GitHub release as `MediaFlyouts-<ver>.msix`. Or build it locally:
   ```powershell
   .\tools\release.ps1 -StoreIdentityName <name> -StoreIdentityPublisher 'CN=<GUID>'
   # -> release\MediaFlyouts-<ver>.msix
   ```
2. Download that `.msix` from the release, open the app in Partner Center →
   **Start update** → **Packages**, and upload it. Using the release asset
   keeps the Store build byte-identical to the tag.
3. Review the listing, paste the release notes, and **Submit**. On the first
   submission also justify the `runFullTrust` restricted capability (keyboard
   hook, taskbar placement, WASAPI loopback capture).

### Manifest rules the Store enforces

- `Identity Name` / `Publisher` must equal the reserved values; the repo
  manifest holds placeholders that `stage-msix.ps1` replaces.
- `PublisherDisplayName` must equal the Partner Center publisher display name
  (`ScleaverZer0ne`).
- Every `DisplayName` (`Package/Properties`, `uap:VisualElements`, the startup
  task) must be a name reserved in Partner Center (**Media Flyouts**). An
  unreserved name fails package validation.
- `TargetDeviceFamily MinVersion` must be above `10.0.17134.0`; the manifest
  uses `10.0.19041.0`. Only the `Identity Version` attribute is stamped, never
  `MinVersion`.
- The package must be uploaded **unsigned**.
