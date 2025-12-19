// GeoDash Runner PWA front-end logic (brand-scoped)

let map;
let userPath = [];
let runActive = false;
let watchId = null;

let distanceKm = 0;
let territories = 0;
let points = 0;

let deferredPrompt = null;

function initVantaBackground() {
  if (window.VANTA && window.VANTA.WAVES) {
    window.VANTA.WAVES({
      el: '#vanta-bg',
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.0,
      minWidth: 200.0,
      scale: 1.0,
      scaleMobile: 1.0,
      color: 0x3b82f6,
      shininess: 35.0,
      waveHeight: 15.0,
      waveSpeed: 0.75,
      zoom: 0.75
    });
  }
}

function initMap() {
  if (!window.L) return;

  // Start on a global view; we'll recenter to the user's location
  // on the first GPS fix inside handlePosition.
  const worldCenter = [0, 0];
  map = L.map('map').setView(worldCenter, 2);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
}

function updateStatsUI() {
  const distanceEl = document.getElementById('distance-value');
  const territoriesEl = document.getElementById('territories-value');
  const pointsEl = document.getElementById('points-value');
  const statusEl = document.getElementById('run-status');

  if (distanceEl) distanceEl.textContent = `${distanceKm.toFixed(2)} km`;
  if (territoriesEl) territoriesEl.textContent = territories.toString();
  if (pointsEl) pointsEl.textContent = points.toString();
  if (statusEl) statusEl.textContent = runActive ? 'Running' : 'Idle';
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function handlePosition(position) {
  const { latitude, longitude } = position.coords;
  const currentPoint = [latitude, longitude];

  if (map) {
    L.circleMarker(currentPoint, {
      radius: 4,
      color: '#3B82F6',
      fillColor: '#3B82F6',
      fillOpacity: 0.9
    }).addTo(map);

    if (userPath.length === 0) {
      map.setView(currentPoint, 15);
    }
  }

  if (userPath.length > 0) {
    const [prevLat, prevLng] = userPath[userPath.length - 1];
    const segmentKm = haversineDistance(prevLat, prevLng, latitude, longitude);
    distanceKm += segmentKm;

    const newTerritories = Math.floor(distanceKm / 0.5);
    territories = Math.max(territories, newTerritories);
    points = Math.round(distanceKm * 100) + territories * 50;

    if (map) {
      const segment = L.polyline(
        [
          [prevLat, prevLng],
          [latitude, longitude]
        ],
        { color: '#10B981', weight: 4, opacity: 0.8 }
      );
      segment.addTo(map);
    }
  }

  userPath.push(currentPoint);
  updateStatsUI();
}

function handleGeoError(err) {
  console.warn('Geolocation error', err);
  alert('Unable to access GPS. Please enable location services for GeoDash.');
}

function startRun() {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser.');
    return;
  }

  if (runActive) return;
  runActive = true;
  userPath = [];
  distanceKm = 0;
  territories = 0;
  points = 0;
  updateStatsUI();

  const label = document.getElementById('start-run-label');
  if (label) label.textContent = 'Running...';

  watchId = navigator.geolocation.watchPosition(handlePosition, handleGeoError, {
    enableHighAccuracy: true,
    maximumAge: 1000,
    timeout: 15000
  });
}

function stopRun() {
  if (!runActive) return;
  runActive = false;
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
  const label = document.getElementById('start-run-label');
  if (label) label.textContent = 'Start Run';
  updateStatsUI();
}

function toggleRun() {
  if (runActive) {
    stopRun();
  } else {
    startRun();
  }
}

function initRunButtons() {
  const heroBtn = document.getElementById('primary-start-run');
  const mapBtn = document.getElementById('map-start-run');

  if (heroBtn) {
    heroBtn.addEventListener('click', () => {
      document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => toggleRun(), 400);
    });
  }

  if (mapBtn) {
    mapBtn.addEventListener('click', toggleRun);
  }
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('./sw.js')
        .catch((err) => console.error('Service worker registration failed:', err));
    });
  }
}

function initPwaInstall() {
  const installBtn = document.getElementById('install-pwa');
  if (!installBtn) return;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.classList.remove('hidden');
  });

  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) {
      alert('Install prompt not available yet. Try again in a few seconds.');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('PWA install accepted');
    }
    deferredPrompt = null;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (window.feather) window.feather.replace();
  initVantaBackground();
  initMap();
  initRunButtons();
  updateStatsUI();
  registerServiceWorker();
  initPwaInstall();
});



