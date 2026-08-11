import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SaleTransaction, RepairJobCard, ShopSettings } from '../../types';
import {
  Printer,
  Download,
  X,
  Smartphone,
  ShieldCheck,
  QrCode,
  CheckCircle2,
  AlertCircle,
  FileText,
  Wrench,
  Copy,
  Check,
  Building2,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Sparkles
} from 'lucide-react';

export interface PdfInvoiceModalProps {
  type: 'sale' | 'repair';
  data: SaleTransaction | RepairJobCard;
  settings: ShopSettings;
  onClose: () => void;
}

export const PdfInvoiceModal: React.FC<PdfInvoiceModalProps> = ({
  type,
  data,
  settings,
  onClose
}) => {
  const [templateFormat, setTemplateFormat] = useState<'a4' | 'thermal'>('a4');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [customNotes, setCustomNotes] = useState(
    type === 'sale'
      ? (data as SaleTransaction).notes || ''
      : (data as RepairJobCard).notes || ''
  );

  const printAreaRef = useRef<HTMLDivElement>(null);

  const currency = settings.currencySymbol || '₹';
  const isSale = type === 'sale';
  const saleData = isSale ? (data as SaleTransaction) : null;
  const repairData = !isSale ? (data as RepairJobCard) : null;

  const invoiceNumber = isSale
    ? saleData!.invoiceNumber
    : repairData!.jobCardNumber;

  const documentTitle = isSale
    ? 'RETAIL TAX INVOICE'
    : 'REPAIR SERVICE INVOICE & JOB CARD';

  const customerName = isSale ? saleData!.customerName : repairData!.customerName;
  const customerPhone = isSale ? saleData!.customerPhone : repairData!.customerPhone;
  const customerEmail = !isSale && repairData?.customerEmail ? repairData.customerEmail : '';
  
  const issueDate = isSale
    ? saleData!.timestamp
    : repairData!.createdDate;

  // Total calculations
  const totalAmount = isSale
    ? saleData!.totalAmount
    : (repairData!.finalCost || repairData!.estimatedCost);

  const paidAmount = isSale
    ? saleData!.paidAmount
    : repairData!.advancePaid;

  const balanceAmount = isSale
    ? saleData!.balanceAmount
    : repairData!.balanceDue;

  const paymentMethod = isSale
    ? saleData!.paymentMethod
    : repairData!.paymentStatus;

  // Handles client-side PDF download using jsPDF and html2canvas
  const handleDownloadPdf = async () => {
    if (!printAreaRef.current) return;
    setIsGeneratingPdf(true);

    try {
      const element = printAreaRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution for crisp text
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: templateFormat === 'a4' ? 'a4' : [80, 210]
      });

      if (templateFormat === 'a4') {
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
      } else {
        // Thermal roll 80mm format
        const imgWidth = 80;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      }

      const fileName = `${isSale ? 'Tax_Invoice' : 'Repair_Invoice'}_${invoiceNumber.replace(/[^a-zA-Z0-9-]/g, '_')}_${customerName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('An error occurred while generating the PDF invoice.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const summary = `🧾 *${settings.shopName} - Invoice*
Invoice No: ${invoiceNumber}
Customer: ${customerName} (${customerPhone})
Total Amount: ${currency}${totalAmount.toLocaleString()}
Paid: ${currency}${paidAmount.toLocaleString()}
Balance: ${currency}${balanceAmount.toLocaleString()}
Date: ${issueDate}
Thank you for shopping with us!`;

    navigator.clipboard.writeText(summary);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div id="pdf-invoice-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl my-auto p-4 sm:p-6 text-slate-100 space-y-5">
        
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800 no-print">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isSale ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-400'}`}>
              {isSale ? <FileText className="w-6 h-6" /> : <Wrench className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>{documentTitle}</span>
                <span className="text-xs font-mono font-bold bg-slate-800 text-indigo-300 border border-slate-700 px-2 py-0.5 rounded-md">
                  {invoiceNumber}
                </span>
              </h3>
              <p className="text-xs text-slate-400">Pushed from store transaction history • {issueDate}</p>
            </div>
          </div>

          {/* Format Selector & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Format toggle */}
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
              <button
                onClick={() => setTemplateFormat('a4')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  templateFormat === 'a4'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                A4 Tax Sheet
              </button>
              <button
                onClick={() => setTemplateFormat('thermal')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  templateFormat === 'thermal'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                80mm Thermal Slip
              </button>
            </div>

            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-md shadow-indigo-600/20 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>

            {/* Share / Copy Summary */}
            <button
              onClick={handleCopySummary}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold p-2 rounded-xl border border-slate-700 transition cursor-pointer"
              title="Copy invoice details to clipboard"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Canvas & Document Sheet */}
        <div className="max-h-[70vh] overflow-y-auto pr-1 no-scrollbar bg-slate-950/50 p-3 sm:p-6 rounded-2xl border border-slate-800 flex justify-center">
          
          <div
            id="printable-pdf-document"
            ref={printAreaRef}
            className={`bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 text-xs font-sans space-y-4 transition-all ${
              templateFormat === 'a4'
                ? 'w-full max-w-[210mm] p-6 sm:p-8 min-h-[297mm]'
                : 'w-full max-w-[80mm] p-4 min-h-[180mm]'
            }`}
            style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
          >
            {/* Header: Shop Branding & Invoice Title */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b-2 border-slate-900 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-black text-xl text-slate-900 tracking-tight">
                  <Smartphone className="w-6 h-6 text-indigo-600 shrink-0" />
                  <span>{settings.shopName}</span>
                </div>
                <p className="text-xs text-slate-600 font-medium">{settings.tagline}</p>
                <p className="text-[11px] text-slate-500 leading-tight max-w-xs">{settings.address}</p>
                <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-slate-600 pt-1 font-medium">
                  <span>Ph: {settings.phone}</span>
                  {settings.email && <span>• {settings.email}</span>}
                  {settings.gstNumber && (
                    <span className="font-bold text-slate-800">GSTIN: {settings.gstNumber}</span>
                  )}
                </div>
              </div>

              <div className="text-left sm:text-right space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200 min-w-[200px]">
                <span className="text-[10px] font-black tracking-wider text-indigo-700 uppercase block">
                  {documentTitle}
                </span>
                <div className="font-mono font-black text-base text-slate-900">{invoiceNumber}</div>
                <div className="text-[11px] text-slate-600 font-medium">Date: <strong>{issueDate}</strong></div>
                {repairData?.promisedDate && (
                  <div className="text-[11px] text-slate-600 font-medium">Delivery: <strong>{repairData.promisedDate}</strong></div>
                )}
                <div className="text-[10px] text-slate-500 mt-1 font-semibold">
                  Billed By: {isSale ? saleData!.salesByStaff || 'POS Desk' : repairData!.assignedTechnician}
                </div>
              </div>
            </div>

            {/* Customer Details Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Customer Billing Information
                </span>
                <div className="font-bold text-sm text-slate-900">{customerName}</div>
                <div className="text-slate-700 font-medium flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{customerPhone}</span>
                </div>
                {customerEmail && (
                  <div className="text-slate-600 flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{customerEmail}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1 text-left sm:text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Payment Status & Details
                </span>
                <div className="flex items-center sm:justify-end gap-1.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                    balanceAmount <= 0
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border-rose-300'
                  }`}>
                    {balanceAmount <= 0 ? 'PAID IN FULL' : `BALANCE DUE: ${currency}${balanceAmount.toLocaleString()}`}
                  </span>
                </div>
                <div className="text-slate-600 text-[11px] font-medium pt-1">
                  Method: <strong>{paymentMethod}</strong>
                </div>
              </div>
            </div>

            {/* Table Breakdown */}
            {isSale ? (
              /* SALES ITEMS TABLE */
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-y-2 border-slate-300">
                    <th className="py-2 px-2">#</th>
                    <th className="py-2 px-2">Item Description</th>
                    <th className="py-2 px-2 text-center">Qty</th>
                    <th className="py-2 px-2 text-right">Unit Price</th>
                    <th className="py-2 px-2 text-right">Discount</th>
                    <th className="py-2 px-2 text-right">Net Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {saleData!.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-2 font-mono text-slate-500 text-[11px]">{idx + 1}</td>
                      <td className="py-2.5 px-2">
                        <div className="font-bold text-slate-900">{item.brand} {item.productName}</div>
                        {item.ramStorage || item.color ? (
                          <div className="text-[11px] text-slate-500">{item.color} • {item.ramStorage}</div>
                        ) : null}
                        {item.imei && (
                          <div className="text-[10px] font-mono text-indigo-700 font-bold bg-indigo-50 inline-block px-1.5 py-0.5 rounded border border-indigo-200 mt-0.5">
                            IMEI / Serial #: {item.imei}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-slate-800">{item.quantity}</td>
                      <td className="py-2.5 px-2 text-right text-slate-700">{currency}{item.unitPrice.toLocaleString()}</td>
                      <td className="py-2.5 px-2 text-right text-emerald-600">{currency}{item.discount.toLocaleString()}</td>
                      <td className="py-2.5 px-2 text-right font-extrabold text-slate-900">
                        {currency}{((item.unitPrice * item.quantity) - item.discount).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              /* REPAIR SERVICE BREAKDOWN TABLE */
              <div className="space-y-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-700">Device Under Repair:</span>
                    <span className="font-extrabold text-indigo-900 text-sm">{repairData!.deviceBrand} {repairData!.deviceModel}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div><span className="text-slate-500">IMEI / Serial #:</span> <strong className="font-mono">{repairData!.imeiOrSerial}</strong></div>
                    <div><span className="text-slate-500">Passcode / Pattern:</span> <strong className="font-mono">{repairData!.passcode || 'N/A'}</strong></div>
                  </div>
                  <div className="text-[11px] pt-1">
                    <span className="text-slate-500 block">Reported Fault:</span>
                    <span className="font-medium text-slate-800">{repairData!.reportedFault}</span>
                  </div>
                  {repairData!.diagnosis && (
                    <div className="text-[11px]">
                      <span className="text-slate-500 block">Technician Diagnosis:</span>
                      <span className="font-medium text-slate-800">{repairData!.diagnosis}</span>
                    </div>
                  )}
                </div>

                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-y-2 border-slate-300">
                      <th className="py-2 px-2">Service Line / Spare Part Particulars</th>
                      <th className="py-2 px-2 text-right">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-2.5 px-2">
                        <div className="font-bold text-slate-900">Hardware Inspection & Repair Service Charge</div>
                        <div className="text-[11px] text-slate-500">Includes technician diagnostic fee, disassembly & labor</div>
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold text-slate-900">
                        {currency}{(repairData!.finalCost || repairData!.estimatedCost).toLocaleString()}
                      </td>
                    </tr>
                    {repairData!.sparePartsUsed && repairData!.sparePartsUsed.length > 0 && (
                      repairData!.sparePartsUsed.map((part, pIdx) => (
                        <tr key={pIdx}>
                          <td className="py-2 px-2 text-slate-700">
                            <span>Spare Part: {part.partName}</span>
                          </td>
                          <td className="py-2 px-2 text-right font-medium text-slate-700">
                            {currency}{part.sellingPrice.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Summary & Totals Calculation */}
            <div className="pt-3 border-t-2 border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Payment Notes & Terms */}
              <div className="space-y-2 text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>
                    Warranty: {isSale ? `${saleData!.warrantyPeriodMonths || settings.defaultWarrantyMonths || 6} Months Official Warranty` : `${repairData!.warrantyDays || 30} Days Service Warranty`}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  {settings.receiptFooterMessage || 'Goods once sold are covered under shop warranty. Please retain this original tax invoice for warranty claims.'}
                </p>

                {customNotes && (
                  <div className="bg-amber-50 p-2 rounded border border-amber-200 text-amber-900 text-[10px]">
                    <strong>Note:</strong> {customNotes}
                  </div>
                )}
              </div>

              {/* Math Totals */}
              <div className="space-y-1.5 text-xs text-right bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Amount:</span>
                  <span className="font-semibold">{currency}{(isSale ? saleData!.subtotal : (repairData!.finalCost || repairData!.estimatedCost)).toLocaleString()}</span>
                </div>

                {isSale && saleData!.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount Applied:</span>
                    <span>- {currency}{saleData!.discountAmount.toLocaleString()}</span>
                  </div>
                )}

                {isSale && saleData!.tradeInCreditApplied > 0 && (
                  <div className="flex justify-between text-cyan-600 font-medium">
                    <span>Trade-in Exchange Credit:</span>
                    <span>- {currency}{saleData!.tradeInCreditApplied.toLocaleString()}</span>
                  </div>
                )}

                {isSale && saleData!.taxAmount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>GST ({settings.taxRatePercent}% Tax):</span>
                    <span className="font-semibold">{currency}{saleData!.taxAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-300">
                  <span>Grand Total:</span>
                  <span>{currency}{totalAmount.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-slate-700 font-bold pt-1">
                  <span>Amount Paid:</span>
                  <span className="text-emerald-700">{currency}{paidAmount.toLocaleString()}</span>
                </div>

                {balanceAmount > 0 && (
                  <div className="flex justify-between text-rose-700 font-black bg-rose-50 p-1.5 rounded border border-rose-200">
                    <span>Balance Owed:</span>
                    <span>{currency}{balanceAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Signature & Verification Barcode */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between gap-4 text-[11px] text-slate-600">
              <div className="space-y-1">
                <div className="w-32 border-b border-slate-400"></div>
                <div className="text-[10px] text-slate-500 font-medium">Customer Signature</div>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-slate-100 p-1 rounded border border-slate-300 flex items-center justify-center">
                  <QrCode className="w-full h-full text-slate-800" />
                </div>
                <span className="text-[9px] text-slate-400 block mt-0.5">Scan to Verify Invoice</span>
              </div>

              <div className="text-right space-y-1">
                <div className="w-36 border-b border-slate-400 ml-auto"></div>
                <div className="text-[10px] font-bold text-slate-800">
                  For {settings.shopName}
                </div>
                <div className="text-[9px] text-slate-400">
                  {settings.authorizedSignatoryName || 'Authorized Signatory'}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between pt-2 text-xs text-slate-400 no-print">
          <p>This invoice is pulled directly from the transaction history database.</p>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
          >
            Close Invoice
          </button>
        </div>

      </div>
    </div>
  );
};
