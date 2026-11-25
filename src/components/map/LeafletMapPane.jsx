import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER = [31.5204, 74.3587];

function createPinIcon() {
  return L.divIcon({
    className: 'location-picker__pin',
    html: '<span class="location-picker__pin-dot"></span>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export default function LeafletMapPane({ lat, lng, onSelect, onTileError, ariaLabel }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onSelectRef = useRef(onSelect);
  const onTileErrorRef = useRef(onTileError);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    onTileErrorRef.current = onTileError;
  }, [onTileError]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined;

    const initialLat = Number.isFinite(lat) ? lat : DEFAULT_CENTER[0];
    const initialLng = Number.isFinite(lng) ? lng : DEFAULT_CENTER[1];

    const map = L.map(containerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: true,
    });

    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    });

    tileLayer.on('tileerror', () => {
      onTileErrorRef.current?.();
    });

    tileLayer.addTo(map);

    const marker = L.marker([initialLat, initialLng], {
      draggable: true,
      icon: createPinIcon(),
    }).addTo(map);

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      onSelectRef.current?.({ lat: pos.lat, lng: pos.lng });
    });

    map.on('click', (event) => {
      const { lat: nextLat, lng: nextLng } = event.latlng;
      marker.setLatLng([nextLat, nextLng]);
      onSelectRef.current?.({ lat: nextLat, lng: nextLng });
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      markerRef.current.setLatLng([lat, lng]);
      mapRef.current.panTo([lat, lng]);
    }
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      className="location-picker__map-canvas"
      role="application"
      aria-label={ariaLabel}
    />
  );
}
