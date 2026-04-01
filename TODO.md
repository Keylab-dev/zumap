# Zumap — Roadmap & TODO

## Completed
- [x] Fork VIA repo under Keylab-dev/zumap
- [x] Rebrand: title, meta tags, manifest, external links
- [x] Replace USB error screen with welcome landing page
- [x] Add keyboard browser (1866 keyboards, searchable)
- [x] Word-based search with clear button
- [x] Fix mobile scroll/layout
- [x] Update favicons and README
- [x] Deploy to Vercel (www.zumap.app)
- [x] Domains: www.zumap.app (primary), zumap.app, zumap.com*, www.zumap.com*, usezumap.com, www.usezumap.com
  - *zumap.com DNS on NameBright, needs updating

## Short-term (Branding & Polish)
- [ ] Design proper Zumap logo (commission or create in Figma)
- [ ] Custom color accent / theme — differentiate from VIA's default palette
- [ ] Update OG image for social sharing previews
- [ ] Add "Powered by Zumap" or similar on the configure page
- [ ] Create a Zumap Discord server for community
- [ ] Fix zumap.com DNS (transfer to Namecheap or update NameBright records)

## Medium-term (Features & Differentiation)
- [ ] **Mac-first keycodes** — better Cmd/Opt mapping, macOS-specific layout presets
- [ ] **App-specific keymaps** — concept: different layouts per app (needs companion app)
- [ ] **Improved macro editor** — VIA's is clunky, opportunity for better UX
- [ ] **Keymap sharing** — share configs via URL or export/import
- [ ] **Keyboard comparison** — side-by-side layout viewer
- [ ] **Better mobile experience** — read-only keymap viewer on mobile (even without WebHID)
- [ ] **Recruit VIA contributors** — 30+ stale PRs on VIA repo, frustrated contributors to recruit
- [ ] **Review and merge useful stale VIA PRs** into Zumap

## Long-term (Ecosystem)
- [ ] **Native macOS companion app** — system tray, app-specific layers, iCloud sync (Knox project)
- [ ] **Add Code One keyboard** to Zumap's definition database (once firmware is VIA-compatible)
- [ ] **Zumap as default configurator** for Code One keyboards (link from atrivocode.com)
- [ ] **Keyboard recommendations** — "find a keyboard" tool based on preferences
- [ ] **Community keyboard database** — user-submitted definitions beyond VIA's official ones

## Technical Debt
- [ ] Remove Azure CI/CD workflow (`.github/workflows/`) — we use Vercel
- [ ] Remove Microsoft Application Insights dependency
- [ ] Audit and update dependencies
- [ ] Code-split vendor chunk (currently 1.8MB, Vite warns)
- [ ] Add Zumap-specific CI (lint + build on PRs)

## Notes
- VIA is GPL-3.0 — all changes must stay open source
- Keyboard definitions come from `the-via/keyboards` repo via `via-keyboards` package
- WebHID only works in Chrome/Edge — Safari/Firefox are out
- Local clone: `~/projects/zumap-via`
- Old keymap editor (Keylab): `~/projects/zumap` → github.com/Keylab-dev/keylab
