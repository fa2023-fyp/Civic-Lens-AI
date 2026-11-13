import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
export default function Heatmap({ points = [] }) {
  return <MapContainer center={[31.52, 74.35]} zoom={11} scrollWheelZoom={false} style={{ height: 420, borderRadius: 10 }}>
    <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
    {points.map((point, index) => <CircleMarker key={index} center={[point.latitude, point.longitude]}
      radius={Math.min(22, 6 + point.complaint_count)} pathOptions={{ color: '#b54137', fillOpacity: 0.5 }}>
      <Popup>{point.complaint_count} reports in a privacy-coarsened area</Popup>
    </CircleMarker>)}
  </MapContainer>;
}
