# Packaging

MediaFlyouts ships three GitHub release artifacts, all produced by
[`.github/workflows/release.yml`](../.github/workflows/release.yml) when a
`v*.*.*` tag is pushed. No source archive is published; the source is
proprietary (see [LICENSE](../LICENSE)).

| Artifact | File | Built from |
|----------|------|------------|
| Installer | `MediaFlyouts-<ver>-setup.exe` | [`MediaFlyouts.iss`](MediaFlyouts.iss) (Inno Setup) |
| Portable ZIP | `MediaFlyouts-<ver>-win64.zip` | the deployed `bin/` folder |
| Store MSIX (unsigned) | `MediaFlyouts-<ver>.msix` | [`msix/AppxManifest.xml`](msix/AppxManifest.xml) via [`tools/stage-msix.ps1`](../tools/stage-msix.ps1) |

The MSIX is the exact file uploaded to the Microsoft Store, which signs and
distributes it. It is unsigned, so it cannot be installed from the release
directly; it is published so the Store build can be matched to a tag. See
[Microsoft Store submission](#microsoft-store-submission). For a package you
can install on your own PC see [Local (sideload) MSIX](#local-sideload-msix).

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

# 3. unsigned Store MSIX (needs the Windows SDK: makeappx)
.\tools\stage-msix.ps1 -Version 1.4.1.0 -Output dist\MediaFlyouts-1.4.1.msix `
    -IdentityName <Store Identity Name> -IdentityPublisher 'CN=<GUID>'
```

The version comes from the top-level [`VERSION.txt`](../VERSION.txt) file, which
is the single source of truth for the app, the installer and the release
workflow.

## Icon assets

The master logo is `packaging/assets/MediaFlyouts.png` (square PNG,
transparent background). [`tools/generate_icon.ps1`](../tools/generate_icon.ps1)
crops the mark and renders every derived asset from it:

- `packaging/assets/MediaFlyouts.ico` — multi-size icon embedded into the exe
  via [`MediaFlyouts.rc`](MediaFlyouts.rc), used by the installer, and
  compiled into the app (`:/icons/MediaFlyouts.ico`) for the tray and window
  frames.
- `packaging/assets/icon-256.png` — in-app logo (`qrc:/icons/icon-256.png`)
  shown by `Views/AppLogo.qml` in the dashboard, onboarding and update dialog.
- `packaging/msix/Images/*.png` — MSIX tile logos.

Replace the master PNG and re-run the script to change the icon everywhere:

```powershell
powershell -ExecutionPolicy Bypass -File tools\generate_icon.ps1
```

Two Pro masters, `MediaFlyoutsProBar.png` and `MediaFlyoutsProRibbon.png`,
render with `-Variant pro-bar` / `-Variant pro-ribbon` into
`MediaFlyoutsPro{Bar,Ribbon}.ico` and `icon-pro-{bar,ribbon}-256.png`. A
licensed Pro user (`entitlement.licensed`: add-on, grandfathered or cached,
never the always-unlocked installer build) gets one of those pairs at runtime
for the tray icon, window frames and `AppLogo`, and picks which under
Additional Settings → Pro icon (`settings.proIconStyle`, default: side bar).
The style table lives in `Controllers/AppIcon.h`; `Views/AppLogo.qml` mirrors
it. The MSIX tiles, Start menu and taskbar pin come from the manifest and
always show the base mark.

## Local (sideload) MSIX

To test the packaged (Store-like) build on your own PC, produce a second MSIX
signed with a self-signed certificate:

```powershell
.\mediaflyouts.ps1 package -SignLocal        # add -SkipBuild to reuse bin\
.\tools\install-local-msix.ps1               # trusts the .cer (asks for elevation), then installs
```

`-SignLocal` adds two artifacts next to the Store MSIX:

| File | Purpose |
|------|---------|
| `MediaFlyouts-<ver>-local.msix` | Same bits as the Store MSIX, `Publisher="CN=MediaFlyouts"`, signed |
| `MediaFlyouts-<ver>-local.cer` | Public certificate to trust before installing |

[`tools/sign-msix-local.ps1`](../tools/sign-msix-local.ps1) keeps one
self-signed code-signing certificate (`CN=MediaFlyouts`, friendly name
"MediaFlyouts local MSIX signing", 5 years) in `Cert:\CurrentUser\My`, creates
it on first use, signs with `signtool` and exports the `.cer`. The private key
never leaves your certificate store and nothing is written into the repo.
`-NewCertificate` replaces the certificate; trust the new `.cer` again.

Installing needs the certificate in the machine **Trusted People** store
(elevated) and sideloading allowed (Settings → System → For developers; on by
default on Windows 11):

```powershell
Import-Certificate -FilePath release\MediaFlyouts-<ver>-local.cer -CertStoreLocation Cert:\LocalMachine\TrustedPeople
Add-AppxPackage release\MediaFlyouts-<ver>-local.msix
```

The local package has a different publisher than the Store package, so it
installs side by side with a Store copy and keeps its own settings (packaged
apps get `AppData` redirected into `%LOCALAPPDATA%\Packages\<family>\LocalCache`).
Packages are not timestamped: they stop installing when the certificate
expires. Only you should trust this certificate; do not ship the `-local`
files to users.

## Microsoft Store submission

The Store signs the MSIX with Microsoft's certificate, so no code-signing
certificate is needed for shipping and users never have to trust a `.cer`.
The installer and ZIP artifacts are unsigned. The signed, installable MSIX
exists only in the Store; the one on GitHub is the unsigned input. The
self-signed certificate from `-SignLocal` is for your own PC only.

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
   - From v2.0.0 also the Pro add-on and donation variables listed in the
     [Release Guide §7](../docs/developer/release-guide.md#7-pro-add-on-cutover-and-donations).

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
   hook, taskbar placement, WASAPI loopback capture). From v2.0.0 the listing
   must also name the in-app purchases (MediaFlyouts Pro, tips) with their
   price range and the 15-day trial, and the notes must declare the external
   donation link.

### Store listing text and screenshots

The listing (description, features, what's new, captions, search terms) is
kept in all eleven languages in
[`tools/store/make_listing_csv.py`](../tools/store/make_listing_csv.py).
It turns a Partner Center **Export listings** CSV into the
`tools/store/import/` folder for **Import listings → Upload folder**: the
CSV with every text field filled, the screenshot rows and IDs kept from the
export, plus one dashboard screenshot from `tools/store/screenshots/` for
each language that has none yet (the Store needs at least one per listing).
Image cells must name the path with the root folder
(`import/dashboard-de.png`); a bare file name makes the whole import fail.
[`tools/store/capture-dashboard.ps1`](../tools/store/capture-dashboard.ps1)
produces those screenshots from a debug build at the Store's 1366×768
desktop minimum; it runs the app on a scratch settings folder through the
debug-only `MEDIAFLYOUTS_SETTINGS_DIR` variable. The generated folder is
committed as a fallback. The export itself is gitignored: its name carries
the submission id and it changes every submission.

Add-on listings (Title, 200-character Description, 300×300 icon) follow the
same path with
[`tools/store/make_addon_listing_csv.py`](../tools/store/make_addon_listing_csv.py):
export from the add-on's submission page, run
`python tools\store\make_addon_listing_csv.py pro <export>.csv`, and upload
`tools/store/addon-import/`. A fresh add-on exports only the `default`
column; the script appends one column per language and the import creates
those listings.

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
