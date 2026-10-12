# MediaFlyouts Documentation

Everything you need to use, build, and extend MediaFlyouts — Fluent-styled
media, volume, lock-key, now-playing and peripheral-battery flyouts plus
taskbar widgets for Windows, built with Qt 6 / C++ / QML.

## 📚 Documentation structure

### For users
- **[Installation Guide](user/installation.md)** — install the app (installer, Microsoft Store, portable)
- **[User Guide](user/user-guide.md)** — using the flyouts, dashboard, taskbar widget and visualizer
- **[FAQ](user/faq.md)** — troubleshooting and common questions
- **[Privacy Policy](PRIVACY.md)** — what the app reads, stores and sends (nothing leaves your PC)

### For developers
- **[Architecture Overview](developer/architecture.md)** — how the app is put together
- **[Development Setup](developer/development-setup.md)** — getting a dev environment running
- **[Build Guide](developer/build-guide.md)** — building and packaging the release artifacts
- **[Contributing Guide](developer/contributing.md)** — coding standards and workflow
- **[Testing Guide](developer/testing.md)** — running and writing tests

### Reference
- **[Feature List](FEATURES.md)** — the full, shipped feature set
- **[Controllers API](api/controllers.md)** — app + Windows integration classes
- **[Model API](api/models.md)** — cross-platform domain logic
- **[QML UI](api/qml-ui.md)** — the QML views and how they bind to C++
- **[Packaging](../packaging/README.md)** — installer / Store MSIX / release inputs

### Releases
- **[Release Notes](RELEASE_NOTES.md)** — version history (v1.4.2)
- **[Changelog](../CHANGELOG.md)** — concise change log

## 🚀 Quick start

1. **Users** — start with the [Installation Guide](user/installation.md), then the [User Guide](user/user-guide.md).
2. **Developers** — start with [Development Setup](developer/development-setup.md), then the [Build Guide](developer/build-guide.md).
3. **Contributors** — read the [Contributing Guide](developer/contributing.md).

## 📖 About MediaFlyouts

MediaFlyouts replaces the dated Windows media/volume overlays with clean,
Fluent-styled flyouts and adds an optional per-app volume mixer, a taskbar
now-playing widget, and an audio visualizer. It is a self-contained C++
application — no .NET runtime required — targeting Windows 10/11 (x64).
