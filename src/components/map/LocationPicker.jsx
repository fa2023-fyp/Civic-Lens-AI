import { lazy, Suspense, useEffect, useState } from 'react';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { api } from '../../services/api.js';
import { Badge } from '../ui/Badge/Badge.jsx';
import { Button } from '../ui/Button/Button.jsx';
import { FormField } from '../ui/FormField/FormField.jsx';
import { Icon } from '../ui/Icon/Icon.jsx';
import { InlineAlert } from '../ui/InlineAlert/InlineAlert.jsx';
import { Input } from '../ui/Input/Input.jsx';
import { Skeleton } from '../ui/Skeleton/Skeleton.jsx';
import { Tabs } from '../ui/Tabs/Tabs.jsx';
import './LocationPicker.css';

const LeafletMapPane = lazy(() => import('./LeafletMapPane.jsx'));

const MAP_DOWN_STORAGE_KEY = 'civiclens-demo-map-down';

function readMapProviderDown(propFlag) {
  if (propFlag) return true;
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(MAP_DOWN_STORAGE_KEY) === 'true';
}

export function LocationPicker({
  id = 'location-picker',
  label,
  hint,
  error,
  required = false,
  value,
  onChange,
  mapProviderDown = false,
}) {
  const { t, formatNumber } = useI18n();
  const [activeTab, setActiveTab] = useState('type');
  const [gpsStatus, setGpsStatus] = useState('idle');
  const [gpsError, setGpsError] = useState('');
  const [mapFailed, setMapFailed] = useState(() => readMapProviderDown(mapProviderDown));

  const current = value ?? {
    mode: 'type',
    locality: '',
    lat: null,
    lng: null,
    accuracy: null,
    approximate: true,
  };

  useEffect(() => {
    setMapFailed(readMapProviderDown(mapProviderDown));
  }, [mapProviderDown]);

  const localities = api.referenceData?.localities ?? [];
  const filteredLocalities = localities.filter((item) => {
    const query = (current.locality || '').trim().toLowerCase();
    return !query || item.toLowerCase().includes(query);
  });

  function updateLocation(patch) {
    onChange?.({
      ...current,
      ...patch,
    });
  }

  function handleTabChange(nextTab) {
    setActiveTab(nextTab);
    if (nextTab === 'type') {
      updateLocation({
        mode: 'type',
        approximate: !Number.isFinite(current.lat) || !Number.isFinite(current.lng),
      });
    } else if (nextTab === 'map') {
      setMapFailed(readMapProviderDown(mapProviderDown));
    }
  }

  function requestGps() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsStatus('error');
      setGpsError(t('locationPicker.gpsUnsupported'));
      updateLocation({ mode: 'type', approximate: true });
      return;
    }

    setGpsStatus('loading');
    setGpsError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        const accuracy = Math.round(position.coords.accuracy);
        setGpsStatus('success');
        updateLocation({
          mode: 'gps',
          lat,
          lng,
          accuracy,
          approximate: false,
          locality: current.locality || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        });
      },
      () => {
        setGpsStatus('error');
        setGpsError(t('locationPicker.gpsDenied'));
        updateLocation({ mode: 'type', approximate: true });
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function handleMapSelect({ lat, lng }) {
    const nextLat = Number(lat.toFixed(6));
    const nextLng = Number(lng.toFixed(6));
    updateLocation({
      mode: 'map',
      lat: nextLat,
      lng: nextLng,
      accuracy: null,
      approximate: false,
      locality: current.locality || `${nextLat.toFixed(4)}, ${nextLng.toFixed(4)}`,
    });
  }

  const tabs = [
    {
      id: 'type',
      label: t('locationPicker.tabType'),
      content: (
        <div className="location-picker__panel">
          <Input
            id={`${id}-area`}
            label={t('locationPicker.areaLabel')}
            placeholder={t('locationPicker.areaPlaceholder')}
            value={current.locality || ''}
            onChange={(event) =>
              updateLocation({
                mode: 'type',
                locality: event.target.value,
                approximate: !Number.isFinite(current.lat) || !Number.isFinite(current.lng),
              })
            }
            dir="auto"
          />
          {filteredLocalities.length > 0 ? (
            <div className="location-picker__suggestions" aria-label={t('locationPicker.suggestionsLabel')}>
              {filteredLocalities.slice(0, 6).map((area) => (
                <button
                  key={area}
                  type="button"
                  className={`location-picker__suggestion${current.locality === area ? ' is-selected' : ''}`}
                  onClick={() =>
                    updateLocation({
                      mode: 'type',
                      locality: area,
                      approximate: true,
                    })
                  }
                >
                  {area}
                </button>
              ))}
            </div>
          ) : null}
          {current.approximate ? (
            <div className="location-picker__approx">
              <Badge tone="warning">{t('locationPicker.approximateFlag')}</Badge>
              <span>{t('locationPicker.approximateHint')}</span>
            </div>
          ) : null}
        </div>
      ),
    },
    {
      id: 'gps',
      label: t('locationPicker.tabGps'),
      content: (
        <div className="location-picker__panel">
          <p className="location-picker__explainer">{t('locationPicker.gpsExplainer')}</p>
          <Button
            variant="secondary"
            iconStart="map-pin"
            loading={gpsStatus === 'loading'}
            onClick={requestGps}
          >
            {gpsStatus === 'loading' ? t('locationPicker.gpsLoading') : t('locationPicker.gpsButton')}
          </Button>
          {gpsStatus === 'success' && Number.isFinite(current.lat) ? (
            <InlineAlert tone="success">
              <div className="location-picker__gps-result">
                <span>
                  {t('locationPicker.gpsSuccess', {
                    lat: current.lat.toFixed(5),
                    lng: current.lng.toFixed(5),
                  })}
                </span>
                {Number.isFinite(current.accuracy) ? (
                  <Badge tone="info">
                    {t('locationPicker.gpsAccuracy', {
                      meters: formatNumber(current.accuracy),
                    })}
                  </Badge>
                ) : null}
              </div>
            </InlineAlert>
          ) : null}
          {gpsStatus === 'error' && gpsError ? (
            <InlineAlert tone="warning">
              <div className="location-picker__fallback">
                <span>{gpsError}</span>
                <Button size="sm" variant="secondary" onClick={() => handleTabChange('type')}>
                  {t('locationPicker.mapSwitchToType')}
                </Button>
              </div>
            </InlineAlert>
          ) : null}
        </div>
      ),
    },
    {
      id: 'map',
      label: t('locationPicker.tabMap'),
      content: (
        <div className="location-picker__panel">
          {mapFailed ? (
            <InlineAlert tone="warning" title={t('locationPicker.mapUnavailableTitle')}>
              <div className="location-picker__fallback">
                <span>{t('locationPicker.mapUnavailableBody')}</span>
                <Button size="sm" variant="secondary" onClick={() => handleTabChange('type')}>
                  {t('locationPicker.mapSwitchToType')}
                </Button>
              </div>
            </InlineAlert>
          ) : activeTab === 'map' ? (
            <>
              <p className="location-picker__explainer">{t('locationPicker.mapHint')}</p>
              <Suspense fallback={<Skeleton height="15rem" className="location-picker__skeleton" />}>
                <LeafletMapPane
                  lat={current.lat}
                  lng={current.lng}
                  ariaLabel={t('locationPicker.tabMap')}
                  onSelect={handleMapSelect}
                  onTileError={() => {
                    setMapFailed(true);
                    updateLocation({ approximate: true });
                  }}
                />
              </Suspense>
              {Number.isFinite(current.lat) && Number.isFinite(current.lng) ? (
                <p className="location-picker__coords">
                  <Icon name="map-pin" size={14} />
                  <span>
                    {t('locationPicker.mapSelected', {
                      lat: current.lat.toFixed(5),
                      lng: current.lng.toFixed(5),
                    })}
                  </span>
                </p>
              ) : null}
            </>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <FormField id={id} label={label} hint={hint} error={error} required={required}>
      {() => (
        <div className="location-picker">
          <Tabs
            tabs={tabs}
            label={t('locationPicker.tabsLabel')}
            activeId={activeTab}
            onChange={handleTabChange}
          />
        </div>
      )}
    </FormField>
  );
}
