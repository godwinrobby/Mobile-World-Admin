import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RepairJobCard } from '../../types';
import { Pagination } from '../common/Pagination';
import { PdfInvoiceModal } from '../common/PdfInvoiceModal';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Printer,
  Eye,
  Trash2,
  Phone,
  User,
  Smartphone,
  ShieldCheck,
  DollarSign,
  PackageCheck,
  X,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Cpu,
  Layers,
  Calendar,
  Check,
  Download,
  FileText
} from 'lucide-react';

export const RepairsModule: React.FC = () => {
  const {
    jobCards,
    createJobCard,
    updateJobCardStatus,
    updateJobCard,
    deleteJobCard,
    settings,
    brands
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('All');

  // Pagination State
  const [repairPage, setRepairPage] = useState(1);
  const [repairPageSize, setRepairPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedJobCardForView, setSelectedJobCardForView] = useState<RepairJobCard | null>(null);
  const [selectedJobCardForPrint, setSelectedJobCardForPrint] = useState<RepairJobCard | null>(null);
  const [selectedJobCardForPdf, setSelectedJobCardForPdf] = useState<RepairJobCard | null>(null);
  const [editingJobCard, setEditingJobCard] = useState<RepairJobCard | null>(null);

  // New Job Card Form State
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    deviceBrand: 'Apple',
    deviceModel: '',
    imeiOrSerial: '',
    passcode: '',
    physicalCondition: 'Minor pocket scratches, screen intact',
    reportedFault: '',
    diagnosis: '',
    assignedTechnician: 'Suresh Kumar (Senior Specialist)',
    estimatedCost: 1500,
    finalCost: 1500,
    advancePaid: 0,
    warrantyDays: 30,
    promisedDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    notes: ''
  });

  // Calculate Dashboard Metrics
  const totalJobs = jobCards.length;
  const inProgressJobs = jobCards.filter(j => j.status === 'In Progress' || j.status === 'Received / Diagnostic' || j.status === 'Awaiting Spare Part');
  const readyJobs = jobCards.filter(j => j.status === 'Ready for Pickup');
  const completedJobs = jobCards.filter(j => j.status === 'Completed & Delivered');
  
  const totalRevenue = jobCards
    .filter(j => j.status === 'Completed & Delivered' || j.status === 'Ready for Pickup')
    .reduce((sum, j) => sum + (j.finalCost || j.estimatedCost), 0);

  const totalAdvanceCollected = jobCards.reduce((sum, j) => sum + (j.advancePaid || 0), 0);
  const totalBalancePending = jobCards
    .filter(j => j.status !== 'Cancelled' && j.status !== 'Completed & Delivered')
    .reduce((sum, j) => sum + Math.max(0, (j.finalCost || j.estimatedCost) - (j.advancePaid || 0)), 0);

  // Filter Job Cards
  const filteredJobCards = jobCards.filter(jc => {
    const matchesSearch =
      jc.jobCardNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jc.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jc.customerPhone.includes(searchQuery) ||
      jc.deviceModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jc.imeiOrSerial.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jc.assignedTechnician.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jc.reportedFault.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedStatusTab === 'All') return true;
    if (selectedStatusTab === 'Active') return jc.status === 'Received / Diagnostic' || jc.status === 'In Progress' || jc.status === 'Awaiting Spare Part';
    if (selectedStatusTab === 'Ready') return jc.status === 'Ready for Pickup';
    if (selectedStatusTab === 'Completed') return jc.status === 'Completed & Delivered';
    return jc.status === selectedStatusTab;
  });

  const paginatedJobCards = filteredJobCards.slice(
    (repairPage - 1) * repairPageSize,
    repairPage * repairPageSize
  );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerPhone || !formData.deviceModel || !formData.reportedFault) {
      alert('Please fill in Customer Name, Phone, Device Model, and Reported Fault.');
      return;
    }

    const est = Number(formData.estimatedCost) || 0;
    const adv = Number(formData.advancePaid) || 0;
    const bal = Math.max(0, est - adv);

    const newJc = createJobCard({
      createdDate: new Date().toISOString().split('T')[0],
      promisedDate: formData.promisedDate,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerEmail: formData.customerEmail || undefined,
      deviceBrand: formData.deviceBrand,
      deviceModel: formData.deviceModel,
      imeiOrSerial: formData.imeiOrSerial || 'N/A',
      passcode: formData.passcode || undefined,
      physicalCondition: formData.physicalCondition,
      reportedFault: formData.reportedFault,
      diagnosis: formData.diagnosis || 'Initial inspection pending',
      assignedTechnician: formData.assignedTechnician,
      estimatedCost: est,
      finalCost: est,
      advancePaid: adv,
      balanceDue: bal,
      status: 'Received / Diagnostic',
      paymentStatus: adv >= est && est > 0 ? 'Paid in Full' : adv > 0 ? 'Advance Received' : 'Pending',
      warrantyDays: Number(formData.warrantyDays) || 30,
      sparePartsUsed: [],
      notes: formData.notes
    });

    setShowAddModal(false);
    setSelectedJobCardForPrint(newJc);

    // Reset Form
    setFormData({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      deviceBrand: 'Apple',
      deviceModel: '',
      imeiOrSerial: '',
      passcode: '',
      physicalCondition: 'Minor pocket scratches, screen intact',
      reportedFault: '',
      diagnosis: '',
      assignedTechnician: 'Suresh Kumar (Senior Specialist)',
      estimatedCost: 1500,
      finalCost: 1500,
      advancePaid: 0,
      warrantyDays: 30,
      promisedDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      notes: ''
    });
  };

  const getStatusBadge = (status: RepairJobCard['status']) => {
    switch (status) {
      case 'Received / Diagnostic':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Clock className="w-3 h-3" /> Diagnostic
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Wrench className="w-3 h-3" /> In Progress
          </span>
        );
      case 'Awaiting Spare Part':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Layers className="w-3 h-3" /> Spare Part
          </span>
        );
      case 'Ready for Pickup':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse">
            <CheckCircle2 className="w-3 h-3" /> Ready for Pickup
          </span>
        );
      case 'Completed & Delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            <PackageCheck className="w-3 h-3 text-slate-400" /> Delivered
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            <X className="w-3 h-3" /> Cancelled
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Module Header & Main CTA */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Device Repair Center & Job Cards</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-normal">
                  Live Management
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Screen replacements, battery servicing, technician assignment, diagnostic logs, and job card printing.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Job Card</span>
          </button>
        </div>
      </div>

      {/* REPAIRS DASHBOARD - KPI METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Total Repairs</span>
          <div className="text-2xl font-extrabold text-white flex items-center justify-between">
            <span>{totalJobs}</span>
            <Cpu className="w-5 h-5 text-indigo-400 opacity-60" />
          </div>
          <p className="text-[10px] text-slate-500">All recorded service entries</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] text-amber-400/90 font-semibold uppercase tracking-wider">In Progress</span>
          <div className="text-2xl font-extrabold text-amber-400 flex items-center justify-between">
            <span>{inProgressJobs.length}</span>
            <Wrench className="w-5 h-5 text-amber-400 opacity-60" />
          </div>
          <p className="text-[10px] text-slate-500">Being serviced by techs</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">Ready for Pickup</span>
          <div className="text-2xl font-extrabold text-emerald-400 flex items-center justify-between">
            <span>{readyJobs.length}</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400 opacity-60" />
          </div>
          <p className="text-[10px] text-slate-500">Awaiting customer collection</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] text-cyan-400 font-semibold uppercase tracking-wider">Completed</span>
          <div className="text-2xl font-extrabold text-cyan-400 flex items-center justify-between">
            <span>{completedJobs.length}</span>
            <PackageCheck className="w-5 h-5 text-cyan-400 opacity-60" />
          </div>
          <p className="text-[10px] text-slate-500">Handed over to customer</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] text-indigo-400 font-semibold uppercase tracking-wider">Repair Revenue</span>
          <div className="text-xl font-extrabold text-white flex items-center justify-between">
            <span>{settings.currencySymbol}{totalRevenue.toLocaleString('en-IN')}</span>
            <TrendingUp className="w-5 h-5 text-indigo-400 opacity-60" />
          </div>
          <p className="text-[10px] text-slate-500">Ready & Completed jobs</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] text-rose-400 font-semibold uppercase tracking-wider">Pending Balance</span>
          <div className="text-xl font-extrabold text-rose-400 flex items-center justify-between">
            <span>{settings.currencySymbol}{totalBalancePending.toLocaleString('en-IN')}</span>
            <DollarSign className="w-5 h-5 text-rose-400 opacity-60" />
          </div>
          <p className="text-[10px] text-slate-500">To collect on delivery</p>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
            {[
              { id: 'All', label: `All (${jobCards.length})` },
              { id: 'Active', label: `Active (${inProgressJobs.length})` },
              { id: 'Ready', label: `Ready for Pickup (${readyJobs.length})` },
              { id: 'Completed', label: `Completed (${completedJobs.length})` },
              { id: 'Received / Diagnostic', label: 'Diagnostic' },
              { id: 'Awaiting Spare Part', label: 'Spare Parts' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatusTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                  selectedStatusTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search JC #, Customer, IMEI, Model..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* PROPER REPAIR JOB CARDS LISTING / DATATABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <span>Repair Job Cards Listing</span>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-normal">
              Showing {filteredJobCards.length} records
            </span>
          </h3>
        </div>

        {filteredJobCards.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <Wrench className="w-6 h-6" />
            </div>
            <p className="text-slate-400 text-xs font-medium">No repair job cards match your filters.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedStatusTab('All'); }}
              className="text-indigo-400 hover:underline text-xs font-semibold"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-3 p-3">
            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Job Card # & Date</th>
                    <th className="p-3.5">Customer Details</th>
                    <th className="p-3.5">Device & IMEI</th>
                    <th className="p-3.5">Reported Issue & Diagnosis</th>
                    <th className="p-3.5">Technician</th>
                    <th className="p-3.5 text-right">Estimate / Paid</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {paginatedJobCards.map(jc => {
                    const est = jc.finalCost || jc.estimatedCost;
                  const adv = jc.advancePaid || 0;
                  const bal = Math.max(0, est - adv);

                  return (
                    <tr key={jc.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* JC Number & Dates */}
                      <td className="p-3.5 font-mono">
                        <div className="font-bold text-indigo-300">{jc.jobCardNumber}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-600" />
                          <span>{jc.createdDate}</span>
                        </div>
                        <div className="text-[10px] text-amber-400/80 font-sans">
                          Promised: {jc.promisedDate}
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="p-3.5">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span>{jc.customerName}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{jc.customerPhone}</span>
                        </div>
                      </td>

                      {/* Device & IMEI */}
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{jc.deviceBrand} {jc.deviceModel}</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                          IMEI: {jc.imeiOrSerial}
                        </div>
                        {jc.passcode && (
                          <div className="text-[10px] text-slate-400">
                            Lock: <span className="font-mono text-slate-300">{jc.passcode}</span>
                          </div>
                        )}
                      </td>

                      {/* Fault & Diagnosis */}
                      <td className="p-3.5 max-w-xs">
                        <div className="text-slate-200 font-medium truncate" title={jc.reportedFault}>
                          {jc.reportedFault}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5" title={jc.diagnosis || jc.physicalCondition}>
                          Cond: {jc.physicalCondition}
                        </div>
                      </td>

                      {/* Technician */}
                      <td className="p-3.5">
                        <div className="text-slate-300 text-[11px] font-medium">
                          {jc.assignedTechnician}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Warranty: {jc.warrantyDays} days
                        </div>
                      </td>

                      {/* Financials */}
                      <td className="p-3.5 text-right">
                        <div className="font-extrabold text-white">
                          {settings.currencySymbol}{est.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Adv: {settings.currencySymbol}{adv.toLocaleString('en-IN')}
                        </div>
                        {bal > 0 ? (
                          <div className="text-[10px] font-bold text-rose-400">
                            Due: {settings.currencySymbol}{bal.toLocaleString('en-IN')}
                          </div>
                        ) : (
                          <div className="text-[10px] font-bold text-emerald-400">
                            Paid in Full
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <div className="space-y-1.5">
                          {getStatusBadge(jc.status)}
                          
                          {/* Quick status updater */}
                          <select
                            value={jc.status}
                            onChange={(e) => {
                              const newStatus = e.target.value as RepairJobCard['status'];
                              updateJobCardStatus(jc.id, newStatus);
                            }}
                            className="block w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-0.5 text-[10px] text-slate-400 focus:outline-none focus:border-indigo-500 cursor-pointer"
                          >
                            <option value="Received / Diagnostic">Diagnostic</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Awaiting Spare Part">Spare Parts</option>
                            <option value="Ready for Pickup">Ready for Pickup</option>
                            <option value="Completed & Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedJobCardForPdf(jc)}
                            title="Generate PDF Service Invoice"
                            className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 rounded-lg transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setSelectedJobCardForView(jc)}
                            title="View Job Card Details"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setSelectedJobCardForPrint(jc)}
                            title="Print Job Card Slip"
                            className="p-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 rounded-lg transition-colors cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {jc.status === 'Ready for Pickup' && bal > 0 && (
                            <button
                              onClick={() => {
                                if (confirm(`Collect balance payment of ${settings.currencySymbol}${bal} and mark as Delivered?`)) {
                                  updateJobCardStatus(jc.id, 'Completed & Delivered', 'Paid in Full');
                                }
                              }}
                              title="Deliver & Collect Balance"
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" /> Deliver
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this repair job card?')) {
                                deleteJobCard(jc.id);
                              }
                            }}
                            title="Delete"
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Repairs Pagination Controls */}
          <Pagination
            currentPage={repairPage}
            totalPages={Math.ceil(filteredJobCards.length / repairPageSize) || 1}
            totalItems={filteredJobCards.length}
            pageSize={repairPageSize}
            onPageChange={(p) => setRepairPage(p)}
            onPageSizeChange={(sz) => {
              setRepairPageSize(sz);
              setRepairPage(1);
            }}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        </div>
      )}
      </div>

      {/* SIDE POPUP / DRAWER: CREATE NEW REPAIR JOB CARD */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex justify-end">
          {/* Backdrop click to close */}
          <div className="absolute inset-0" onClick={() => setShowAddModal(false)} />

          {/* Right Side Drawer */}
          <div className="relative w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Create Repair Job Card</h3>
                  <p className="text-xs text-slate-400">Device intake, diagnostics & customer receipt</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Customer Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Customer Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Customer Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.customerName}
                      onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={formData.customerPhone}
                      onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      placeholder="customer@gmail.com"
                      value={formData.customerEmail}
                      onChange={e => setFormData({ ...formData, customerEmail: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Device Details */}
              <div className="space-y-3 pt-3 border-t border-slate-800/80">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" /> Device Specifications
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Brand *</label>
                    <select
                      value={formData.deviceBrand}
                      onChange={e => setFormData({ ...formData, deviceBrand: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      {brands.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Device Model *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. iPhone 15 Pro Max, S23"
                      value={formData.deviceModel}
                      onChange={e => setFormData({ ...formData, deviceModel: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">IMEI or Serial Number</label>
                    <input
                      type="text"
                      placeholder="15-digit IMEI or Serial #"
                      value={formData.imeiOrSerial}
                      onChange={e => setFormData({ ...formData, imeiOrSerial: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Passcode / Pattern</label>
                    <input
                      type="text"
                      placeholder="e.g. 1234 or Pattern shape"
                      value={formData.passcode}
                      onChange={e => setFormData({ ...formData, passcode: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Physical Condition On Intake</label>
                    <input
                      type="text"
                      placeholder="e.g. Back glass scratched, camera lens OK"
                      value={formData.physicalCondition}
                      onChange={e => setFormData({ ...formData, physicalCondition: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Service & Fault */}
              <div className="space-y-3 pt-3 border-t border-slate-800/80">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5" /> Fault & Diagnostic
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Reported Issue / Fault *</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="e.g. Screen cracked, touch unresponsive, battery drains rapidly"
                      value={formData.reportedFault}
                      onChange={e => setFormData({ ...formData, reportedFault: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Technician Diagnostic Notes</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Requires full screen assembly replacement and adhesive gasket."
                      value={formData.diagnosis}
                      onChange={e => setFormData({ ...formData, diagnosis: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Assignment & Financials */}
              <div className="space-y-3 pt-3 border-t border-slate-800/80">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" /> Technician & Estimation
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Assigned Technician</label>
                    <select
                      value={formData.assignedTechnician}
                      onChange={e => setFormData({ ...formData, assignedTechnician: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="Suresh Kumar (Senior Specialist)">Suresh Kumar (Senior Specialist)</option>
                      <option value="Amit Verma (Battery & IC)">Amit Verma (Battery & IC)</option>
                      <option value="Vikash Tech (Display)">Vikash Tech (Display)</option>
                      <option value="Unassigned">Unassigned</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Estimated Cost ({settings.currencySymbol})</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.estimatedCost}
                      onChange={e => setFormData({ ...formData, estimatedCost: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Advance Deposit ({settings.currencySymbol})</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.advancePaid}
                      onChange={e => setFormData({ ...formData, advancePaid: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 focus:outline-none focus:border-indigo-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Target Delivery Date</label>
                    <input
                      type="date"
                      value={formData.promisedDate}
                      onChange={e => setFormData({ ...formData, promisedDate: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Warranty (Days)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.warrantyDays}
                      onChange={e => setFormData({ ...formData, warrantyDays: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit / Action Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3 sticky bottom-0 bg-slate-900 pb-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Job Card & Print Slip</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW DETAILED JOB CARD */}
      {selectedJobCardForView && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setSelectedJobCardForView(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-lg">{selectedJobCardForView.jobCardNumber}</h3>
                <p className="text-xs text-slate-400">Created on {selectedJobCardForView.createdDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-500 block">Customer</span>
                <span className="font-bold text-white text-sm">{selectedJobCardForView.customerName}</span>
                <span className="text-slate-400 block">{selectedJobCardForView.customerPhone}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Device</span>
                <span className="font-bold text-indigo-300 text-sm">{selectedJobCardForView.deviceBrand} {selectedJobCardForView.deviceModel}</span>
                <span className="text-slate-400 block font-mono">IMEI: {selectedJobCardForView.imeiOrSerial}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-800/40 p-3 rounded-xl">
                <span className="text-indigo-400 font-bold block mb-1">Reported Fault</span>
                <p className="text-slate-200">{selectedJobCardForView.reportedFault}</p>
              </div>

              {selectedJobCardForView.diagnosis && (
                <div className="bg-slate-800/40 p-3 rounded-xl">
                  <span className="text-cyan-400 font-bold block mb-1">Diagnostic Notes</span>
                  <p className="text-slate-300">{selectedJobCardForView.diagnosis}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="bg-slate-950 p-2.5 rounded-xl text-center border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Estimated Cost</span>
                  <span className="font-extrabold text-white text-sm">{settings.currencySymbol}{selectedJobCardForView.estimatedCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl text-center border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Advance Deposit</span>
                  <span className="font-extrabold text-emerald-400 text-sm">{settings.currencySymbol}{selectedJobCardForView.advancePaid.toLocaleString('en-IN')}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl text-center border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Balance Owed</span>
                  <span className={`font-extrabold text-sm ${selectedJobCardForView.balanceDue > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {settings.currencySymbol}{selectedJobCardForView.balanceDue.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setSelectedJobCardForPdf(selectedJobCardForView);
                  setSelectedJobCardForView(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download PDF Invoice
              </button>
              <button
                onClick={() => {
                  setSelectedJobCardForPrint(selectedJobCardForView);
                  setSelectedJobCardForView(null);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print Job Slip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PRINTABLE PHYSICAL REPAIR JOB CARD RECEIPT */}
      {selectedJobCardForPrint && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-xl p-8 shadow-2xl space-y-6 relative border border-slate-200">
            {/* Close / Print / PDF buttons top right */}
            <div className="no-print absolute right-4 top-4 flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedJobCardForPdf(selectedJobCardForPrint);
                  setSelectedJobCardForPrint(null);
                }}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 flex items-center gap-1.5 shadow transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> PDF Invoice
              </button>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 flex items-center gap-1.5 shadow transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
              <button
                onClick={() => setSelectedJobCardForPrint(null)}
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Shop Header */}
            <div className="text-center border-b pb-4 space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">{settings.shopName}</h2>
              <p className="text-xs text-slate-600 font-medium">{settings.tagline}</p>
              <p className="text-[11px] text-slate-500">{settings.address} | Tel: {settings.phone}</p>
              {settings.gstNumber && (
                <p className="text-[10px] text-slate-400 font-mono">GSTIN: {settings.gstNumber}</p>
              )}
            </div>

            {/* Slip Title & Barcode Placeholder */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Official Repair Job Slip</span>
                <span className="text-lg font-black font-mono text-slate-900">{selectedJobCardForPrint.jobCardNumber}</span>
              </div>
              <div className="text-right text-[11px]">
                <div><span className="text-slate-500">Date:</span> <strong>{selectedJobCardForPrint.createdDate}</strong></div>
                <div><span className="text-slate-500">Target Delivery:</span> <strong>{selectedJobCardForPrint.promisedDate}</strong></div>
              </div>
            </div>

            {/* Customer & Device Information */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Customer Details</span>
                <div className="font-bold text-slate-900 text-sm">{selectedJobCardForPrint.customerName}</div>
                <div className="text-slate-700">{selectedJobCardForPrint.customerPhone}</div>
              </div>
              <div className="space-y-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Device Specification</span>
                <div className="font-bold text-slate-900 text-sm">{selectedJobCardForPrint.deviceBrand} {selectedJobCardForPrint.deviceModel}</div>
                <div className="font-mono text-slate-600 text-[11px]">IMEI: {selectedJobCardForPrint.imeiOrSerial}</div>
              </div>
            </div>

            {/* Reported Fault */}
            <div className="space-y-1 text-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Reported Issue / Physical Condition</span>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800">
                <p><strong>Fault:</strong> {selectedJobCardForPrint.reportedFault}</p>
                <p className="text-[11px] text-slate-600 mt-1"><strong>Condition on Receipt:</strong> {selectedJobCardForPrint.physicalCondition}</p>
              </div>
            </div>

            {/* Financial Summary Table */}
            <table className="w-full text-xs text-left border-t border-b border-slate-200">
              <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase">
                <tr>
                  <th className="py-2 px-2">Assigned Tech</th>
                  <th className="py-2 px-2 text-right">Estimate</th>
                  <th className="py-2 px-2 text-right">Advance Paid</th>
                  <th className="py-2 px-2 text-right">Balance Owed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                <tr>
                  <td className="py-2.5 px-2">{selectedJobCardForPrint.assignedTechnician}</td>
                  <td className="py-2.5 px-2 text-right font-bold">{settings.currencySymbol}{selectedJobCardForPrint.estimatedCost.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-2 text-right text-emerald-600 font-bold">{settings.currencySymbol}{selectedJobCardForPrint.advancePaid.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-2 text-right text-rose-600 font-bold">{settings.currencySymbol}{selectedJobCardForPrint.balanceDue.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>

            {/* Warranty & Terms */}
            <div className="text-[10px] text-slate-500 space-y-1 border-t pt-3">
              <p className="font-bold text-slate-700">Service Terms & Warranty Conditions:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Repair warranty covers replaced hardware parts for <strong>{selectedJobCardForPrint.warrantyDays} days</strong> against manufacturing defects.</li>
                <li>Water damage or accidental liquid exposure voids all service warranties.</li>
                <li>Please present this Job Card slip upon collecting your device. Unclaimed items after 30 days may incur storage fees.</li>
              </ul>
            </div>

            {/* Signature Lines */}
            <div className="pt-6 flex items-center justify-between text-xs text-slate-600 border-t border-dashed">
              <div>
                <div className="w-32 border-b border-slate-400 mb-1"></div>
                <span>Customer Signature</span>
              </div>
              <div className="text-right">
                <div className="w-32 border-b border-slate-400 mb-1 ml-auto"></div>
                <span>Authorized Store Stamp</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF REPAIR SERVICE INVOICE MODAL */}
      {selectedJobCardForPdf && (
        <PdfInvoiceModal
          type="repair"
          data={selectedJobCardForPdf}
          settings={settings}
          onClose={() => setSelectedJobCardForPdf(null)}
        />
      )}
    </div>
  );
};
