# Release Guide

This guide covers preparing and publishing a MediaFlyouts release. The
[Build Guide](build-guide.md#release-artifacts) explains what the artifacts are
and how they are built. This guide covers the steps around them: pick a
version, update the files that carry it, tag, and verify.

## Overview

A release has four phases:

1. **Merge** — merge every pull request that belongs in the release into
   `main`. The release is always prepared on `main`, never on a feature or
   `dev` branch.
2. **Prepare** — on `main`, bump the version and write the notes. Commit
   directly to `main`.
3. **Tag** — push a `vX.Y.Z` tag on that commit. CI builds and publishes.
4. **Verify** — check both GitHub Releases and upload the MSIX to the Store.

Only the prepare step touches source files. Everything else is git and CI.

## 0. Start on an up-to-date `main`

Confirm that every pull request for the release is merged, then:

```powershell
git checkout main
git pull
git status --short   # must be empty
```

Do not start the version bump while a release pull request is still open.
The bump describes what `main` contains at tag time, so it goes last.

## 1. Pick the version

Follow [Semantic Versioning](https://semver.org/). Read the `[Unreleased]`
section of [`CHANGELOG.md`](../../CHANGELOG.md) and decide:

| Unreleased contains | Bump | Example |
|---------------------|------|---------|
| Only fixes (`### Fixed`), or packaging-only changes | **Patch** | `1.5.0 → 1.5.1` |
| Any new feature (`### Added`) or user-visible behavior change | **Minor** | `1.5.0 → 1.6.0` |
| Settings or data no longer load, or a feature is removed | **Major** | `1.5.0 → 2.0.0` |

The version must be plain `MAJOR.MINOR.PATCH`. The release workflow rejects
tags with any suffix.

## 2. Update the version files

Every file below carries the version. Update all of them in one commit.

| File | What to change |
|------|----------------|
| [`VERSION.txt`](../../VERSION.txt) | The plain version, e.g. `1.6.0`. CMake, Inno Setup, `tools/release.ps1` and the release workflow all read this file. |
| [`WHATS_NEW.md`](../../WHATS_NEW.md) | Rewrite for the release. First line `Version 1.6.0`, then a short `- ` bullet list in plain language. See [Write the release notes](#3-write-the-release-notes). |
| [`packaging/msix/AppxManifest.xml`](../../packaging/msix/AppxManifest.xml) | `Version="1.6.0.0"` on the `<Identity>` element. Four parts, last part `0`. |
| [`CHANGELOG.md`](../../CHANGELOG.md) | Rename `## [Unreleased]` to `## [1.6.0] — YYYY-MM-DD`. Add a new empty `## [Unreleased]` above it. Add a `[1.6.0]: …/releases/tag/v1.6.0` link at the bottom. |
| [`docs/RELEASE_NOTES.md`](../RELEASE_NOTES.md) | Add a `## Version 1.6.0 — <title> (<Month Year>)` section at the top. See [Write the release notes](#3-write-the-release-notes). |
| [`README.md`](../../README.md) | The status line: `` > **Status:** stable — `v1.6.0`. `` |
| [`docs/README.md`](../README.md) | The Release Notes bullet: `version history (v1.6.0)`. |

Find anything missed with:

```powershell
git grep -n "1\.5\.0" -- ':!tests' ':!CHANGELOG.md' ':!docs/RELEASE_NOTES.md'
```

Version strings inside `tests/` are sample data for the update checker and
settings tests. They do not need to track the release.

Files that do **not** need a manual edit:

- `packaging/MediaFlyouts.iss` reads `VERSION.txt` at compile time.
- `CMakeLists.txt` reads `VERSION.txt` and injects `MEDIAFLYOUTS_VERSION`.
- `tools/stage-msix.ps1` stamps the MSIX version from the workflow input.

## 3. Write the release notes

Three documents describe each release. They have different readers.

**`WHATS_NEW.md`** is for the person who just updated. The app shows it once
on the first launch after an update (and from **About → What's new**), and
the same text goes into the Partner Center **What's new in this version**
field. Rules, enforced by `WhatsNewTest`:

- First line is exactly `Version <ver>`; it must match `VERSION.txt`.
- Then a blank line and `- ` bullets. Plain text only: no `**`, `#` or links,
  because the Store field shows markup literally. At most 1500 characters.
- Three to five bullets, each one sentence or two, naming the setting that
  controls the feature. Skip internals and fixes nobody saw.

**`CHANGELOG.md`** is for developers. Keep the Keep-a-Changelog layout:
a one-paragraph summary, then `### Added`, `### Fixed`, `### Changed` as
needed. Each bullet starts with a bold title. Say what changed and why.

**`docs/RELEASE_NOTES.md`** is for end users. Its `## Version <ver>` section
becomes the GitHub Release description. The workflow extracts everything from
that heading up to the next `## ` heading and fails if the section is missing.
Use this shape:

```markdown
## Version 1.6.0 — <Short title> (October 2026)

<Two or three sentences. What the user gets. Lead with the biggest change.>

### <Feature area>

- <User-facing change. Name the setting that controls it if there is one.>

### Fixed

- <Bug as the user saw it, then what changed.>

### Downloads

See the [Releases page](https://github.com/lalitmeena04/MediaFlyouts-Releases/releases):
`MediaFlyouts-1.6.0-setup.exe`, `MediaFlyouts-1.6.0-win64.zip`, and the
unsigned Store package `MediaFlyouts-1.6.0.msix`. Install the signed MSIX from
the Microsoft Store.
```

Rules:

- Group by feature area, not by `Added` / `Changed`. Users think in features.
- Do not mention internal class names, files or tests.
- List only the three shipped artifacts. No source ZIP is published.
- Keep the heading format exact. The workflow matches `^## Version <ver>\b`.

## 4. Verify locally

Build and run the tests. This confirms CMake accepts the new `VERSION.txt`.

```powershell
.\mediaflyouts.ps1 build -RunTests
```

Check that the workflow will find the notes section:

```powershell
$ver = (Get-Content VERSION.txt -Raw).Trim()
Select-String -Path docs\RELEASE_NOTES.md -Pattern "^##\s+Version\s+$([regex]::Escape($ver))\b"
```

Optional: produce the artifacts locally to inspect the installer and MSIX.
`package` does a clean release build, then writes everything to `release\`.

```powershell
.\mediaflyouts.ps1 package
```

## 5. Commit and tag

Commit the prepare changes directly on `main` with a message like
`Update version to 1.6.0`. Push the commit, then tag it:

```powershell
git add -A
git commit -m "Update version to 1.6.0"
git push origin main
git tag v1.6.0
git push origin v1.6.0
```

The tag must point at the `main` commit that contains the version bump. The
[release workflow](../../.github/workflows/release.yml) checks out the tag,
compares it to `VERSION.txt` and fails on a mismatch.

If `main` moved while you were preparing (another pull request merged), pull
first and re-check the `[Unreleased]` section. New entries belong in the
release too.

If the tag push did not trigger the workflow, run it by hand from the Actions
tab with the version input `v1.6.0`.

## 6. After the workflow

The workflow does this on its own:

- Builds a release configuration and runs the tests.
- Produces `-setup.exe`, `-win64.zip` and the unsigned `.msix`.
- Pushes the deployed app files, `CHANGELOG.md` and `LICENSE` to the
  `MediaFlyouts-Releases` repository.
- Creates the GitHub Release in `MediaFlyouts-Releases` with the three
  artifacts and the notes section.
- Mirrors the same tag, artifacts and notes as a Release in this repository.

Then do by hand:

1. Open both Releases pages. Confirm the three assets and the notes.
2. Download `-setup.exe` on a clean machine or VM. Install and start the app.
   Check **About** shows the new version.
3. Start an older installed build. Confirm the update checker offers the new
   version and the download succeeds.
4. Upload `MediaFlyouts-<ver>.msix` to Partner Center. See
   [`packaging/README.md`](../../packaging/README.md#microsoft-store-submission).
   Paste `WHATS_NEW.md` (without the `Version` line if you prefer) into
   **What's new in this version**.
5. Update the Store listing in every language: edit the text dicts in
   [`tools/store/make_listing_csv.py`](../../tools/store/make_listing_csv.py)
   (at least `ReleaseNotes`, matching `WHATS_NEW.md`), export the current
   listing from Partner Center (**Store listings → Export listings**), run
   `python tools\store\make_listing_csv.py <export>.csv`, and upload the
   generated `tools\store\import` folder (**Import listings → Upload
   folder**, select the folder itself). The folder holds the CSV plus one
   dashboard screenshot per language that has none yet; image cells carry
   the path with the root folder name (`import/dashboard-de.png`), which
   Partner Center requires. Re-capture the screenshots when the dashboard
   changed: `.\tools\store\capture-dashboard.ps1` (debug build, stops any
   running MediaFlyouts). Commit the regenerated folder; it is the fallback
   if Partner Center loses the listing.

## 7. Pro add-on, cutover and donations

From v2.0.0 the Store app is free and sells a **MediaFlyouts Pro** durable
add-on (plan: `dev-notes/PRO-PAYWALL-PLAN.md`, user view:
[FEATURES.md](../FEATURES.md#mediaflyouts-pro-microsoft-store-build)). The
binary learns about it only through CMake cache variables, which the release
workflow fills from **repository variables**. Nothing is hard-coded.

| Repository variable | CMake variable | Meaning |
|---|---|---|
| `PRO_STORE_CUTOVER_UTC` | `MEDIAFLYOUTS_STORE_CUTOVER_UTC` | Instant the Store app became free, ISO-8601 UTC. **Unset = gating off, everything unlocked.** |
| `PRO_ADDON_STORE_ID` | `MEDIAFLYOUTS_PRO_ADDON_STORE_ID` | Store ID of the Pro add-on (`9N…`). Unset = no purchase button. |
| `PRO_TRIAL_DAYS` | `MEDIAFLYOUTS_TRIAL_DAYS` | Trial length. Default 15. |
| `PRO_TIP_ADDON_STORE_IDS` | `MEDIAFLYOUTS_TIP_ADDON_STORE_IDS` | Comma-separated consumable tip add-on IDs. |
| `DONATE_URL`, `DONATE_UPI_ID`, `DONATE_PAYEE_NAME`, `DONATE_BANK_NAME`, `DONATE_BANK_ACCOUNT`, `DONATE_BANK_IFSC`, `DONATE_BANK_HOLDER` | `MEDIAFLYOUTS_DONATE_*` | Support page details. All optional. |

Locally, pass the same values with `-Define`:

```powershell
.\tools\release.ps1 -StoreIdentityName <name> -StoreIdentityPublisher 'CN=<GUID>' `
    -Define MEDIAFLYOUTS_STORE_CUTOVER_UTC=2026-12-04T12:00:00Z,MEDIAFLYOUTS_PRO_ADDON_STORE_ID=9NXXXXXXXXXX
```

The configure log prints `MediaFlyouts Pro gating: ...`. Read it before you
upload: a Store build that says `off (no cutover)` sells nothing.

### One-time Partner Center setup (before v2.0.0)

1. **Create the add-on**: Partner Center → the app → **Add-ons** → **Create a
   new add-on** → *Durable*, product lifetime *Forever*, content type
   *Electronic software download*, name **MediaFlyouts Pro**. Under
   **Pricing** set the base currency to INR and the Default market group to
   ₹199 (nearest tier); Microsoft converts it to local tiers for the other
   markets. **Store listings**:
   export, run `python tools\store\make_addon_listing_csv.py pro <export>.csv`
   and upload `tools/store/addon-import/` (eleven languages, icon included).
   Under **Pricing and availability → Visibility** restrict it (see *Test the
   add-on before cutover*), discoverability *Available for purchase from
   within the parent product only*, and publish. Copy its **Store ID** into
   `PRO_ADDON_STORE_ID`.
2. **Create the tips** (optional): one or more *Consumable* (developer-managed)
   add-ons, e.g. "Tip ₹100", "Tip ₹300". Publish. Copy the IDs, comma-separated,
   into `PRO_TIP_ADDON_STORE_IDS`.
3. **Promotional codes**: once the Pro add-on is published, **Attract →
   Promotional codes** lets you generate single-use or capped multi-use codes
   (1,600 redemptions per 6 months, 6-month expiry). A redeemed code appears in
   the user's add-on licenses like a purchase; no app support needed. Use them
   for testers and support cases.
4. **Listing**: Store policy 10.8.4 requires the listing to name the in-app
   purchase types and price range, and to describe the 15-day trial. In the
   submission notes declare the external donation link (policy 10.8.2).

### Dry run (last paid release, 1.x)

Ship one paid release with the Phase 1–2 code and **no cutover**. Everything
stays unlocked; the log records `store: app sku=... owned=... acquired=...` and
the add-on query result. Confirm on your own machine that `AcquiredDate` is the
original purchase date before you rely on it (done for 1.7.0: the Store build
on a paid account reports `acquired=2026-10-12T06:08:33Z`, the purchase date).

### Test the add-on before cutover

Add-ons publish independently of the app package, and a sideloaded package
with the Store identity gets real licence data (see *Verifying a Store build*).
So the whole purchase path can be tested while retail still ships 1.x. The
shipped 1.x binary has no add-on ID compiled in and never calls purchase, so a
published-but-restricted add-on is invisible to users.

Partner Center *Experiments* are not for this: they A/B-test remote variables
through the old Store Services SDK and create no licences. Windows apps have no
purchase sandbox either; the test uses the retail Store with a restricted
audience.

1. **Restrict who can buy.** On the add-on's **Pricing and availability** page
   pick one:
   - **Private Audience**: **Engage → Customer groups → Create new group →
     Known user group**, add your Microsoft account e-mail, then select that
     group as the audience, with discoverability *Available for purchase from
     within the parent product only*. Only group members can see or buy the
     add-on. This tests the real `RequestPurchaseAsync` dialog; you pay ₹200
     to yourself and get it back at payout minus the Store fee.
   - **Hidden in the Store → Stop acquisition**: nobody can buy, not even a
     private audience, so `RequestPurchaseAsync` fails; only a promotional
     code redeems. Tests licence detection, not the purchase dialog. Generate
     a code under **Attract → Promotional codes** and redeem it in the Store
     app (**Redeem a code**).
2. **Publish the add-on** and wait until its status is *In the Store*. Copy the
   Store ID from its **Product identity** page.
3. **Build a 2.0.0 candidate** on the current branch with the real add-on ID
   and a cutover **earlier than your own purchase date**. That makes your
   account a normal free user (not grandfathered, trial already over), so the
   Home upgrade card appears and the real purchase path runs:

   ```powershell
   .\mediaflyouts.ps1 build -Config release -NoTests `
       -Define MEDIAFLYOUTS_PRO_ADDON_STORE_ID=9NXXXXXXXXXX,MEDIAFLYOUTS_STORE_CUTOVER_UTC=2026-10-01T00:00:00Z
   ```

   Check the configure log says `MediaFlyouts Pro gating: on ...`.
4. **Stage, sign and sideload** with the Store identity exactly as in
   *Verifying a Store build*. Remove any earlier Store-identity sideload or the
   Store-installed copy first.
5. **Before buying**, the log must show the price in your currency and the
   free tier:

   ```
   store: add-on product 9NXXXXXXXXXX price='₹200.00' owned=false
   store: snapshot available=true addOn=false acquired=2026-10-12T06:08:33Z price='₹200.00'
   entitlement: tier=free source=expired ...
   ```

   `store: no associated add-on products` means the add-on is not published
   yet or your account is outside its audience. Pro toggles in the Dashboard
   must be greyed with the Pro badge and the upgrade card must show the price.
6. **Buy or redeem.** Click the upgrade card (or a Support page tip for the
   consumable path). After the Store dialog closes the log shows
   `store: purchase 9NXXXXXXXXXX -> succeeded`, `store: offline licenses
   changed`, `store: add-on license key=9NXXXXXXXXXX ... active=true`,
   `snapshot ... addOn=true` and `entitlement: tier=pro source=addOn`. The
   toggles unlock without a restart.
7. **Restart the app offline** (disable the network first). `AddOnLicenses`
   comes from the offline licence cache, so `addOn=true` and `source=addOn`
   must survive without network. Then re-enable the network.
8. **Grandfather check**: rebuild with the real planned cutover (after your
   purchase date), sideload again, and confirm `source=grandfathered`. A real
   Store-anchored trial needs a second Microsoft account that acquires the app
   *after* it is free, so that path is checked right after cutover.
9. **Clean up**: `Get-AppxPackage ScleaverZer0ne.MediaFlyouts |
   Remove-AppxPackage`, reinstall from the Store, and leave the add-on
   restricted until cutover day. A refunded or revoked test purchase shows up
   as `addOn=false` on the next refresh; that is the expected path, nothing to
   handle.

Optionally **package-flight** the same candidate to a flight group holding
your account instead of sideloading. That tests the Store-signed package
through the real install path while retail stays 1.x; the Store updates your
installed copy to the flight.

### Cutover release (v2.0.0)

1. Set `PRO_STORE_CUTOVER_UTC` to **your planned manual publish time + 72 h**.
   Anyone who *buys* the paid app before the cutover is grandfathered; anyone
   who installs the free app before it gets Pro too. The margin protects the
   buyers, that is the right trade.
2. Set `PRO_ADDON_STORE_ID` (`9PM4LNF0XX1M`; tips are optional and can follow
   in a later release). Check the workflow's configure log says
   `MediaFlyouts Pro gating: cutover ...`. Tag and build as usual.
3. In the same submission change the price to **Free**, upload the MSIX, and
   import `tools/store/import/` (the Description now carries the
   MEDIA FLYOUTS PRO section that policy 10.8.4 requires, and the 2.0.0
   release notes). In the submission notes declare the in-app purchase and
   the external donation link (policy 10.8.2).
4. Choose **publish manually** on the submission. When certification passes,
   publish inside the 72 h window. If it slips past the window, rebuild with a
   later cutover and resubmit; never publish a binary whose cutover is in the
   past relative to real purchases.
5. Within the same hour, flip the add-on's **Pricing and availability →
   Visibility** to *Public audience* (an add-on-only submission; no app
   package needed). Until then the Home card shows the price but a purchase
   fails for anyone outside the test group.
6. Watch the first week's error reports and logs for `store:` HRESULTs, and
   check the first new-user trial log (`source=storeTrial`, 15 days from
   their `acquired=`), the one path a pre-cutover account cannot exercise.

### Verifying a Store build

Install the signed package from the Store on a machine signed in with a
Microsoft account. The log must show `store: context ready`, a snapshot with
`available=true` and a valid `acquired=` date, and one `entitlement: tier=...`
line. A purchased or redeemed add-on shows `source=addOn`; a pre-cutover
account shows `source=grandfathered`.

To test Store licensing **before** publishing, sideload a package that carries
the Store identity. The Store answers by package family name, so the signed-in
account's real license and `AcquiredDate` come back; a plain `-SignLocal`
package (`CN=MediaFlyouts`) only gets `0x803F6107` (not associated with the
Store). Remove the Store-installed copy first (same identity, different
signer). After `.\mediaflyouts.ps1 package` (or any release build in `bin\`):

```powershell
$pub = 'CN=<Store Identity Publisher GUID>'
.\tools\stage-msix.ps1 -Version <ver>.0 -Output release\MediaFlyouts-storeid.msix `
    -IdentityName <Store Identity Name> -IdentityPublisher $pub `
    -Layout build\msix-layout-storeid -Sideload
.\tools\sign-msix-local.ps1 -Package release\MediaFlyouts-storeid.msix -Subject $pub `
    -CerOutput release\MediaFlyouts-storeid.cer
Get-AppxPackage <Store Identity Name> | Remove-AppxPackage
.\tools\install-local-msix.ps1 -Package release\MediaFlyouts-storeid.msix `
    -Certificate release\MediaFlyouts-storeid.cer
```

The log lives under
`%LOCALAPPDATA%\Packages\<PackageFamilyName>\LocalCache\Roaming\MediaFlyouts\MediaFlyouts\logs\`.
Reinstall from the Store when done.

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Tag v1.6.0 does not match the VERSION file` | Tag points at a commit without the bump. | Push the bump commit to `main`, delete the tag (`git push origin :refs/tags/v1.6.0`), re-tag the bump commit. |
| `No '## Version 1.6.0' section found` | Heading typo, or notes not in the tagged commit. | Fix the heading in `docs/RELEASE_NOTES.md`. Match `## Version 1.6.0` exactly. |
| `Expected a vMAJOR.MINOR.PATCH tag` | Tag has a suffix or missing `v`. | Use `v1.6.0`, not `1.6.0` or `v1.6.0-rc1`. |
| MSIX step skipped | `STORE_IDENTITY_NAME` / `STORE_IDENTITY_PUBLISHER` repo variables missing. | Set them as described in `packaging/README.md`. |
| Configure log says `Pro gating: off (no cutover)` on a Store release | `PRO_STORE_CUTOVER_UTC` repo variable unset or not ISO-8601. | Set it (see §7) and re-run the workflow for the same tag. |
| Upgrade card never shows a price | `PRO_ADDON_STORE_ID` unset, or the add-on is not published yet. | Publish the add-on in Partner Center and set the variable. |
| Wrong notes on the Release | Notes edited after tagging. | Fix the notes, then re-run the workflow for the same tag. A re-run replaces assets and notes. |

## Hotfix releases

A hotfix is a patch release. It follows the same flow:

1. Branch from `main`, fix the bug, add the entry under `[Unreleased]`, and
   open a pull request.
2. Merge the pull request into `main`.
3. Follow steps 0–5 on `main` with a patch bump. Note in the changelog
   summary that the release is a hotfix.
4. If a `dev` branch is in use, merge `main` into it so the fix and the
   version bump are not lost.
