import React, { useState } from 'react';
import Card from '../components/Card';
import { getGroundedAnswer } from '../services/geminiService';
import { GroundingChunk } from '../types';
import { SparklesIcon, LinkIcon } from '../components/Icons';

const NewsScreen: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text: string; sources: GroundingChunk[] } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);
    const response = await getGroundedAnswer(query);
    setResult(response);
    setLoading(false);
  };

  return (
    <div className="space-y-4 text-gray-800 dark:text-gray-200">
      <Card>
        <h2 className="text-xl font-bold flex items-center">
          <SparklesIcon className="h-6 w-6 mr-2 text-[#003366]"/>
          AI Pretraga Novosti
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Postavite pitanje o nedavnim događajima, natječajima ili temama vezanim uz školu. AI će pretražiti službenu web stranicu škole za najrelevantnije informacije.
        </p>
        <form onSubmit={handleSearch} className="mt-4 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Npr. 'Kada su upisi u srednje škole?'"
            className="flex-grow p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-[#003366] outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-[#003366] text-white px-4 py-2 rounded-md hover:bg-[#004488] disabled:bg-gray-400 flex items-center"
            disabled={loading}
          >
            {loading ? 'Tražim...' : 'Pitaj'}
          </button>
        </form>
      </Card>

      {loading && (
         <div className="text-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366] mx-auto"></div>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Pretražujem web...</p>
        </div>
      )}

      {result && (
        <Card>
          <h3 className="text-lg font-semibold mb-2">Odgovor:</h3>
          <p className="whitespace-pre-wrap">{result.text}</p>
          {result.sources.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold flex items-center">
                <LinkIcon className="h-5 w-5 mr-2"/>
                Izvori:
              </h4>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {result.sources.map((source, index) => (
                  <li key={index}>
                    <a
                      href={source.web?.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#003366] hover:underline dark:text-sky-400"
                    >
                      {source.web?.title || 'Nepoznat izvor'}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default NewsScreen;