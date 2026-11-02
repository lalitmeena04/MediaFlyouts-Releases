# Localization

MediaFlyouts ships in English (source language), Spanish, Simplified Chinese,
Japanese, German, French, Korean, Brazilian Portuguese, Hindi, Arabic and
Indonesian. The UI follows the Windows display language by default. The user
can pin a language under **Additional Settings → Language** or in the
first-run wizard; the choice is stored in `settings.language` (empty = system).

## Where things live

| Piece | Location |
| --- | --- |
| Shipped language list, matching and fallback | [`Model/Localization.h`](../../Model/Localization.h) |
| Runtime loading and switching | [`Controllers/AppTranslator.h`](../../Controllers/AppTranslator.h) |
| Language setting | `Settings::language` in [`Model/Settings.h`](../../Model/Settings.h) |
| Translation sources | `i18n/MediaFlyouts_<code>.ts` |
| Language codes for CMake | `MEDIAFLYOUTS_TRANSLATED_LANGUAGES` in [`CMakeLists.txt`](../../CMakeLists.txt) |
| Picker UI | `languageCombo` in `Views/Dashboard.qml`, step 1 of `Views/OnboardingWindow.qml` |

The `.ts` files are compiled to `.qm` at build time by `qt_add_translations()`
and embedded under `:/i18n/` in `mediaflyout_core`, so both the app and the
tests see them. Nothing has to be deployed next to the executable.

## Writing translatable code

- **QML:** wrap every user-facing string in `qsTr()`. Use `%1`/`%2` with
  `.arg()` instead of string concatenation, so translators can reorder words:
  `qsTr("Version %1").arg(version)`.
- **C++ `QObject`s:** use `tr()`. Free functions use
  `QCoreApplication::translate("Context", "text")`.
- Text that is built once and kept (tray menu actions, tooltips) must be set
  again on `AppTranslator::languageChanged`. See `TrayController::retranslate()`.
  QML bindings that contain `qsTr()` refresh on their own because `AppTranslator`
  calls `QQmlEngine::retranslate()`.
- Never key logic on translated text. Dashboard pages have a stable `key`
  (`showPage("about")`), not their display `name`.
- Brand names (`MediaFlyouts`, `Microsoft Store`, key names like `Caps Lock`)
  stay as they are; they are still routed through `qsTr()`/`tr()` where a
  translator might want to adapt them.

A contract test in `tests/Views/QmlContractTest.cpp` fails the build when a
`text:`, `label:`, `title:`, `description:`, `placeholderText:`, `tooltip:`,
`unavailableNote:` or `valueText:` property holds a raw string literal.

## Updating the translations

After adding or changing strings:

```powershell
.\mediaflyouts.ps1 build
cmake --build build\msvc-debug --target update_translations
```

`update_translations` runs `lupdate` over the app sources and QML files
(`-no-obsolete -locations none`, so the files stay small and diff cleanly) and
merges new strings into every `i18n/*.ts` as `type="unfinished"`. Fill them in
with Qt Linguist or by editing the XML, then rebuild. `TranslationFilesTest`
fails while any entry is unfinished or a `%1` placeholder is missing.

## Adding a language

1. Add the code and native name to `supportedLanguages()` in
   [`Model/Localization.cpp`](../../Model/Localization.cpp).
2. Add the code to `MEDIAFLYOUTS_TRANSLATED_LANGUAGES` in `CMakeLists.txt`.
3. Configure and run the `update_translations` target. It creates
   `i18n/MediaFlyouts_<code>.ts`.
4. Translate the file. `LocalizationTest` and `TranslationFilesTest` keep the
   list, the CMake variable and the files in sync.

Right-to-left languages: `i18n.rightToLeft` is exposed to QML. Text items
render RTL text correctly on their own; full layout mirroring is not applied.

## Fonts for scripts the UI font lacks

The UI font (Segoe UI) has no Devanagari glyphs. Left to the system fallback,
Qt picked a font whose Devanagari glyphs are about 30 % smaller than Latin at
the same pixel size, so Hindi looked tiny. `mf::fallbackFontFamilies()` in
[`Model/Localization.cpp`](../../Model/Localization.cpp) lists families that
`AppTranslator` appends to the application font's family chain at startup
(`Nirmala UI`, the Windows UI font for Devanagari, matches Segoe UI metrics).
This applies for every language, so Hindi device names or track titles look
right in an English UI too. Add a family there if another script renders
badly; Qt skips families that are not installed.
`AppTranslatorTest.DevanagariRendersAtLatinSizeWithTheFallbackFont` measures
the result.
