'use client'

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useRouter } from 'next/navigation';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Job } from '../../types';

// Fix Leaflet default marker icons in webpack/vite builds
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const categoryColors: Record<string, string> = {
    cleaning: '#3b82f6',
    construction: '#f59e0b',
    masonry: '#8b5cf6',
    painting: '#ec4899',
    industry: '#14b8a6',
    event: '#f97316',
    other: '#64748b',
};

const categoryLabels: Record<string, string> = {
    cleaning: 'Nettoyage',
    construction: 'Construction',
    masonry: 'Maçonnerie',
    painting: 'Peinture',
    industry: 'Industrie',
    event: 'Événementiel',
    other: 'Autre',
};

function createColoredMarker(color: string) {
    return L.divIcon({
        className: '',
        html: `<div style="
            width: 32px; height: 32px;
            background: ${color};
            border: 3px solid white;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });
}

// Auto-recenter when jobs change
function MapUpdater({ jobs }: { jobs: JobWithCoords[] }) {
    const map = useMap();

    useEffect(() => {
        if (jobs.length === 0) return;
        const bounds = jobs.map(j => [j._lat, j._lng] as [number, number]);
        if (bounds.length === 1) {
            map.setView(bounds[0], 10);
        } else {
            map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
        }
    }, [jobs, map]);

    return null;
}

interface JobWithCoords extends Job {
    _lat: number;
    _lng: number;
}

// Static French city coordinates for demo (when lat/lng not in DB yet)
const CITY_COORDS: Record<string, [number, number]> = {
    'Paris': [48.8566, 2.3522],
    'Lyon': [45.7640, 4.8357],
    'Marseille': [43.2965, 5.3698],
    'Toulouse': [43.6047, 1.4442],
    'Bordeaux': [44.8378, -0.5792],
    'Nice': [43.7102, 7.2620],
    'Nantes': [47.2184, -1.5536],
    'Strasbourg': [48.5734, 7.7521],
    'Montpellier': [43.6112, 3.8767],
    'Rennes': [48.1147, -1.6794],
    'Grenoble': [45.1885, 5.7245],
    'Lille': [50.6292, 3.0573],
    'Toulon': [43.1242, 5.9280],
    'Angers': [47.4784, -0.5632],
    'Reims': [49.2577, 4.0317],
};

function getCoords(job: Job): [number, number] | null {
    // Use DB coords if available
    if ((job as any).latitude && (job as any).longitude) {
        return [(job as any).latitude, (job as any).longitude];
    }
    // Fallback to city lookup
    const city = job.location_city?.trim();
    return CITY_COORDS[city] || null;
}

interface JobMapProps {
    jobs: Job[];
    height?: string;
}

export const JobMap: React.FC<JobMapProps> = ({ jobs, height = '500px' }) => {
    const router = useRouter();

    const jobsWithCoords: JobWithCoords[] = jobs
        .map(job => {
            const coords = getCoords(job);
            if (!coords) return null;
            return { ...job, _lat: coords[0], _lng: coords[1] };
        })
        .filter((j): j is JobWithCoords => j !== null);

    const center: [number, number] = [46.603354, 1.888334]; // Center of France

    return (
        <div style={{ height, position: 'relative', borderRadius: '0.75rem', overflow: 'hidden' }}>
            <MapContainer
                center={center}
                zoom={5}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapUpdater jobs={jobsWithCoords} />

                {jobsWithCoords.map(job => (
                    <Marker
                        key={job.id}
                        position={[job._lat, job._lng]}
                        icon={createColoredMarker(categoryColors[job.category] || '#3b82f6')}
                    >
                        <Popup className="job-map-popup" maxWidth={260}>
                            <div className="p-1">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <h3 className="font-bold text-slate-900 text-sm leading-tight">{job.title}</h3>
                                    <span
                                        className="shrink-0 text-xs px-1.5 py-0.5 rounded-full text-white font-medium"
                                        style={{ backgroundColor: categoryColors[job.category] || '#64748b' }}
                                    >
                                        {categoryLabels[job.category]}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mb-1">📍 {job.location_city}</p>
                                {job.height_meters && (
                                    <p className="text-xs text-slate-500 mb-1">📏 {job.height_meters}m de hauteur</p>
                                )}
                                {(job.budget_min || job.budget_max) && (
                                    <p className="text-xs text-slate-500 mb-2">
                                        💶 {job.budget_min}€{job.budget_max ? ` – ${job.budget_max}€` : ''}
                                    </p>
                                )}
                                <button
                                    onClick={() => job.slug && router.push(`/jobs/${job.slug}`)}
                                    className="w-full text-xs bg-brand-blue text-white py-1.5 px-3 rounded-lg font-medium hover:bg-brand-blue/90 transition-colors"
                                >
                                    Voir la mission →
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Legend */}
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg shadow p-2 z-[1000] max-w-[180px]">
                <p className="text-xs font-semibold text-slate-700 mb-1.5">Catégories</p>
                <div className="space-y-1">
                    {Object.entries(categoryLabels).slice(0, 5).map(([key, label]) => (
                        <div key={key} className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: categoryColors[key] }} />
                            <span className="text-xs text-slate-600">{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {jobsWithCoords.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-[1000]">
                    <p className="text-slate-500 text-sm">Aucune mission géolocalisée disponible</p>
                </div>
            )}
        </div>
    );
};
