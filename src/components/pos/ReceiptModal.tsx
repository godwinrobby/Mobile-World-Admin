import React, { useState } from 'react';
import { SaleTransaction, ShopSettings } from '../../types';
import { Printer, X, Download, CheckCircle2, ShieldCheck, QrCode, Smartphone, FileText } from 'lucide-react';
import { PdfInvoiceModal } from '../common/PdfInvoiceModal';

interface ReceiptModalProps {
  sale: SaleTransaction;
  settings: ShopSettings;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, settings, onClose }) => {
  const [showPdfInvoiceModal, setShowPdfInvoiceModal] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  if (showPdfInvoiceModal) {
    return (
      <PdfInvoiceModal
        type="sale"
        data={sale}
        settings={settings}
        onClose={() => setShowPdfInvoiceModal(false)}
      />
    );
  }

  return (
    <div id="receipt-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div id="receipt-modal-card" className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 text-slate-100 my-8">
        
        {/* Header Controls */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">Invoice & Digital Receipt</h3>
              <p className="text-xs text-slate-400">Sale Recorded Successfully • {sale.invoiceNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPdfInvoiceModal(true)}
              id="generate-pdf-invoice-btn"
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>PDF Invoice</span>
            </button>
            <button
              onClick={handlePrint}
              id="print-receipt-btn"
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              id="close-receipt-btn"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div id="printable-receipt-container" className="mt-6 bg-white text-slate-900 p-6 rounded-xl shadow-lg border border-slate-200 text-sm font-sans space-y-4">
          
          {/* Shop Branding Header */}
          <div className="text-center space-y-1 pb-4 border-b border-slate-200">
            <div className="flex items-center justify-center gap-2 text-indigo-700 font-bold text-lg">
              <Smartphone className="w-5 h-5" />
              <span>{settings.shopName}</span>
            </div>
            <p className="text-xs text-slate-600 font-medium">{settings.tagline}</p>
            <p className="text-xs text-slate-500">{settings.address} • Ph: {settings.phone}</p>
            {settings.gstNumber && (
              <p className="text-xs font-semibold text-slate-700">GSTIN: {settings.gstNumber}</p>
            )}
          </div>

          {/* Invoice Meta */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <div className="text-slate-500 font-medium">Invoice Number:</div>
              <div className="font-bold text-slate-800">{sale.invoiceNumber}</div>
              <div className="text-slate-500 font-medium mt-1">Date & Time:</div>
              <div className="text-slate-700">{sale.timestamp}</div>
            </div>
            <div className="text-right">
              <div className="text-slate-500 font-medium">Customer Details:</div>
              <div className="font-bold text-slate-800">{sale.customerName}</div>
              <div className="text-slate-700">{sale.customerPhone}</div>
              <div className="text-slate-500 text-[11px] mt-1">Billed By: {sale.salesByStaff}</div>
            </div>
          </div>

          {/* Itemized Table */}
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b-2 border-slate-300 text-slate-700">
                <th className="py-2 font-bold">Item Description</th>
                <th className="py-2 text-center font-bold">Qty</th>
                <th className="py-2 text-right font-bold">Price</th>
                <th className="py-2 text-right font-bold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sale.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2.5">
                    <div className="font-bold text-slate-800">{item.brand} {item.productName}</div>
                    {item.color || item.ramStorage ? (
                      <div className="text-[11px] text-slate-500">{item.color} • {item.ramStorage}</div>
                    ) : null}
                    {item.imei && (
                      <div className="text-[11px] font-mono text-indigo-700 font-medium bg-indigo-50 inline-block px-1.5 py-0.5 rounded mt-0.5">
                        IMEI: {item.imei}
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 text-center font-semibold text-slate-700">{item.quantity}</td>
                  <td className="py-2.5 text-right text-slate-700">{settings.currencySymbol}{item.unitPrice.toLocaleString()}</td>
                  <td className="py-2.5 text-right font-bold text-slate-800">
                    {settings.currencySymbol}{((item.unitPrice * item.quantity) - item.discount).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Breakdown */}
          <div className="pt-3 border-t border-slate-300 space-y-1.5 text-xs text-right">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold">{settings.currencySymbol}{sale.subtotal.toLocaleString()}</span>
            </div>
            {sale.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount Applied:</span>
                <span>- {settings.currencySymbol}{sale.discountAmount.toLocaleString()}</span>
              </div>
            )}
            {sale.tradeInCreditApplied > 0 && (
              <div className="flex justify-between text-cyan-600 font-medium">
                <span>Device Exchange Credit:</span>
                <span>- {settings.currencySymbol}{sale.tradeInCreditApplied.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Tax ({settings.taxRatePercent}% GST/VAT):</span>
              <span className="font-semibold">{settings.currencySymbol}{sale.taxAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-300">
              <span>Total Invoice Amount:</span>
              <span>{settings.currencySymbol}{sale.totalAmount.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-slate-700 font-medium pt-1">
              <span>Payment Paid ({sale.paymentMethod}):</span>
              <span className="text-emerald-600 font-bold">{settings.currencySymbol}{sale.paidAmount.toLocaleString()}</span>
            </div>

            {sale.balanceAmount > 0 && (
              <div className="flex justify-between text-rose-600 font-bold bg-rose-50 p-1.5 rounded">
                <span>Remaining Udhar / Balance Owed:</span>
                <span>{settings.currencySymbol}{sale.balanceAmount.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Warranty & Footer Terms */}
          <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-500 flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-1 text-slate-700 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Shop Warranty: {sale.warrantyPeriodMonths} Months Official Coverage</span>
              </div>
              <p className="text-[10px] leading-tight text-slate-500">{settings.receiptFooterMessage}</p>
            </div>

            <div className="text-center shrink-0">
              <div className="w-14 h-14 bg-slate-100 p-1 rounded border border-slate-300 flex items-center justify-center">
                <QrCode className="w-full h-full text-slate-800" />
              </div>
              <span className="text-[9px] text-slate-400 block mt-0.5">Scan to verify</span>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs px-4 py-2 rounded-xl transition"
          >
            Close Receipt
          </button>
        </div>

      </div>
    </div>
  );
};
