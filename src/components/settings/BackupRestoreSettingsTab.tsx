import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  ShieldCheck,
  HardDrive,
  Clock,
  Layers,
  Smartphone,
  Receipt,
  Users,
  Wrench,
  DollarSign,
  Info,
  Check,
  X,
  FileSpreadsheet
} from 'lucide-react';

export const BackupRestoreSettingsTab: React.FC = () => {
  const {
    exportBackupData,
    restoreBackupData,
    products,
    sales,
    jobCards,
    customers,
    suppliers,
    purchaseOrders,
    expenses,
    users,
    settings,
    brands,
    categories
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Download Backup State
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);

  // Upload/Restore State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedBackup, setParsedBackup] = useState<any | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);
  const [restoreSuccessMsg, setRestoreSuccessMsg] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  // Totals calculations for display
  const totalProducts = products.length;
  const totalSales = sales.length;
  const totalJobCards = jobCards.length;
  const totalCustomers = customers.length;
  const totalSuppliers = suppliers.length;
  const totalExpenses = expenses.length;
  const totalUsers = users.length;
  const totalInventoryVal = products.reduce((acc, p) => acc + (p.costPrice * p.stock), 0);
  const totalSalesRev = sales.reduce((acc, s) => acc + s.finalAmount, 0);

  // Handle Download Backup
  const handleDownloadBackup = () => {
    try {
      const snapshot = exportBackupData();
      const jsonString = JSON.stringify(snapshot, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `database_backup_metro_mobile_${dateStr}.json`;

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadSuccessMsg(`Successfully downloaded JSON snapshot (${filename})!`);
      setTimeout(() => setDownloadSuccessMsg(null), 5000);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to generate backup file. Please try again.');
    }
  };

  // Handle File Selection for Restore
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setParseError(null);
    setParsedBackup(null);
    setConfirmOverwrite(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        // Basic validation check
        const dataPayload = parsed.data || parsed;
        if (!dataPayload || typeof dataPayload !== 'object') {
          throw new Error('Invalid backup file structure. Missing data payload.');
        }

        const hasRecognizedKeys =
          Array.isArray(dataPayload.products) ||
          Array.isArray(dataPayload.sales) ||
          Array.isArray(dataPayload.jobCards) ||
          Array.isArray(dataPayload.customers) ||
          dataPayload.settings;

        if (!hasRecognizedKeys) {
          throw new Error('Unrecognized backup format. No shop data tables found in JSON.');
        }

        setParsedBackup(parsed);
      } catch (err: any) {
        setParseError(err.message || 'Failed to parse JSON file. Ensure it is a valid JSON database backup.');
      }
    };
    reader.readAsText(file);
  };

  // Execute Restore Action
  const handleExecuteRestore = () => {
    if (!parsedBackup) return;
    if (!confirmOverwrite) {
      alert('Please check the confirmation box to proceed with restoring the database.');
      return;
    }

    setIsRestoring(true);

    setTimeout(() => {
      const success = restoreBackupData(parsedBackup);
      setIsRestoring(false);

      if (success) {
        setRestoreSuccessMsg('Database snapshot restored successfully! All records have been updated.');
        setSelectedFile(null);
        setParsedBackup(null);
        setConfirmOverwrite(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setTimeout(() => setRestoreSuccessMsg(null), 6000);
      } else {
        setParseError('Failed to apply restored data to local store.');
      }
    }, 500);
  };

  const resetRestoreSelection = () => {
    setSelectedFile(null);
    setParsedBackup(null);
    setParseError(null);
    setConfirmOverwrite(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-extrabold text-white text-base flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <span>Database Backup & Restore Manager</span>
          </h3>
          <p className="text-xs text-slate-400">
            Download a full JSON data snapshot of inventory, sales, job cards, accounts, and settings for offline backup or migration.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 shrink-0">
          <HardDrive className="w-4 h-4 text-emerald-400" />
          <span>Storage Engine: <strong>Local & Memory Sync</strong></span>
        </div>
      </div>

      {/* Notifications */}
      {downloadSuccessMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-4 rounded-2xl text-xs font-bold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{downloadSuccessMsg}</span>
        </div>
      )}

      {restoreSuccessMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-4 rounded-2xl text-xs font-bold flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{restoreSuccessMsg}</span>
          </div>
          <span className="text-[10px] uppercase font-mono text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded">Live Sync Active</span>
        </div>
      )}

      {/* Current Database Metrics Snapshot */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h4 className="font-bold text-white text-xs flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Current Database Memory Footprint</span>
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">Total Records: <strong className="text-white">{totalProducts + totalSales + totalJobCards + totalCustomers + totalSuppliers + totalExpenses + totalUsers}</strong></span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-1">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold mb-1">
              <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
              <span>Products</span>
            </div>
            <div className="text-lg font-black text-white">{totalProducts}</div>
            <div className="text-[10px] text-slate-500">₹{totalInventoryVal.toLocaleString()}</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold mb-1">
              <Receipt className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sales Logs</span>
            </div>
            <div className="text-lg font-black text-white">{totalSales}</div>
            <div className="text-[10px] text-slate-500">₹{totalSalesRev.toLocaleString()}</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold mb-1">
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span>Job Cards</span>
            </div>
            <div className="text-lg font-black text-white">{totalJobCards}</div>
            <div className="text-[10px] text-slate-500">Repairs</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold mb-1">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>Customers</span>
            </div>
            <div className="text-lg font-black text-white">{totalCustomers}</div>
            <div className="text-[10px] text-slate-500">Ledger Udhar</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold mb-1">
              <HardDrive className="w-3.5 h-3.5 text-purple-400" />
              <span>Suppliers</span>
            </div>
            <div className="text-lg font-black text-white">{totalSuppliers}</div>
            <div className="text-[10px] text-slate-500">Vendors</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold mb-1">
              <DollarSign className="w-3.5 h-3.5 text-rose-400" />
              <span>Expenses</span>
            </div>
            <div className="text-lg font-black text-white">{totalExpenses}</div>
            <div className="text-[10px] text-slate-500">Shop Costs</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold mb-1">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>Staff Users</span>
            </div>
            <div className="text-lg font-black text-white">{totalUsers}</div>
            <div className="text-[10px] text-slate-500">Accounts</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Backup Export & Restore Import */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT COLUMN: EXPORT SNAPSHOT */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Download Backup Snapshot</span>
              </h4>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                JSON Standard
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Export a complete structured JSON database containing all products, sales history, job cards, customer credit ledgers, supplier bills, expenses, and system settings.
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="font-semibold text-slate-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Included in Backup Snapshot:</span>
              </div>
              <ul className="text-slate-400 text-[11px] space-y-1 list-disc list-inside">
                <li>Inventory Items, IMEIs, Brands & Categories ({totalProducts} items)</li>
                <li>Sales Transactions & Invoice Receipts ({totalSales} records)</li>
                <li>Repair Job Cards & Technician Diagnosis ({totalJobCards} jobs)</li>
                <li>Customer Accounts, Udhar Ledger & Balances ({totalCustomers} clients)</li>
                <li>Supplier Debits & Purchase Orders ({totalSuppliers} vendors / {purchaseOrders.length} POs)</li>
                <li>Shop Customization Settings, Taxes, & Signatories</li>
              </ul>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Live JSON Database Backup</span>
            </button>
            <p className="text-[10px] text-slate-500 text-center">
              Recommended: Download backups weekly or before updating system settings.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: RESTORE SNAPSHOT */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>Restore Database Snapshot</span>
              </h4>
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">
                JSON Restore
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Upload a previously generated JSON backup file to overwrite or recover shop records.
            </p>

            {/* Dropzone / File Picker */}
            {!selectedFile ? (
              <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-950 p-6 rounded-xl text-center space-y-2 transition cursor-pointer relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <FileJson className="w-10 h-10 text-indigo-400 mx-auto" />
                <div className="text-xs font-semibold text-slate-200">Click or drag a `.json` backup file here</div>
                <p className="text-[10px] text-slate-500">Supports standard Metro Mobile Care JSON backup files</p>
              </div>
            ) : (
              /* Selected File Preview Box */
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <FileJson className="w-5 h-5 text-indigo-400" />
                    <div>
                      <div className="text-xs font-bold text-slate-100">{selectedFile.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={resetRestoreSelection}
                    className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {parseError ? (
                  <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{parseError}</span>
                  </div>
                ) : parsedBackup ? (
                  <div className="space-y-3">
                    <div className="text-[11px] text-slate-300 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Snapshot Version:</span>
                        <strong className="font-mono text-white">{parsedBackup.version || '1.0'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Exported Date:</span>
                        <strong className="font-mono text-white">{parsedBackup.exportedAt ? new Date(parsedBackup.exportedAt).toLocaleString() : 'N/A'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Store Name:</span>
                        <strong className="text-white">{parsedBackup.appName || parsedBackup.data?.settings?.shopName || 'Metro Mobile Store'}</strong>
                      </div>
                    </div>

                    {/* Table breakdown of items to restore */}
                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-[11px] grid grid-cols-2 gap-2 text-slate-300 font-mono">
                      <div>• Products: <strong className="text-emerald-400">{(parsedBackup.data?.products || parsedBackup.products || []).length}</strong></div>
                      <div>• Sales Logs: <strong className="text-emerald-400">{(parsedBackup.data?.sales || parsedBackup.sales || []).length}</strong></div>
                      <div>• Job Cards: <strong className="text-emerald-400">{(parsedBackup.data?.jobCards || parsedBackup.jobCards || []).length}</strong></div>
                      <div>• Customers: <strong className="text-emerald-400">{(parsedBackup.data?.customers || parsedBackup.customers || []).length}</strong></div>
                    </div>

                    {/* Overwrite Checkbox */}
                    <label className="flex items-start gap-2 text-[11px] text-amber-300 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/30 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={confirmOverwrite}
                        onChange={(e) => setConfirmOverwrite(e.target.checked)}
                        className="accent-amber-500 w-4 h-4 rounded mt-0.5 shrink-0"
                      />
                      <span>I understand that restoring will replace current database tables with this backup state.</span>
                    </label>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleExecuteRestore}
            disabled={!parsedBackup || !!parseError || !confirmOverwrite || isRestoring}
            className={`w-full py-3.5 font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 ${
              parsedBackup && !parseError && confirmOverwrite && !isRestoring
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isRestoring ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-300" />
                <span>Restoring Database Snapshot...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Confirm & Restore Database Snapshot</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};
