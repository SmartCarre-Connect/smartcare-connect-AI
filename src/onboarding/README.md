SmartCare AI Onboarding Framework

Overview:
- This folder contains a lightweight orchestration framework for the interactive onboarding experience.
- It provides an `OnboardingProvider` that manages per-role, per-language journeys, step index, highlight registrations, and admin publish placeholders.

Files:
- `OnboardingContext.jsx`: Core context and API (start, stop, next, prev, publishVersion).
- `AvatarProviderPlaceholder.jsx`: Minimal avatar placeholder component — swap this with HeyGen (or other provider) later.
- `HighlightOverlay.jsx`: Renders highlight boxes and a cursor animation for a registered selector/rect.
- `OnboardingUI.jsx`: In-app floating assistant UI and controls (uses Avatar placeholder and highlights).

Integration notes:
1. The app wraps `OnboardingProvider` in `App.jsx`. Use `useOnboarding()` to start/stop/drive the experience.
2. Admin tools (PresentationManager) can call `publishVersion()` to store per-role payloads; the provider stores versions in `localStorage` as a placeholder.
3. To connect a photoreal avatar provider (HeyGen), replace `AvatarProviderPlaceholder.jsx` with an implementation that:
   - Accepts `script`, `language`, `voice` props
   - Requests avatar/video generation (async)
   - Renders the returned video or a live embeddable avatar element
   - Exposes playback hooks (play, pause, onEnd) so `OnboardingContext` can synchronize highlights and step timing

Design goals:
- Preserve the existing app UI and styling — the onboarding framework overlays highlights and a compact assistant without altering pages.
- Keep provider integration decoupled from the rest of the app.

Next steps:
- Implement admin upload UI to create per-step scripts and media (already scaffolded in PresentationManager).
- Replace `AvatarProviderPlaceholder.jsx` with HeyGen integration that returns embeddable avatar/video assets and lip-synced audio.
- Add precise screen-sync hooks for navigation and element highlights (the `registerHighlight` API is available in the context now).

Security & keys:
- Avatar provider keys should be stored on a secure server-side endpoint; the browser should not hold long-lived secret keys directly.
- The framework leaves provider integration to a later stage; examples will be provided for server-side proxying of HeyGen API calls.
