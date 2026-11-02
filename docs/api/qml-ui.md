# QML UI

The UI lives in `Views/` as a QML module. C++ objects are exposed as context
properties and QML binds to their properties/signals.

## Root

- **App.qml** — non-visual root (`QtObject`) that owns every window/flyout and
  reacts to tray intents (open dashboard, show flyout, open mixer). It also
  re-stacks visible flyouts so they don't overlap.

## Flyouts

- **MediaFlyout.qml** — album art, title/artist, transport controls and the
  draggable seekbar.
- **VolumeFlyout.qml** — master volume slider + the expandable per-app mixer.
- **LockKeysFlyout.qml** — Caps/Num/Scroll/Insert indicators.
- **NowPlayingFlyout.qml** — the "Now Playing" flyout (card or pill).
- **PeripheralFlyout.qml** + **PeripheralCard.qml** — peripheral connect /
  disconnect / low-battery events, several devices side by side in one window,
  including wired devices.
- **ChargerFlyout.qml** — charging events for connected peripherals.

## Windows

- **Dashboard.qml** — the settings dashboard (sidebar + searchable pages).
- **VolumeMixerWindow.qml** — standalone per-app mixer.
- **OnboardingWindow.qml** — first-run wizard. Until it sets
  `settings.onboardingCompleted`, every `showFlyout()` returns early and the
  taskbar widget's `visible` binding stays false.
- **WhatsNewDialog.qml** — the bundled `WHATS_NEW.md` rendered as Markdown.
  `App.qml` opens it once after an update (`whatsNew.pending`, never over
  the onboarding wizard) and on demand from **About → What's new**. Closing
  it calls `whatsNew.markSeen()`.
- **TaskbarWidget.qml** + **TaskbarVisualizer.qml** — the taskbar now-playing
  widget and its multi-style audio visualizer. Hosts the "Pause all" /
  "Play all" button.
- **PeripheralsWidget.qml** — battery rings for the selected peripherals,
  docked alongside the now-playing widget, with transport labels and custom
  device names. In stack layout it provides one page per transport.
- **WidgetStack.qml** — shares one frame between the media and peripheral
  pages when `settings.taskbarWidgetLayout` is Stack; the scroll wheel pages
  between them.
- **BatteryRing.qml** — the reusable circular battery gauge.
- **DeviceIcons.qml** (singleton) — device glyph and transport label
  ("Bluetooth", "2.4 GHz", "USB") for the battery UI.

## Shared components

- **Fluent.qml** (singleton) — Fluent icon glyph codepoints.
- **Anim.qml** (singleton) — animation easing helpers and shared durations.
- **SlideFade.qml** — slide-and-fade transition used when switching media
  sources and widget-stack pages.
- **PeekArea.qml** — hover region that pauses a flyout's auto-hide.
- **ScrubArea.qml** — drag gesture handler behind the seekbar and volume
  slider.
- **WidgetButton.qml / WidgetTooltip.qml** — taskbar-widget button and its
  tooltip.
- **RoundedArt.qml** — album art with rounded corners.
- **IconLabel.qml** — a glyph-icon label.
- **SettingRow.qml / SettingCombo.qml / SettingSlider.qml** — dashboard controls.
  `SettingRow` and `SettingCombo` take `locked: true` to grey out a Pro-only
  option and show a `ProBadge`; the bound setting keeps its stored value.
- **ProBadge.qml** — the small "PRO" pill.
- **UpgradeCard.qml** — home-page card shown while `entitlement.gatingEnabled
  && !entitlement.isPro`. Shows the trial days left or "trial ended", the
  localized price, and maps `purchaseFinished` status ids to text. The whole
  card is clickable and calls `entitlement.purchase(ownerWindow)`.
- **SupportPage.qml** — the Dashboard **Support** page. Shows the donation
  page link, and depending on `donate.showDirect` / `donate.showStoreTips`
  either the UPI QR + NEFT details with Copy buttons, or the Store tip
  buttons (`entitlement.purchaseAddOn`). States that Microsoft is not the
  fundraiser and that donations unlock nothing.
- **FlyoutBase.qml** — shared frameless flyout window chrome, positioning,
  animations and auto-hide methods (`present()`, `hideFlyout()`,
  `stopAutoHide()`, `restartAutoHide()`, `afterHide()`).
- **DockableWidget.qml** — shared taskbar-widget chrome with monitor-aware
  placement, fullscreen/lock polling and taskbar z-order management.

`App.qml` owns the five flyouts and its `restack()` logic groups visible
flyouts by position and monitor, then assigns non-overlapping vertical offsets.
The above-taskbar position uses the taskbar widget as an anchor and clamps the
result to the available screen.

## Context properties (from `main.cpp`)

`nowPlaying`, `settings`, `theme`, `placement`, `tray`, `updateChecker`,
`errorReporter`, `restarter`, `instance`, `capabilities`, `entitlement`, `pro`,
`donate`, `whatsNew`, `monitors`, and (on Windows) `volumeController`,
`volumeMixer`, `audioCapture`, `taskbar`, `fullscreen`, `lockKeys`,
`windowEffects`. QML reads these directly, e.g. `nowPlaying.title`,
`settings.visualizerStyle`, `theme.accent`, `audioCapture.bands`.

Pro gating has two faces in QML. `entitlement` (tier, trial days, purchase) is
for the Dashboard: toggles bind to `settings.*` and set
`locked: !entitlement.isUnlocked("<feature>")`. `pro` (`ProGate`) holds the
*effective* values — the stored setting when unlocked, the free-tier default
when locked — and every flyout or widget binds its behaviour to `pro.*`
(`pro.visualizerEnabled`, `pro.mixerEnabled`, `pro.nextUpStyle`, …), never to
the gated `settings.*` key. `QmlContractTest` enforces this split.

The QML module and its resources (including the Fluent icon font) are registered
via `qt_add_qml_module` in [`CMakeLists.txt`](../../CMakeLists.txt).

The dashboard has a collapsible sidebar and a search popup that filters pages.
When enabled in Settings, the album-art accent can tint the whole application,
not only individual flyouts.
