# Installation Guide

MediaFlyouts runs on **Windows 10/11 (x64)**. It is self-contained — no .NET
runtime is required.

Download the latest build from the
[Releases page](https://github.com/scleaverzer0ne/MediaFlyouts/releases).

## Option 1 — Installer (recommended)

1. Download `MediaFlyouts-<version>-setup.exe`.
2. Run it and follow the wizard. It installs to `%ProgramFiles%\MediaFlyouts`
   and creates Start-menu (and optional desktop) shortcuts.
3. Launch **MediaFlyouts** — it starts minimized to the system tray.

To uninstall, use **Settings → Apps** or the Start-menu uninstaller.

## Option 2 — Portable ZIP

1. Download `MediaFlyouts-<version>-win64.zip`.
2. Extract it anywhere.
3. Run `MediaFlyouts.exe`. No installation is performed; delete the folder to
   remove it.

## Option 3 — Microsoft Store

Search for **Media Flyouts** in the Microsoft Store and install it from there.
The Store build is signed by Microsoft, updates automatically, and uses the
Windows startup-task mechanism for launch at sign-in.

The `MediaFlyouts-<version>.msix` on the Releases page is the **unsigned**
package that was submitted to the Store, published so the Store build can be
matched to a release. Windows refuses to install an unsigned package
(`0x800B0100`), so use the Store listing, the installer or the portable ZIP.

## Option 4 — Build from source

See the [Build Guide](../developer/build-guide.md).

## First run

On first launch a short **onboarding wizard** introduces the main features. While
it is open the flyouts and taskbar widget stay hidden, so nothing pops up over
the wizard while you pick your settings. After that, right-click the tray icon
and choose **Settings** to open the dashboard, or press a media/volume key to see
a flyout. See the [User Guide](user-guide.md).
