"use client";

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

const RecenterMap = ({ center, zoom = 8 }) => {
  const map = useMap();

  useEffect(() => {
    if (center && center[0] && center[1]) {
      // Invalidate size to trigger Leaflet re-rendering the map after container resize
      setTimeout(() => {
        map.invalidateSize();
        map.setView(center, zoom, {
          animate: true,
          duration: 0.5
        });
      }, 200); // short delay ensures layout has finished
    }
  }, [center, map, zoom]);

  return null;
};

export default RecenterMap;
