
import React, { useState } from 'react';
import Card from '../components/Card';
import { useGeolocation } from '../hooks/useGeolocation';
import { getGroundedAnswer } from '../services/geminiService';
import { GroundingChunk } from '../types';
import { MapPinIcon, LinkIcon } from '../components/Icons';

const InfoScreen: React.FC = () => {
  const { data: location, loading: locationLoading, error: locationError } = useGeolocation();
  const [nearbyPlaces, setNearbyPlaces] = useState<{ text: string; sources: GroundingChunk[] } | null>(null);
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  const findNearby = async () => {
    if (!location) return;
    setLoadingPlaces(true);
    setNearbyPlaces(null);
    const response = await getGroundedAnswer(
      "Pronađi kafiće ili pekare u blizini moje lokacije.",
      true,
      location
    );
    setNearbyPlaces(response);
    setLoadingPlaces(false);
  };
  
  return (
    <div className="space-y-4 text-gray-800 dark:text-gray-200">
      <Card>
        <h2 className="text-xl font-bold">O školi</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Srednja tehnička prometna škola Split obrazuje učenike u području prometa i logistike. Naša misija je pružiti kvalitetno obrazovanje koje priprema učenike za tržište rada i daljnje školovanje.
        </p>
      </Card>
      <Card>
        <h2 className="text-xl font-bold">Kontakt</h2>
        <div className="mt-2 space-y-1 text-gray-600 dark:text-gray-300">
          <p><strong>Adresa:</strong> Zrinsko-frankopanska ul. 2, 21000, Split</p>
          <p><strong>Telefon:</strong> 021 380 733</p>
          <p><strong>Email:</strong> info@ss-tehnicka-prometna-st.skole.hr</p>
          <p><strong>Web:</strong> <a href="https://ss-tehnicka-prometna-st.skole.hr/" target="_blank" rel="noopener noreferrer" className="text-[#003366] dark:text-sky-400 hover:underline">ss-tehnicka-prometna-st.skole.hr</a></p>
        </div>
      </Card>

       <Card>
        <h2 className="text-xl font-bold flex items-center gap-2"><MapPinIcon className="h-6 w-6 text-[#003366] dark:text-sky-400" /> Istraži okolicu</h2>
        <p className="mt-1 text-gray-600 dark:text-gray-400">Koristite AI za pronalaženje korisnih mjesta u blizini škole.</p>
        <button
          onClick={findNearby}
          disabled={locationLoading || !location || loadingPlaces}
          className="mt-4 w-full bg-[#003366] text-white font-bold py-2 px-4 rounded-md hover:bg-[#004488] disabled:bg-gray-400"
        >
          {loadingPlaces ? "Tražim..." : "Pronađi kafiće i pekare u blizini"}
        </button>
        {locationError && <p className="text-red-500 text-sm mt-2">Nije moguće dohvatiti lokaciju.</p>}

        {nearbyPlaces && (
          <div className="mt-4">
            <p className="whitespace-pre-wrap">{nearbyPlaces.text}</p>
            {nearbyPlaces.sources.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold flex items-center">
                  <LinkIcon className="h-5 w-5 mr-2"/>
                  Prijedlozi s Karte:
                </h4>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {nearbyPlaces.sources.map((source, index) => (
                    source.maps && <li key={index}>
                      <a
                        href={source.maps.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#003366] dark:text-sky-400 hover:underline"
                      >
                        {source.maps.title || 'Nepoznata lokacija'}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default InfoScreen;