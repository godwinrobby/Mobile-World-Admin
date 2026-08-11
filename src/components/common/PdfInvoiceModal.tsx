import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SaleTransaction, RepairJobCard, PurchaseOrder, ShopSettings } from '../../types';
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
  Sparkles,
  ShoppingBag
} from 'lucide-react';

export interface PdfInvoiceModalProps {
  type: 'sale' | 'repair' | 'purchase';
  data: SaleTransaction | RepairJobCard | PurchaseOrder;
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
      : type === 'repair'
      ? (data as RepairJobCard).notes || ''
      : (data as PurchaseOrder).notes || ''
  );

  const printAreaRef = useRef<HTMLDivElement>(null);

  const currency = settings.currencySymbol || '₹';
  const isSale = type === 'sale';
  const isRepair = type === 'repair';
  const isPurchase = type === 'purchase';

  const saleData = isSale ? (data as SaleTransaction) : null;
  const repairData = isRepair ? (data as RepairJobCard) : null;
  const purchaseData = isPurchase ? (data as PurchaseOrder) : null;

  const invoiceNumber = isSale
    ? saleData!.invoiceNumber
    : isRepair
    ? repairData!.jobCardNumber
    : purchaseData!.poNumber;

  const customHeaderTitle = settings.invoiceHeaderTitle || 'RETAIL TAX INVOICE';
  const documentTitle = isSale
    ? customHeaderTitle
    : isRepair
    ? 'REPAIR SERVICE INVOICE & JOB CARD'
    : 'PURCHASE ORDER VOUCHER & INWARD INVOICE';

  const themeColor = settings.invoiceThemeColor || '#4f46e5';
  const showLogo = settings.showShopLogoOnInvoice !== false && Boolean(settings.logoUrl);
  const showQr = settings.showQrCodeOnInvoice !== false;

  const customerName = isSale
    ? saleData!.customerName
    : isRepair
    ? repairData!.customerName
    : purchaseData!.partyName;

  const customerPhone = isSale
    ? saleData!.customerPhone
    : isRepair
    ? repairData!.customerPhone
    : purchaseData!.partyPhone;

  const customerEmail = isRepair && repairData?.customerEmail
    ? repairData.customerEmail
    : isPurchase && purchaseData?.partyEmail
    ? purchaseData.partyEmail
    : '';
  
  const issueDate = isSale
    ? saleData!.timestamp
    : isRepair
    ? repairData!.createdDate
    : purchaseData!.orderDate;

  // Total calculations
  const totalAmount = isSale
    ? saleData!.totalAmount
    : isRepair
    ? (repairData!.finalCost || repairData!.estimatedCost)
    : purchaseData!.totalAmount;

  const paidAmount = isSale
    ? saleData!.paidAmount
    : isRepair
    ? repairData!.advancePaid
    : purchaseData!.paidAmount;

  const balanceAmount = isSale
    ? saleData!.balanceAmount
    : isRepair
    ? repairData!.balanceDue
    : purchaseData!.balanceAmount;

  const paymentMethod = isSale
    ? saleData!.paymentMethod
    : isRepair
    ? repairData!.paymentStatus
    : purchaseData!.paymentStatus;

  // Helper to replace unsupported oklch color functions for html2canvas
  const oklchToRgbStr = (oklchStr: string): string => {
    if (!oklchStr || typeof oklchStr !== 'string') return oklchStr;

    return oklchStr.replace(/oklch\(\s*([\d.%]+)\s+([\d.%]+)\s+([\d.]+)(?:\s*\/\s*([\d.%]+))?\s*\)/gi, (fullMatch, lRaw, cRaw, hRaw, aRaw) => {
      try {
        let l = parseFloat(lRaw);
        if (lRaw.endsWith('%')) l = l / 100;

        let c = parseFloat(cRaw);
        if (cRaw.endsWith('%')) c = c / 100;

        let h = parseFloat(hRaw);

        let alpha = 1;
        if (aRaw) {
          alpha = parseFloat(aRaw);
          if (aRaw.endsWith('%')) alpha = alpha / 100;
        }

        // OKLCH -> OKLAB
        const hRad = (h * Math.PI) / 180;
        const aComp = c * Math.cos(hRad);
        const bComp = c * Math.sin(hRad);

        // OKLAB -> LMS
        const l_ = l + 0.3963377774 * aComp + 0.2158037573 * bComp;
        const m_ = l - 0.1055613458 * aComp - 0.0638541728 * bComp;
        const s_ = l - 0.0894841775 * aComp - 1.2914855480 * bComp;

        const l3 = l_ * l_ * l_;
        const m3 = m_ * m_ * m_;
        const s3 = s_ * s_ * s_;

        // LMS -> Linear sRGB
        const rLin = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
        const gLin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
        const bLin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

        const gamma = (val: number) => {
          val = Math.max(0, Math.min(1, val));
          return val <= 0.0031308 ? 12.92 * val : 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
        };

        const r = Math.round(gamma(rLin) * 255);
        const g = Math.round(gamma(gLin) * 255);
        const bVal = Math.round(gamma(bLin) * 255);

        if (alpha < 1) {
          return `rgba(${r}, ${g}, ${bVal}, ${alpha})`;
        }
        return `rgb(${r}, ${g}, ${bVal})`;
      } catch {
        return '#ffffff';
      }
    });
  };

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
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // 1. Process and sanitize all <style> elements in cloned document
          const styleTags = clonedDoc.querySelectorAll('style');
          styleTags.forEach((styleTag) => {
            if (styleTag.textContent && styleTag.textContent.includes('oklch')) {
              styleTag.textContent = oklchToRgbStr(styleTag.textContent);
            }
          });

          // 2. Process all element inline styles & custom properties
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((node) => {
            const el = node as HTMLElement;
            if (!el.style) return;

            if (el.style.cssText && el.style.cssText.includes('oklch')) {
              el.style.cssText = oklchToRgbStr(el.style.cssText);
            }

            for (let i = 0; i < el.style.length; i++) {
              const propName = el.style[i];
              if (propName.startsWith('--')) {
                const propVal = el.style.getPropertyValue(propName);
                if (propVal && propVal.includes('oklch')) {
                  el.style.setProperty(propName, oklchToRgbStr(propVal));
                }
              }
            }
          });
        }
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b-2 gap-4" style={{ borderBottomColor: themeColor }}>
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-black text-xl tracking-tight" style={{ color: '#0f172a' }}>
                  {showLogo ? (
                    <img src={settings.logoUrl} alt="Store Logo" className="w-8 h-8 object-contain rounded border p-0.5 shrink-0" />
                  ) : (
                    <Smartphone className="w-6 h-6 shrink-0" style={{ color: themeColor }} />
                  )}
                  <span>{settings.shopName}</span>
                </div>
                <p className="text-xs font-medium" style={{ color: '#475569' }}>{settings.tagline}</p>
                <p className="text-[11px] leading-tight max-w-xs" style={{ color: '#64748b' }}>{settings.address}</p>
                {settings.invoiceHeaderNote && (
                  <p className="text-[11px] font-semibold italic pt-0.5" style={{ color: themeColor }}>{settings.invoiceHeaderNote}</p>
                )}
                <div className="flex flex-wrap items-center gap-x-3 text-[11px] pt-1 font-medium" style={{ color: '#475569' }}>
                  <span>Ph: {settings.phone}</span>
                  {settings.email && <span>• {settings.email}</span>}
                  {settings.gstNumber && (
                    <span className="font-bold" style={{ color: '#1e293b' }}>GSTIN: {settings.gstNumber}</span>
                  )}
                </div>
              </div>

              <div className="text-left sm:text-right space-y-1 p-3 rounded-xl border min-w-[200px]" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#0f172a' }}>
                <span className="text-[10px] font-black tracking-wider uppercase block" style={{ color: themeColor }}>
                  {documentTitle}
                </span>
                <div className="font-mono font-black text-base" style={{ color: '#0f172a' }}>{invoiceNumber}</div>
                <div className="text-[11px] font-medium" style={{ color: '#475569' }}>Date: <strong>{issueDate}</strong></div>
                {repairData?.promisedDate && (
                  <div className="text-[11px] font-medium" style={{ color: '#475569' }}>Delivery: <strong>{repairData.promisedDate}</strong></div>
                )}
                <div className="text-[10px] mt-1 font-semibold" style={{ color: '#64748b' }}>
                  Billed By: {isSale ? saleData!.salesByStaff || 'POS Desk' : repairData!.assignedTechnician}
                </div>
              </div>
            </div>

            {/* Customer Details Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-xl border" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#0f172a' }}>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: '#64748b' }}>
                  Customer Billing Information
                </span>
                <div className="font-bold text-sm" style={{ color: '#0f172a' }}>{customerName}</div>
                <div className="font-medium flex items-center gap-1.5" style={{ color: '#334155' }}>
                  <Phone className="w-3 h-3" style={{ color: '#94a3b8' }} />
                  <span>{customerPhone}</span>
                </div>
                {customerEmail && (
                  <div className="flex items-center gap-1.5" style={{ color: '#475569' }}>
                    <Mail className="w-3 h-3" style={{ color: '#94a3b8' }} />
                    <span>{customerEmail}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1 text-left sm:text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: '#64748b' }}>
                  Payment Status & Details
                </span>
                <div className="flex items-center sm:justify-end gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border" style={{
                    backgroundColor: balanceAmount <= 0 ? '#d1fae5' : '#ffe4e6',
                    color: balanceAmount <= 0 ? '#065f46' : '#9f1239',
                    borderColor: balanceAmount <= 0 ? '#a7f3d0' : '#fecdd3'
                  }}>
                    {balanceAmount <= 0 ? 'PAID IN FULL' : `BALANCE DUE: ${currency}${balanceAmount.toLocaleString()}`}
                  </span>
                </div>
                <div className="text-[11px] font-medium pt-1" style={{ color: '#475569' }}>
                  Method: <strong>{paymentMethod}</strong>
                </div>
              </div>
            </div>

            {/* Table Breakdown */}
            {isSale ? (
              /* SALES ITEMS TABLE */
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="uppercase text-[10px] font-bold border-y-2" style={{ backgroundColor: '#f1f5f9', color: '#334155', borderColor: '#cbd5e1' }}>
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
                    <tr key={idx} style={{ borderBottomColor: '#e2e8f0' }}>
                      <td className="py-2.5 px-2 font-mono text-[11px]" style={{ color: '#64748b' }}>{idx + 1}</td>
                      <td className="py-2.5 px-2">
                        <div className="font-bold" style={{ color: '#0f172a' }}>{item.brand} {item.productName}</div>
                        {item.ramStorage || item.color ? (
                          <div className="text-[11px]" style={{ color: '#64748b' }}>{item.color} • {item.ramStorage}</div>
                        ) : null}
                        {item.imei && (
                          <div className="text-[10px] font-mono font-bold inline-block px-1.5 py-0.5 rounded border mt-0.5" style={{ backgroundColor: '#e0e7ff', color: '#3730a3', borderColor: '#c7d2fe' }}>
                            IMEI / Serial #: {item.imei}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold" style={{ color: '#1e293b' }}>{item.quantity}</td>
                      <td className="py-2.5 px-2 text-right" style={{ color: '#334155' }}>{currency}{item.unitPrice.toLocaleString()}</td>
                      <td className="py-2.5 px-2 text-right font-medium" style={{ color: '#059669' }}>{currency}{item.discount.toLocaleString()}</td>
                      <td className="py-2.5 px-2 text-right font-extrabold" style={{ color: '#0f172a' }}>
                        {currency}{((item.unitPrice * item.quantity) - item.discount).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : isPurchase ? (
              /* PURCHASE ORDER ITEMS TABLE */
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="uppercase text-[10px] font-bold border-y-2" style={{ backgroundColor: '#f1f5f9', color: '#334155', borderColor: '#cbd5e1' }}>
                    <th className="py-2 px-2">#</th>
                    <th className="py-2 px-2">Product Particulars / IMEIs</th>
                    <th className="py-2 px-2 text-center">Qty</th>
                    <th className="py-2 px-2 text-right">Unit Cost</th>
                    <th className="py-2 px-2 text-right">Total Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {purchaseData!.items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottomColor: '#e2e8f0' }}>
                      <td className="py-2.5 px-2 font-mono text-[11px]" style={{ color: '#64748b' }}>{idx + 1}</td>
                      <td className="py-2.5 px-2">
                        <div className="font-bold" style={{ color: '#0f172a' }}>{item.productName}</div>
                        {item.imeiNumbers && item.imeiNumbers.length > 0 && (
                          <div className="text-[10px] font-mono font-bold inline-block px-1.5 py-0.5 rounded border mt-0.5" style={{ backgroundColor: '#e0e7ff', color: '#3730a3', borderColor: '#c7d2fe' }}>
                            IMEIs: {item.imeiNumbers.join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold" style={{ color: '#1e293b' }}>{item.quantity}</td>
                      <td className="py-2.5 px-2 text-right" style={{ color: '#334155' }}>{currency}{item.unitCostPrice.toLocaleString()}</td>
                      <td className="py-2.5 px-2 text-right font-extrabold" style={{ color: '#0f172a' }}>
                        {currency}{item.totalCost.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              /* REPAIR SERVICE BREAKDOWN TABLE */
              <div className="space-y-3">
                <div className="p-3 rounded-xl border space-y-2" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#0f172a' }}>
                  <div className="flex items-center justify-between text-xs border-b pb-2" style={{ borderBottomColor: '#cbd5e1' }}>
                    <span className="font-bold" style={{ color: '#334155' }}>Device Under Repair:</span>
                    <span className="font-extrabold text-sm" style={{ color: '#312e81' }}>{repairData!.deviceBrand} {repairData!.deviceModel}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div><span style={{ color: '#64748b' }}>IMEI / Serial #:</span> <strong className="font-mono" style={{ color: '#0f172a' }}>{repairData!.imeiOrSerial}</strong></div>
                    <div><span style={{ color: '#64748b' }}>Passcode / Pattern:</span> <strong className="font-mono" style={{ color: '#0f172a' }}>{repairData!.passcode || 'N/A'}</strong></div>
                  </div>
                  <div className="text-[11px] pt-1">
                    <span className="block" style={{ color: '#64748b' }}>Reported Fault:</span>
                    <span className="font-medium" style={{ color: '#1e293b' }}>{repairData!.reportedFault}</span>
                  </div>
                  {repairData!.diagnosis && (
                    <div className="text-[11px]">
                      <span className="block" style={{ color: '#64748b' }}>Technician Diagnosis:</span>
                      <span className="font-medium" style={{ color: '#1e293b' }}>{repairData!.diagnosis}</span>
                    </div>
                  )}
                </div>

                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="uppercase text-[10px] font-bold border-y-2" style={{ backgroundColor: '#f1f5f9', color: '#334155', borderColor: '#cbd5e1' }}>
                      <th className="py-2 px-2">Service Line / Spare Part Particulars</th>
                      <th className="py-2 px-2 text-right">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr style={{ borderBottomColor: '#e2e8f0' }}>
                      <td className="py-2.5 px-2">
                        <div className="font-bold" style={{ color: '#0f172a' }}>Hardware Inspection & Repair Service Charge</div>
                        <div className="text-[11px]" style={{ color: '#64748b' }}>Includes technician diagnostic fee, disassembly & labor</div>
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold" style={{ color: '#0f172a' }}>
                        {currency}{(repairData!.finalCost || repairData!.estimatedCost).toLocaleString()}
                      </td>
                    </tr>
                    {repairData!.sparePartsUsed && repairData!.sparePartsUsed.length > 0 && (
                      repairData!.sparePartsUsed.map((part, pIdx) => (
                        <tr key={pIdx} style={{ borderBottomColor: '#e2e8f0' }}>
                          <td className="py-2 px-2" style={{ color: '#334155' }}>
                            <span>Spare Part: {part.partName}</span>
                          </td>
                          <td className="py-2 px-2 text-right font-medium" style={{ color: '#334155' }}>
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
            <div className="pt-3 border-t-2 grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ borderTopColor: '#cbd5e1' }}>
              
              {/* Payment Notes & Terms */}
              <div className="space-y-2 text-[11px]" style={{ color: '#475569' }}>
                <div className="flex items-center gap-1.5 font-bold" style={{ color: '#1e293b' }}>
                  <ShieldCheck className="w-4 h-4" style={{ color: '#4338ca' }} />
                  <span>
                    Warranty: {isSale ? `${saleData!.warrantyPeriodMonths || settings.defaultWarrantyMonths || 6} Months Official Warranty` : `${repairData!.warrantyDays || 30} Days Service Warranty`}
                  </span>
                </div>
                <p className="text-[10px] leading-tight" style={{ color: '#64748b' }}>
                  {settings.receiptFooterMessage || 'Goods once sold are covered under shop warranty. Please retain this original tax invoice for warranty claims.'}
                </p>

                {customNotes && (
                  <div className="p-2 rounded border text-[10px]" style={{ backgroundColor: '#fffbeb', color: '#78350f', borderColor: '#fde68a' }}>
                    <strong>Note:</strong> {customNotes}
                  </div>
                )}
              </div>

              {/* Math Totals */}
              <div className="space-y-1.5 text-xs text-right p-3 rounded-xl border" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#0f172a' }}>
                <div className="flex justify-between" style={{ color: '#475569' }}>
                  <span>Subtotal Amount:</span>
                  <span className="font-semibold">{currency}{(isSale ? saleData!.subtotal : (repairData!.finalCost || repairData!.estimatedCost)).toLocaleString()}</span>
                </div>

                {isSale && saleData!.discountAmount > 0 && (
                  <div className="flex justify-between font-medium" style={{ color: '#059669' }}>
                    <span>Discount Applied:</span>
                    <span>- {currency}{saleData!.discountAmount.toLocaleString()}</span>
                  </div>
                )}

                {isSale && saleData!.tradeInCreditApplied > 0 && (
                  <div className="flex justify-between font-medium" style={{ color: '#0891b2' }}>
                    <span>Trade-in Exchange Credit:</span>
                    <span>- {currency}{saleData!.tradeInCreditApplied.toLocaleString()}</span>
                  </div>
                )}

                {isSale && saleData!.taxAmount > 0 && (
                  <div className="flex justify-between" style={{ color: '#475569' }}>
                    <span>GST ({settings.taxRatePercent}% Tax):</span>
                    <span className="font-semibold">{currency}{saleData!.taxAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-base font-black pt-2 border-t" style={{ color: '#0f172a', borderTopColor: '#cbd5e1' }}>
                  <span>Grand Total:</span>
                  <span>{currency}{totalAmount.toLocaleString()}</span>
                </div>

                <div className="flex justify-between font-bold pt-1" style={{ color: '#334155' }}>
                  <span>Amount Paid:</span>
                  <span style={{ color: '#047857' }}>{currency}{paidAmount.toLocaleString()}</span>
                </div>

                {balanceAmount > 0 && (
                  <div className="flex justify-between font-black p-1.5 rounded border" style={{ backgroundColor: '#fff1f2', color: '#be123c', borderColor: '#fecdd3' }}>
                    <span>Balance Owed:</span>
                    <span>{currency}{balanceAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Custom Footer Support Note */}
            {settings.customInvoiceFooterNote && (
              <div className="pt-3 pb-1 text-center font-semibold text-xs border-t italic" style={{ color: themeColor, borderColor: '#e2e8f0' }}>
                {settings.customInvoiceFooterNote}
              </div>
            )}

            {/* Footer Signature & Verification Barcode */}
            <div className="pt-4 border-t flex items-center justify-between gap-4 text-[11px]" style={{ borderTopColor: '#e2e8f0', color: '#475569' }}>
              <div className="space-y-1">
                <div className="w-32 border-b" style={{ borderBottomColor: '#94a3b8' }}></div>
                <div className="text-[10px] font-medium" style={{ color: '#64748b' }}>Customer Signature</div>
              </div>

              {showQr ? (
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto p-1 rounded border flex items-center justify-center" style={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1' }}>
                    <QrCode className="w-full h-full" style={{ color: '#0f172a' }} />
                  </div>
                  <span className="text-[9px] block mt-0.5" style={{ color: '#94a3b8' }}>Scan to Verify Invoice</span>
                </div>
              ) : (
                <div className="text-center text-[10px] font-mono font-semibold text-slate-400">
                  INV#{invoiceNumber}
                </div>
              )}

              <div className="text-right space-y-1">
                <div className="w-36 border-b ml-auto" style={{ borderBottomColor: '#94a3b8' }}></div>
                <div className="text-[10px] font-bold" style={{ color: '#0f172a' }}>
                  For {settings.shopName}
                </div>
                <div className="text-[9px]" style={{ color: '#94a3b8' }}>
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
