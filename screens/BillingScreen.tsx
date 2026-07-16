import React, { useMemo, useState } from 'react';
import Card from '../components/Card';

type InvoiceStatus = 'Plaćeno' | 'Djelomično' | 'Dospjelo' | 'Otvoreno' | 'Preplaćeno';
type LedgerEntryType = 'Uplata' | 'Umanjenje' | 'Kompenzacija';

interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Property {
  id: string;
  name: string;
  ownerId: string;
  location: string;
  category: string;
}

interface Invoice {
  id: string;
  ownerId: string;
  propertyId: string;
  number: string;
  issueDate: string;
  dueDate: string;
  description: string;
  amount: number;
  source: 'orders.csv' | 'Ručni unos';
}

interface LedgerEntry {
  id: string;
  invoiceId: string;
  date: string;
  type: LedgerEntryType;
  amount: number;
  note: string;
}

interface InvoiceWithBalance extends Invoice {
  owner?: Owner;
  property?: Property;
  paid: number;
  adjustments: number;
  balance: number;
  status: InvoiceStatus;
}

const currencyFormatter = new Intl.NumberFormat('hr-HR', { style: 'currency', currency: 'EUR' });
const dateFormatter = new Intl.DateTimeFormat('hr-HR');
const todayIso = new Date().toISOString().slice(0, 10);

const ownersSeed: Owner[] = [
  { id: 'u-001', name: 'Ana Kovač', email: 'ana.kovac@example.com', phone: '+385 91 234 5678' },
  { id: 'u-002', name: 'Marko Bilić', email: 'marko.bilic@example.com', phone: '+385 98 765 4321' },
  { id: 'u-003', name: 'Ivana Radić', email: 'ivana.radic@example.com', phone: '+385 95 444 2222' },
];

const propertiesSeed: Property[] = [
  { id: 'p-001', name: 'Villa More', ownerId: 'u-001', location: 'Split', category: 'Kuća za odmor' },
  { id: 'p-002', name: 'Apartman Riva', ownerId: 'u-001', location: 'Trogir', category: 'Apartman' },
  { id: 'p-003', name: 'House Lavanda', ownerId: 'u-002', location: 'Hvar', category: 'Vila' },
  { id: 'p-004', name: 'Studio Centar', ownerId: 'u-003', location: 'Split', category: 'Studio' },
];

const invoicesSeed: Invoice[] = [
  { id: 'i-001', ownerId: 'u-001', propertyId: 'p-001', number: '2026-001', issueDate: '2026-06-01', dueDate: '2026-06-15', description: 'Provizija za rezervacije iz orders.csv', amount: 1240, source: 'orders.csv' },
  { id: 'i-002', ownerId: 'u-001', propertyId: 'p-002', number: '2026-002', issueDate: '2026-06-05', dueDate: '2026-06-20', description: 'Usluga upravljanja objektom', amount: 780, source: 'orders.csv' },
  { id: 'i-003', ownerId: 'u-002', propertyId: 'p-003', number: '2026-003', issueDate: '2026-06-11', dueDate: '2026-06-25', description: 'Rezervacija preko partnerskog kanala', amount: 1520, source: 'orders.csv' },
  { id: 'i-004', ownerId: 'u-003', propertyId: 'p-004', number: '2026-004', issueDate: '2026-07-01', dueDate: '2026-07-21', description: 'Dodatno čišćenje i servis', amount: 320, source: 'Ručni unos' },
];

const ledgerSeed: LedgerEntry[] = [
  { id: 'l-001', invoiceId: 'i-001', date: '2026-06-12', type: 'Uplata', amount: 900, note: 'Bankovna uplata' },
  { id: 'l-002', invoiceId: 'i-001', date: '2026-06-14', type: 'Umanjenje', amount: 100, note: 'Korekcija provizije' },
  { id: 'l-003', invoiceId: 'i-002', date: '2026-06-19', type: 'Uplata', amount: 780, note: 'Zatvoren račun' },
  { id: 'l-004', invoiceId: 'i-003', date: '2026-06-28', type: 'Kompenzacija', amount: 420, note: 'Kompenzacija za servis' },
];

const BillingScreen: React.FC = () => {
  const [owners, setOwners] = useState<Owner[]>(ownersSeed);
  const [properties, setProperties] = useState<Property[]>(propertiesSeed);
  const [invoices, setInvoices] = useState<Invoice[]>(invoicesSeed);
  const [ledger, setLedger] = useState<LedgerEntry[]>(ledgerSeed);
  const [query, setQuery] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(invoicesSeed[0]?.id ?? '');
  const [entryType, setEntryType] = useState<LedgerEntryType>('Uplata');
  const [entryAmount, setEntryAmount] = useState('');
  const [entryNote, setEntryNote] = useState('');
  const [newInvoice, setNewInvoice] = useState({ ownerId: ownersSeed[0].id, propertyId: propertiesSeed[0].id, amount: '', description: '', dueDate: todayIso });

  const invoicesWithBalance = useMemo<InvoiceWithBalance[]>(() => invoices.map((invoice) => {
    const entries = ledger.filter((entry) => entry.invoiceId === invoice.id);
    const paid = entries.filter((entry) => entry.type === 'Uplata').reduce((sum, entry) => sum + entry.amount, 0);
    const adjustments = entries.filter((entry) => entry.type !== 'Uplata').reduce((sum, entry) => sum + entry.amount, 0);
    const balance = invoice.amount - paid - adjustments;
    const status: InvoiceStatus = balance < 0 ? 'Preplaćeno' : balance === 0 ? 'Plaćeno' : paid + adjustments > 0 ? 'Djelomično' : new Date(invoice.dueDate) < new Date(todayIso) ? 'Dospjelo' : 'Otvoreno';

    return {
      ...invoice,
      owner: owners.find((owner) => owner.id === invoice.ownerId),
      property: properties.find((property) => property.id === invoice.propertyId),
      paid,
      adjustments,
      balance,
      status,
    };
  }), [invoices, ledger, owners, properties]);

  const filteredInvoices = invoicesWithBalance.filter((invoice) => {
    const haystack = `${invoice.number} ${invoice.owner?.name ?? ''} ${invoice.property?.name ?? ''} ${invoice.description}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (ownerFilter === 'all' || invoice.ownerId === ownerFilter) && (propertyFilter === 'all' || invoice.propertyId === propertyFilter);
  });

  const selectedInvoice = invoicesWithBalance.find((invoice) => invoice.id === selectedInvoiceId) ?? filteredInvoices[0];
  const totalIssued = invoicesWithBalance.reduce((sum, invoice) => sum + invoice.amount, 0);
  const totalPaid = invoicesWithBalance.reduce((sum, invoice) => sum + invoice.paid, 0);
  const totalOpen = invoicesWithBalance.reduce((sum, invoice) => sum + Math.max(invoice.balance, 0), 0);
  const overdue = invoicesWithBalance.filter((invoice) => invoice.status === 'Dospjelo' || invoice.status === 'Djelomično').reduce((sum, invoice) => sum + Math.max(invoice.balance, 0), 0);

  const ownerStatements = owners.map((owner) => {
    const ownerInvoices = invoicesWithBalance.filter((invoice) => invoice.ownerId === owner.id);
    return { owner, invoiceCount: ownerInvoices.length, balance: ownerInvoices.reduce((sum, invoice) => sum + invoice.balance, 0) };
  }).sort((a, b) => b.balance - a.balance);

  const propertyStatements = properties.map((property) => {
    const propertyInvoices = invoicesWithBalance.filter((invoice) => invoice.propertyId === property.id);
    return { property, owner: owners.find((owner) => owner.id === property.ownerId), balance: propertyInvoices.reduce((sum, invoice) => sum + invoice.balance, 0) };
  }).sort((a, b) => b.balance - a.balance);

  const handleAddEntry = (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(entryAmount);
    if (!selectedInvoice || !amount || amount <= 0) return;
    setLedger((current) => [...current, { id: `l-${Date.now()}`, invoiceId: selectedInvoice.id, date: todayIso, type: entryType, amount, note: entryNote || entryType }]);
    setEntryAmount('');
    setEntryNote('');
  };

  const handleAddInvoice = (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(newInvoice.amount);
    if (!amount || amount <= 0 || !newInvoice.description.trim()) return;
    const invoice: Invoice = {
      id: `i-${Date.now()}`,
      ownerId: newInvoice.ownerId,
      propertyId: newInvoice.propertyId,
      number: `RU-${invoices.length + 1}`,
      issueDate: todayIso,
      dueDate: newInvoice.dueDate,
      description: newInvoice.description,
      amount,
      source: 'Ručni unos',
    };
    setInvoices((current) => [invoice, ...current]);
    setSelectedInvoiceId(invoice.id);
    setNewInvoice((current) => ({ ...current, amount: '', description: '' }));
  };

  const handleCsvUpload = async (file: File | undefined, kind: 'orders' | 'users' | 'objects') => {
    if (!file) return;
    const rows = parseCsv(await file.text());
    if (kind === 'users') {
      setOwners(rows.map((row, index) => ({ id: valueOf(row, ['id', 'user_id', 'owner_id']) || `u-csv-${index}`, name: valueOf(row, ['name', 'owner', 'client', 'vlasnik']) || `Vlasnik ${index + 1}`, email: valueOf(row, ['email', 'mail']), phone: valueOf(row, ['phone', 'telefon', 'mobile']) })));
    }
    if (kind === 'objects') {
      setProperties(rows.map((row, index) => ({ id: valueOf(row, ['id', 'object_id', 'property_id']) || `p-csv-${index}`, ownerId: valueOf(row, ['owner_id', 'user_id', 'vlasnik_id']) || owners[0]?.id || '', name: valueOf(row, ['name', 'object', 'property', 'objekt']) || `Objekt ${index + 1}`, location: valueOf(row, ['location', 'city', 'mjesto']), category: valueOf(row, ['category', 'type', 'tip']) })));
    }
    if (kind === 'orders') {
      setInvoices(rows.map((row, index) => ({ id: valueOf(row, ['id', 'invoice_id', 'order_id']) || `i-csv-${index}`, ownerId: valueOf(row, ['owner_id', 'user_id', 'vlasnik_id']) || owners[0]?.id || '', propertyId: valueOf(row, ['property_id', 'object_id', 'objekt_id']) || properties[0]?.id || '', number: valueOf(row, ['invoice', 'invoice_number', 'number', 'račun']) || `CSV-${index + 1}`, issueDate: valueOf(row, ['issue_date', 'date', 'datum']) || todayIso, dueDate: valueOf(row, ['due_date', 'dospijeće']) || todayIso, description: valueOf(row, ['description', 'service', 'opis']) || 'Račun iz orders.csv', amount: Number(valueOf(row, ['amount', 'total', 'iznos']).replace(',', '.')) || 0, source: 'orders.csv' })));
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">Naplata i potraživanja</p>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Jedinstveni pregled računa, uplata i stanja po vlasniku/objektu</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">Uvezite orders.csv, users.csv i liste objekata ili koristite ručni unos za dodatne servise i rezervacije.</p>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Metric label="Izdano" value={currencyFormatter.format(totalIssued)} />
        <Metric label="Naplaćeno" value={currencyFormatter.format(totalPaid)} />
        <Metric label="Otvoreno" value={currencyFormatter.format(totalOpen)} tone="amber" />
        <Metric label="Za pratiti" value={currencyFormatter.format(overdue)} tone="red" />
      </div>

      <Card>
        <h3 className="font-bold text-gray-800 dark:text-gray-100">Uvoz podataka</h3>
        <div className="mt-3 grid gap-2 text-sm">
          <FileInput label="orders.csv - izdani računi" onChange={(file) => handleCsvUpload(file, 'orders')} />
          <FileInput label="users.csv - vlasnici i kontakti" onChange={(file) => handleCsvUpload(file, 'users')} />
          <FileInput label="objekti.csv - objekti i lokacije" onChange={(file) => handleCsvUpload(file, 'objects')} />
        </div>
      </Card>

      <Card>
        <div className="grid gap-2 sm:grid-cols-3">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Traži vlasnika, objekt, račun..." className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700" />
          <select value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
            <option value="all">Svi vlasnici</option>
            {owners.map((owner) => <option key={owner.id} value={owner.id}>{owner.name}</option>)}
          </select>
          <select value={propertyFilter} onChange={(event) => setPropertyFilter(event.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
            <option value="all">Svi objekti</option>
            {properties.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}
          </select>
        </div>
      </Card>

      <Card>
        <h3 className="font-bold text-gray-800 dark:text-gray-100">Računi</h3>
        <div className="mt-3 space-y-2">
          {filteredInvoices.map((invoice) => <button key={invoice.id} onClick={() => setSelectedInvoiceId(invoice.id)} className="w-full rounded-xl border border-gray-200 p-3 text-left transition hover:border-sky-400 dark:border-gray-700">
            <div className="flex justify-between gap-2"><span className="font-semibold">{invoice.number} · {invoice.property?.name}</span><StatusBadge status={invoice.status} /></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{invoice.owner?.name} · dospijeće {dateFormatter.format(new Date(invoice.dueDate))} · {invoice.source}</p>
            <div className="mt-2 flex justify-between text-sm"><span>Iznos {currencyFormatter.format(invoice.amount)}</span><strong>Dug {currencyFormatter.format(invoice.balance)}</strong></div>
          </button>)}
        </div>
      </Card>

      {selectedInvoice && <Card>
        <h3 className="font-bold text-gray-800 dark:text-gray-100">Unos uplate, umanjenja ili kompenzacije</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Odabrano: {selectedInvoice.number} · {selectedInvoice.owner?.name} · otvoreno {currencyFormatter.format(selectedInvoice.balance)}</p>
        <form onSubmit={handleAddEntry} className="mt-3 grid gap-2 sm:grid-cols-4">
          <select value={entryType} onChange={(event) => setEntryType(event.target.value as LedgerEntryType)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700"><option>Uplata</option><option>Umanjenje</option><option>Kompenzacija</option></select>
          <input value={entryAmount} onChange={(event) => setEntryAmount(event.target.value)} type="number" min="0" step="0.01" placeholder="Iznos" className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700" />
          <input value={entryNote} onChange={(event) => setEntryNote(event.target.value)} placeholder="Napomena" className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700" />
          <button className="rounded-lg bg-[#003366] px-4 py-2 font-semibold text-white hover:bg-[#004488]">Spremi</button>
        </form>
      </Card>}

      <Card>
        <h3 className="font-bold text-gray-800 dark:text-gray-100">Novi dodatni račun</h3>
        <form onSubmit={handleAddInvoice} className="mt-3 grid gap-2">
          <div className="grid gap-2 sm:grid-cols-2"><select value={newInvoice.ownerId} onChange={(event) => setNewInvoice((current) => ({ ...current, ownerId: event.target.value }))} className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700">{owners.map((owner) => <option key={owner.id} value={owner.id}>{owner.name}</option>)}</select><select value={newInvoice.propertyId} onChange={(event) => setNewInvoice((current) => ({ ...current, propertyId: event.target.value }))} className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700">{properties.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}</select></div>
          <input value={newInvoice.description} onChange={(event) => setNewInvoice((current) => ({ ...current, description: event.target.value }))} placeholder="Opis servisa ili rezervacije" className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700" />
          <div className="grid gap-2 sm:grid-cols-3"><input value={newInvoice.amount} onChange={(event) => setNewInvoice((current) => ({ ...current, amount: event.target.value }))} type="number" min="0" step="0.01" placeholder="Iznos" className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700" /><input value={newInvoice.dueDate} onChange={(event) => setNewInvoice((current) => ({ ...current, dueDate: event.target.value }))} type="date" className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700" /><button className="rounded-lg bg-sky-700 px-4 py-2 font-semibold text-white hover:bg-sky-800">Dodaj račun</button></div>
        </form>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatementCard title="Stanje po vlasniku" rows={ownerStatements.map((item) => ({ label: item.owner.name, meta: `${item.invoiceCount} računa · ${item.owner.phone}`, value: item.balance }))} />
        <StatementCard title="Stanje po objektu" rows={propertyStatements.map((item) => ({ label: item.property.name, meta: `${item.owner?.name ?? 'Nepoznato'} · ${item.property.location}`, value: item.balance }))} />
      </div>
    </div>
  );
};

const Metric = ({ label, value, tone = 'blue' }: { label: string; value: string; tone?: 'blue' | 'amber' | 'red' }) => {
  const color = tone === 'red' ? 'text-red-700 dark:text-red-300' : tone === 'amber' ? 'text-amber-700 dark:text-amber-300' : 'text-sky-800 dark:text-sky-300';
  return <Card className="text-center"><p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p><p className={`mt-1 text-xl font-bold ${color}`}>{value}</p></Card>;
};

const StatusBadge = ({ status }: { status: InvoiceStatus }) => {
  const styles: Record<InvoiceStatus, string> = { Plaćeno: 'bg-green-100 text-green-800', Djelomično: 'bg-amber-100 text-amber-800', Dospjelo: 'bg-red-100 text-red-800', Otvoreno: 'bg-sky-100 text-sky-800', Preplaćeno: 'bg-purple-100 text-purple-800' };
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${styles[status]}`}>{status}</span>;
};

const FileInput = ({ label, onChange }: { label: string; onChange: (file?: File) => void }) => <label className="flex flex-col gap-1 rounded-lg border border-dashed border-gray-300 p-3 dark:border-gray-600"><span className="font-medium text-gray-700 dark:text-gray-200">{label}</span><input type="file" accept=".csv,text/csv" onChange={(event) => onChange(event.target.files?.[0])} className="text-sm" /></label>;

const StatementCard = ({ title, rows }: { title: string; rows: { label: string; meta: string; value: number }[] }) => <Card><h3 className="font-bold text-gray-800 dark:text-gray-100">{title}</h3><div className="mt-3 space-y-2">{rows.map((row) => <div key={row.label} className="flex items-start justify-between gap-3 border-b border-gray-100 pb-2 last:border-0 dark:border-gray-700"><div><p className="font-medium text-gray-800 dark:text-gray-100">{row.label}</p><p className="text-xs text-gray-500 dark:text-gray-400">{row.meta}</p></div><strong className={row.value > 0 ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}>{currencyFormatter.format(row.value)}</strong></div>)}</div></Card>;

const parseCsv = (text: string): Record<string, string>[] => {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const delimiter = lines[0].includes(';') ? ';' : ',';
  const headers = splitCsvLine(lines[0], delimiter).map((header) => header.trim().toLowerCase());
  return lines.slice(1).map((line) => Object.fromEntries(splitCsvLine(line, delimiter).map((cell, index) => [headers[index] ?? `col_${index}`, cell.trim()])));
};

const splitCsvLine = (line: string, delimiter: ',' | ';') => {
  const cells: string[] = [];
  let current = '';
  let quoted = false;
  for (const character of line) {
    if (character === '"') quoted = !quoted;
    else if (character === delimiter && !quoted) { cells.push(current); current = ''; }
    else current += character;
  }
  cells.push(current);
  return cells;
};

const valueOf = (row: Record<string, string>, keys: string[]) => keys.map((key) => row[key]).find(Boolean) ?? '';

export default BillingScreen;
