import { useEffect, useId, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './location-picker.css';

const taiwan = [23.8, 121];
const validPoint = (lat, lng) => lat !== '' && lng !== '' && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)) && Math.abs(Number(lat)) <= 85 && Math.abs(Number(lng)) <= 180;
const pin = L.divIcon({ className: 'location-pin', html: '<span></span>', iconSize: [30, 36], iconAnchor: [15, 36] });

export function EventLocationPicker({ initialValue }) {
  const [latitude, setLatitude] = useState(initialValue?.lat ?? '');
  const [longitude, setLongitude] = useState(initialValue?.lng ?? '');
  const [approximate, setApproximate] = useState(initialValue?.approximate ?? false);
  const [tileError, setTileError] = useState(false);
  const container = useRef(null), map = useRef(null), marker = useRef(null), tiles = useRef(null);
  const descriptionId = useId();
  const selected = validPoint(latitude, longitude);

  function choose(latlng) {
    setLatitude(Number(Math.max(-85, Math.min(85, latlng.lat)).toFixed(6)));
    setLongitude(Number(latlng.wrap().lng.toFixed(6)));
    setApproximate(false);
  }

  useEffect(() => {
    const hasInitialPoint = validPoint(initialValue?.lat ?? '', initialValue?.lng ?? '');
    const instance = L.map(container.current, { scrollWheelZoom: false, attributionControl: true }).setView(hasInitialPoint ? [Number(initialValue.lat), Number(initialValue.lng)] : taiwan, hasInitialPoint ? (initialValue.approximate ? 12 : 15) : 7);
    map.current = instance;
    tiles.current = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, minZoom: 3, noWrap: true,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    }).addTo(instance);
    tiles.current.on('tileerror', () => setTileError(true));
    instance.on('click', event => choose(event.latlng));
    instance.zoomControl.getContainer().querySelector('.leaflet-control-zoom-in').setAttribute('aria-label', '放大地圖');
    instance.zoomControl.getContainer().querySelector('.leaflet-control-zoom-out').setAttribute('aria-label', '縮小地圖');
    const observer = new ResizeObserver(() => instance.invalidateSize());
    observer.observe(container.current);
    instance.invalidateSize();
    return () => { observer.disconnect(); instance.remove(); map.current = null; marker.current = null; tiles.current = null; };
  }, []);

  useEffect(() => {
    if (!map.current) return;
    if (marker.current) { marker.current.remove(); marker.current = null; }
    if (selected && !approximate) {
      marker.current = L.marker([Number(latitude), Number(longitude)], { icon: pin, draggable: true, title: '賽事位置，可拖曳調整', alt: '賽事位置' }).addTo(map.current);
      marker.current.on('dragend', event => choose(event.target.getLatLng()));
    }
  }, [latitude, longitude, approximate, selected]);

  function locate() {
    if (selected) map.current?.setView([Number(latitude), Number(longitude)], approximate ? 12 : 16);
  }

  return <section className="map-editor location-picker">
    <h3>活動地圖位置</h3>
    <p className="hint" id={descriptionId}>拖移、縮放地圖找到場地，點一下即可標記；也可拖曳圖釘調整位置。</p>
    <div ref={container} className="location-picker-map" role="region" aria-label="選擇賽事位置的 OpenStreetMap 地圖" aria-describedby={descriptionId}/>
    {tileError && <p className="location-map-error" role="status">部分地圖暫時無法載入，仍可輸入經緯度。<button type="button" className="text-button" onClick={() => { setTileError(false); tiles.current?.redraw(); }}>重新載入地圖</button></p>}
    <p className="location-selection" role="status">{selected ? approximate ? '目前為區域示意；點選地圖即可改為精確位置。' : `已標記賽事位置：${latitude}, ${longitude}` : latitude !== '' || longitude !== '' ? '請填入有效且成對的經緯度，或重新點選地圖。' : '尚未設定位置，請點選地圖。'}</p>
    <div className="location-picker-actions">
      <button type="button" className="location-map-button" onClick={() => choose(map.current.getCenter())}>將地圖中心設為位置</button>
      <button type="button" className="location-map-button" disabled={!selected} onClick={locate}>查看已選位置</button>
      <button type="button" className="text-button" disabled={latitude === '' && longitude === ''} onClick={() => { setLatitude(''); setLongitude(''); setApproximate(false); }}>清除位置</button>
    </div>
    <div className="field-grid">
      <label className="field">地圖緯度<input name="mapLatitude" type="number" step="any" min="-85" max="85" value={latitude} onInput={event => setLatitude(event.currentTarget.value)} onChange={event => setLatitude(event.target.value)} placeholder="例如 25.077"/></label>
      <label className="field">地圖經度<input name="mapLongitude" type="number" step="any" min="-180" max="180" value={longitude} onInput={event => setLongitude(event.currentTarget.value)} onChange={event => setLongitude(event.target.value)} placeholder="例如 121.389"/></label>
    </div>
    <label className="consent"><input name="mapApproximate" type="checkbox" checked={approximate} onChange={event => setApproximate(event.target.checked)}/>僅顯示區域示意，集合點尚未確認</label>
    <p className="hint">區域示意不放圖釘；兩欄留空則前台僅顯示地點文字。點選地圖會取消區域示意，儲存賽事後套用。</p>
  </section>;
}
