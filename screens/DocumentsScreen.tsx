import React from 'react';
import Card from '../components/Card';
import { LinkIcon } from '../components/Icons';

const mockDocuments = [
  { name: 'Pravilnik o kućnom redu', url: 'http://ss-tehnicka-prometna-st.skole.hr/upload/ss-tehnicka-prometna-st/images/static3/951/File/Kucni_red_STPS_2020.pdf' },
  { name: 'Statut škole', url: 'http://ss-tehnicka-prometna-st.skole.hr/upload/ss-tehnicka-prometna-st/images/static3/951/File/Statut_STPS_procisceni_tekst_2020.pdf' },
  { name: 'Godišnji plan i program', url: 'http://ss-tehnicka-prometna-st.skole.hr/upload/ss-tehnicka-prometna-st/images/static3/1025/File/GPP_2023_2024.pdf' },
  { name: 'Školski kurikulum', url: 'http://ss-tehnicka-prometna-st.skole.hr/upload/ss-tehnicka-prometna-st/images/static3/1026/File/SK_2023_2024_STPS.pdf' },
  { name: 'Obrazac za ispričnicu', url: 'http://ss-tehnicka-prometna-st.skole.hr/upload/ss-tehnicka-prometna-st/images/static3/952/File/Ispricnica.docx' },
  { name: 'Zahtjev za izdavanje potvrde', url: 'http://ss-tehnicka-prometna-st.skole.hr/upload/ss-tehnicka-prometna-st/images/static3/952/File/Zahtjev_za_izdavanje_duplikata_prijepisa_svjedodzbi.docx' },
];

const DocumentsScreen: React.FC = () => {
  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Školski Dokumenti i Obrasci</h2>
        <p className="text-slate-600 dark:text-slate-300 mt-1">Ovdje možete pronaći i preuzeti važne školske dokumente i obrasce.</p>
      </Card>
      
      <div className="space-y-3">
        {mockDocuments.map((doc, index) => (
          <a 
            key={index} 
            href={doc.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="block"
            aria-label={`Preuzmi ${doc.name}`}
          >
            <Card className="hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700 dark:text-slate-200">{doc.name}</span>
                <LinkIcon className="h-5 w-5 text-slate-400" />
              </div>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
};

export default DocumentsScreen;