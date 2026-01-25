import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';


import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issue with Webpack

delete (L.Icon.Default.prototype as L.Icon.Default & { _getIconUrl?: () => string })._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface MapLocationModalProps {
  open: boolean;
  onClose: () => void;
  onSelectLocation: (latitude: number, longitude: number) => void;
  initialLatitude?: number;
  initialLongitude?: number;
}

export function MapLocationModal({ open, onClose, onSelectLocation, initialLatitude, initialLongitude }: MapLocationModalProps) {
  console.log('MapLocationModal - initialLatitude:', initialLatitude, 'initialLongitude:', initialLongitude);
  const { t } = useTranslation();
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(
    initialLatitude && initialLongitude ? [initialLatitude, initialLongitude] : null
  );

  useEffect(() => {
    if (initialLatitude !== undefined && initialLongitude !== undefined) {
      setSelectedPosition([initialLatitude, initialLongitude]);
    } else {
      setSelectedPosition(null);
    }
  }, [initialLatitude, initialLongitude]);



  function MapUpdater({ center }: { center: [number, number] | null }) {
    const map = useMap();
    useEffect(() => {
      if (center) {
        map.setView(center, map.getZoom());
      }
    }, [center, map]);
    return null;
  }

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setSelectedPosition([e.latlng.lat, e.latlng.lng]);
      },
    });

    return selectedPosition === null ? null : (
      <Marker position={selectedPosition}></Marker>
    );
  }

  const handleSelect = () => {
    if (selectedPosition) {
      onSelectLocation(selectedPosition[0], selectedPosition[1]);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{t('properties.form.selectLocationOnMap')}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
         
          <MapContainer center={selectedPosition || [40.7128, -74.0060]} zoom={13} style={{ height: '400px', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater center={selectedPosition} />
            <LocationMarker />
          </MapContainer>
          <Button onClick={handleSelect} disabled={!selectedPosition}>{t('properties.form.confirmLocation')}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
