# Zumap

Open-source keyboard configurator for QMK/VIA-compatible mechanical keyboards. Remap keys, create macros, adjust lighting — all from your browser.

**[www.zumap.app](https://www.zumap.app)**

Fork of [VIA](https://github.com/the-via/app), actively maintained.

## Features

- **Visual key remapping** — click a key, pick a keycode, done
- **Layer support** — configure multiple layers with tap/hold, mod-tap, and more
- **Macro editor** — record and assign key sequences
- **RGB/lighting controls** — adjust effects, colors, brightness
- **Key tester** — test every key on your board
- **1800+ keyboards supported** — browse the full list on the welcome page
- **No install required** — runs entirely in the browser via WebHID

## Browser Support

Keyboard connection requires [WebHID](https://caniuse.com/?search=webhid):

| Browser | Status |
|---------|--------|
| Chrome | Supported |
| Edge | Supported |
| Safari | Not supported |
| Firefox | Not supported |

The welcome page and keyboard browser work in all browsers.

## Development

```bash
git clone https://github.com/Keylab-dev/zumap.git
cd zumap
npm install
npm run dev
```

Keyboard definitions are fetched from the [VIA keyboards repo](https://github.com/the-via/keyboards) during build:

```bash
npm run build:kbs   # builds definitions to public/definitions/
npm run build       # full production build
```

## Project Structure

```
src/
  components/
    Home.tsx              — Welcome page + keyboard browser
    menus/                — Navigation bar, external links
    panes/                — Configure, Test, Design, Settings, Debug
    three-fiber/          — 3D keyboard renderer
    two-string/           — 2D keyboard renderer
    icons/                — Logo and icon components
  store/                  — Redux state (devices, keymaps, definitions)
  utils/                  — USB/HID, keycodes, keyboard API
public/
  definitions/            — Built keyboard definition files
```

## Contributing

Contributions welcome. Please open an issue first for significant changes.

## License

GPL-3.0 — same as the original VIA project.
