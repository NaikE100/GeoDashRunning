# GeoDash Runner

A Progressive Web App (PWA) that turns your runs into an adventure as you claim virtual territories anywhere in the world.

## Features

- 🗺️ **Real-time GPS tracking** - Track your runs with live map visualization
- 🏃 **Territory capture** - Claim territories as you run
- 📊 **Stats dashboard** - Track distance, territories, and points
- 🌍 **Global support** - Works anywhere in the world
- 📱 **PWA ready** - Install on your phone like a native app
- 🏃‍♂️ **Parkrun integration** - Special bonuses for parkrun events

## Quick Start

### Local Development

1. Serve the files using any static server:
   ```bash
   npx serve site
   ```

2. Open `http://localhost:3000` in your browser

3. Allow location permissions when prompted

4. Click "Start Running" to begin tracking

### Deployment

Upload the `site/` folder contents to your web server. Ensure:
- HTTPS is enabled (required for geolocation)
- Service worker and manifest files are accessible
- `index.html` is set as the default document

## File Structure

```
GeoDashRunner/
├── site/
│   ├── index.html          # Main PWA page
│   ├── app.js              # GPS tracking & app logic
│   ├── sw.js               # Service worker for offline support
│   └── manifest.webmanifest # PWA manifest
└── README.md
```

## Technologies

- **Tailwind CSS** - Styling
- **Leaflet** - Map visualization
- **Vanta.js** - Animated background
- **Feather Icons** - Icon set
- **Progressive Web App** - Installable app experience

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari (iOS 11.3+)
- Any browser with geolocation API support

## License

MIT

