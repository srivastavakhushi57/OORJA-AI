import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Community, CoolingType, DataCenter, OtherDataCenterResult } from '../../types';

export interface LeafletMapProps {
  mode: 'preview' | 'explore' | 'communities' | 'other_dcs' | 'compare';
  dataCenters?: DataCenter[];
  activeDataCenter?: DataCenter;
  communities?: Community[];
  otherDataCenters?: OtherDataCenterResult[];
  compareDataCenters?: DataCenter[];
  selectedDcId?: string | null;
  onSelectDataCenter?: (dc: DataCenter) => void;
  radiusKm?: number;
  showRadius?: boolean;
  heightClass?: string;
  zoom?: number;
  center?: [number, number];
  interactive?: boolean;
}

export const COOLING_COLORS: Record<CoolingType, { hex: string; bg: string; label: string }> = {
  liquid: { hex: '#059669', bg: 'bg-emerald-600', label: 'Liquid Cooled' },
  hybrid: { hex: '#d97706', bg: 'bg-amber-600', label: 'Hybrid Cooled' },
  air: { hex: '#0284c7', bg: 'bg-sky-600', label: 'Air Cooled' },
};

export const LeafletMap: React.FC<LeafletMapProps> = ({
  mode,
  dataCenters = [],
  activeDataCenter,
  communities = [],
  otherDataCenters = [],
  compareDataCenters = [],
  selectedDcId,
  onSelectDataCenter,
  radiusKm = 25,
  showRadius = true,
  heightClass = 'h-96',
  zoom,
  center,
  interactive = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const [tileError, setTileError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const defaultCenter: [number, number] = center || (
      activeDataCenter
        ? [activeDataCenter.latitude, activeDataCenter.longitude]
        : [25, 20]
    );
    const defaultZoom = zoom || (activeDataCenter ? 9 : 2);

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      zoomControl: interactive,
      dragging: interactive,
      scrollWheelZoom: interactive ? 'center' : false,
      attributionControl: true,
    });

    // Clean OpenStreetMap tiles
    const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const tileLayer = L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    });

    tileLayer.on('tileerror', () => {
      setTileError(true);
    });

    tileLayer.addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    layerGroupRef.current = layerGroup;
    setIsLoading(false);

    // Invalidate size on container layout changes
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Layers when props change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. PREVIEW OR EXPLORE MODE (All Data Centers)
    if (mode === 'preview' || mode === 'explore') {
      const markers: L.CircleMarker[] = [];

      dataCenters.forEach((dc) => {
        const isSelected = dc.id === selectedDcId;
        const color = COOLING_COLORS[dc.cooling_type]?.hex || '#059669';
        // Marker size scaled by capacity (MW)
        const radius = Math.max(7, Math.min(22, Math.sqrt(dc.capacity_mw) * 2.2));

        const marker = L.circleMarker([dc.latitude, dc.longitude], {
          radius: isSelected ? radius + 4 : radius,
          fillColor: color,
          color: isSelected ? '#ffffff' : '#1e293b',
          weight: isSelected ? 3 : 1.5,
          opacity: 1,
          fillOpacity: isSelected ? 0.95 : 0.8,
        });

        // Popup content
        const popupContent = document.createElement('div');
        popupContent.className = 'p-1 font-sans text-slate-800';
        popupContent.innerHTML = `
          <div class="font-bold text-sm text-slate-900 leading-tight mb-1">${dc.name}</div>
          <div class="text-xs text-slate-600 mb-1">${dc.operator} • ${dc.city}, ${dc.country}</div>
          <div class="grid grid-cols-2 gap-1 text-[11px] my-1.5 p-1.5 bg-slate-100 rounded">
            <div><span class="text-slate-500">Capacity:</span> <b>${dc.capacity_mw} MW</b></div>
            <div><span class="text-slate-500">PUE:</span> <b>${dc.pue}</b></div>
            <div><span class="text-slate-500">Cooling:</span> <b class="capitalize">${dc.cooling_type}</b></div>
            <div><span class="text-slate-500">Status:</span> <b>${dc.status}</b></div>
          </div>
          <a href="/datacenter/${dc.id}" class="inline-block w-full text-center mt-1 px-2.5 py-1 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded shadow-xs transition">
            View Details & Recovery Plan →
          </a>
        `;

        marker.bindPopup(popupContent, { maxWidth: 260 });

        marker.on('click', () => {
          if (onSelectDataCenter) {
            onSelectDataCenter(dc);
          }
        });

        marker.addTo(layerGroup);
        markers.push(marker);

        // If explore mode and selected DC, draw the radius circle
        if (isSelected && showRadius) {
          L.circle([dc.latitude, dc.longitude], {
            radius: radiusKm * 1000,
            color: '#059669',
            weight: 2,
            dashArray: '5, 8',
            fillColor: '#10b981',
            fillOpacity: 0.12,
          }).addTo(layerGroup);
        }
      });

      // Fly to selected DC if requested
      if (selectedDcId) {
        const found = dataCenters.find((d) => d.id === selectedDcId);
        if (found) {
          map.flyTo([found.latitude, found.longitude], 9, { duration: 1.2 });
        }
      }
    }

    // 2. COMMUNITIES MODE (Detail Page: Data Center + Nearby Villages/Towns)
    if (mode === 'communities' && activeDataCenter) {
      // Data Center Marker (Prominent)
      const dcMarker = L.circleMarker([activeDataCenter.latitude, activeDataCenter.longitude], {
        radius: 12,
        fillColor: '#0f172a',
        color: '#ffffff',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.95,
      });

      dcMarker.bindTooltip(`<b>${activeDataCenter.name}</b><br/>Capacity: ${activeDataCenter.capacity_mw} MW`, {
        permanent: false,
        direction: 'top',
      });
      dcMarker.addTo(layerGroup);

      // Community Matching Radius Circle
      if (showRadius) {
        L.circle([activeDataCenter.latitude, activeDataCenter.longitude], {
          radius: radiusKm * 1000,
          color: '#059669',
          weight: 2,
          dashArray: '6, 6',
          fillColor: '#10b981',
          fillOpacity: 0.08,
        }).addTo(layerGroup);
      }

      // Communities Markers
      const bounds = L.latLngBounds([[activeDataCenter.latitude, activeDataCenter.longitude]]);

      communities.forEach((c) => {
        bounds.extend([c.latitude, c.longitude]);
        const scoreColor =
          c.suitability_score >= 90
            ? '#059669' // Emerald
            : c.suitability_score >= 75
            ? '#d97706' // Amber
            : '#64748b'; // Slate

        const cMarker = L.circleMarker([c.latitude, c.longitude], {
          radius: 8,
          fillColor: scoreColor,
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        });

        // Community popup
        const cPopup = document.createElement('div');
        cPopup.className = 'p-1 font-sans text-slate-800 text-xs';
        cPopup.innerHTML = `
          <div class="font-bold text-sm text-slate-900">${c.name}</div>
          <div class="text-[11px] text-slate-500 capitalize mb-1">${c.type} • ${c.distance_km} km away</div>
          <div class="space-y-0.5 my-1 text-[11px]">
            <div>Pop: <b>${c.population.toLocaleString()}</b></div>
            <div>Heat Demand: <b>${c.estimated_monthly_heat_demand_mwh} MWh/mo</b></div>
            <div>Suitability: <b style="color:${scoreColor}">${c.suitability_score}%</b> (${c.pipeline_feasibility})</div>
          </div>
          ${c.notes ? `<div class="text-[10px] text-slate-500 italic mt-1 border-t pt-1">${c.notes}</div>` : ''}
        `;

        cMarker.bindPopup(cPopup);
        cMarker.addTo(layerGroup);

        // Faint direct pipeline connector line
        L.polyline(
          [
            [activeDataCenter.latitude, activeDataCenter.longitude],
            [c.latitude, c.longitude],
          ],
          {
            color: scoreColor,
            weight: 2,
            opacity: 0.6,
            dashArray: '3, 6',
          }
        ).addTo(layerGroup);
      });

      if (communities.length > 0) {
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    }

    // 3. OTHER DATA CENTERS MODE (Detail Page)
    // Section 4.2.6: Faint lines to each other DC, opacity decreasing with distance
    if (mode === 'other_dcs' && activeDataCenter) {
      // Center DC
      const centerMarker = L.circleMarker([activeDataCenter.latitude, activeDataCenter.longitude], {
        radius: 12,
        fillColor: '#0f172a',
        color: '#f59e0b',
        weight: 3,
        opacity: 1,
        fillOpacity: 1,
      });
      centerMarker.bindPopup(`<b>${activeDataCenter.name} (This Facility)</b><br/>${activeDataCenter.capacity_mw} MW`);
      centerMarker.addTo(layerGroup);

      otherDataCenters.forEach((other) => {
        // Distance decay opacity
        // <= 500km: 0.75, 500-2500km: 0.45, 2500-7500km: 0.25, >7500km: 0.12
        let opacity = 0.12;
        let weight = 1.0;
        if (other.distance_km < 500) {
          opacity = 0.75;
          weight = 2.4;
        } else if (other.distance_km < 2500) {
          opacity = 0.5;
          weight = 1.8;
        } else if (other.distance_km < 7500) {
          opacity = 0.28;
          weight = 1.2;
        }

        const color = COOLING_COLORS[other.cooling_type]?.hex || '#059669';

        // Connecting Haversine line
        L.polyline(
          [
            [activeDataCenter.latitude, activeDataCenter.longitude],
            [other.latitude, other.longitude],
          ],
          {
            color: '#10b981',
            weight: weight,
            opacity: opacity,
          }
        ).addTo(layerGroup);

        // Marker for other DC
        const otherMarker = L.circleMarker([other.latitude, other.longitude], {
          radius: 7,
          fillColor: color,
          color: '#ffffff',
          weight: 1.5,
          opacity: 0.9,
          fillOpacity: 0.8,
        });

        const pop = document.createElement('div');
        pop.className = 'p-1 font-sans text-slate-800 text-xs';
        pop.innerHTML = `
          <div class="font-bold text-sm text-slate-900">${other.name}</div>
          <div class="text-[11px] text-slate-500">${other.operator} • ${other.city}, ${other.country}</div>
          <div class="my-1.5 p-1 bg-slate-50 rounded text-[11px]">
            <div>Distance: <b>${other.distance_km.toLocaleString()} km</b></div>
            <div>Capacity: <b>${other.capacity_mw} MW</b></div>
            <div>Cooling: <b class="capitalize">${other.cooling_type}</b></div>
          </div>
          <a href="/datacenter/${other.id}" class="inline-block w-full text-center mt-1 px-2 py-0.5 text-xs text-white bg-slate-800 hover:bg-slate-900 rounded">
            View This Data Center →
          </a>
        `;
        otherMarker.bindPopup(pop);
        otherMarker.addTo(layerGroup);
      });
    }

    // 4. COMPARE MODE
    if (mode === 'compare' && compareDataCenters.length > 0) {
      const bounds = L.latLngBounds(
        compareDataCenters.map((dc) => [dc.latitude, dc.longitude] as [number, number])
      );

      compareDataCenters.forEach((dc, idx) => {
        bounds.extend([dc.latitude, dc.longitude]);
        const color = idx === 0 ? '#059669' : idx === 1 ? '#d97706' : '#7c3aed';

        const marker = L.circleMarker([dc.latitude, dc.longitude], {
          radius: 11,
          fillColor: color,
          color: '#ffffff',
          weight: 2.5,
          opacity: 1,
          fillOpacity: 0.9,
        });

        marker.bindPopup(`
          <div class="p-1 font-sans text-xs">
            <div class="font-bold text-sm">${dc.name}</div>
            <div>${dc.capacity_mw} MW • ${dc.cooling_type} cooling</div>
          </div>
        `);
        marker.addTo(layerGroup);
      });

      // Draw faint lines between compared DCs
      if (compareDataCenters.length >= 2) {
        for (let i = 0; i < compareDataCenters.length; i++) {
          for (let j = i + 1; j < compareDataCenters.length; j++) {
            L.polyline(
              [
                [compareDataCenters[i].latitude, compareDataCenters[i].longitude],
                [compareDataCenters[j].latitude, compareDataCenters[j].longitude],
              ],
              {
                color: '#64748b',
                weight: 2,
                dashArray: '4, 4',
                opacity: 0.6,
              }
            ).addTo(layerGroup);
          }
        }
      }

      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [
    mode,
    dataCenters,
    activeDataCenter,
    communities,
    otherDataCenters,
    compareDataCenters,
    selectedDcId,
    radiusKm,
    showRadius,
  ]);

  return (
    <div className={`relative w-full ${heightClass} rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100/80 dark:bg-slate-900/80 z-20 backdrop-blur-xs">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Loading map layers...</span>
          </div>
        </div>
      )}

      {tileError && (
        <div className="absolute top-3 right-3 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 text-xs px-2.5 py-1 rounded shadow z-20 border border-amber-300 dark:border-amber-800">
          ⚠️ Map tile network limited — fallback vector geometry active
        </div>
      )}

      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
