import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bot,
  Sparkles,
  X,
  Send,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Package,
  Wrench,
  BookOpen,
  Users,
  Copy,
  Check,
  ChevronRight,
  Maximize2,
  Minimize2,
  Brain,
  HelpCircle
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({ isOpen, onClose }) => {
  const { sales, products, expenses, customers, jobCards, users, settings, exchanges } = useApp();

  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      text: `Hello! I am your **Mobile World Care AI Business Assistant** 🤖✨\n\nI have full access to your real-time store metrics including **Sales Revenue**, **Gross Profits**, **Expense Ledgers**, **Udhar Dues**, **Repair Jobs**, and **Inventory Stock**.\n\nHow can I help you analyze your shop performance today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Construct store context object
  const getStoreContext = () => {
    const totalSalesRevenue = sales.reduce((a, b) => a + b.totalAmount, 0);
    const totalProfit = sales.reduce((a, b) => a + (b.profit || 0), 0);
    const totalExpenses = expenses.reduce((a, b) => a + b.amount, 0);
    const netIncome = totalProfit - totalExpenses;

    const totalUdharDebt = customers.reduce((a, b) => a + (b.currentBalance || 0), 0);
    const lowStockItems = products.filter(p => p.stock <= (p.minStockLevel || 3));
    const activeJobCards = jobCards.filter(j => j.status !== 'Delivered' && j.status !== 'Cancelled');

    return {
      storeName: settings.storeName || 'Mobile World Care',
      summaryMetrics: {
        totalSalesRevenue,
        totalGrossProfit: totalProfit,
        totalExpenses,
        netIncome,
        totalCustomerUdharDebt: totalUdharDebt,
        totalProductsCount: products.length,
        lowStockAlertCount: lowStockItems.length,
        activeRepairJobsCount: activeJobCards.length,
        totalStaffMembers: users.length
      },
      salesHistorySample: sales.slice(0, 10).map(s => ({
        invoiceNo: s.invoiceNo,
        date: s.date,
        customerName: s.customerName,
        totalAmount: s.totalAmount,
        paymentMethod: s.paymentMethod,
        itemCount: s.items.length
      })),
      topLowStockProducts: lowStockItems.map(p => ({
        name: p.name,
        brand: p.brand,
        stock: p.stock,
        minStock: p.minStockLevel
      })),
      unpaidCustomerDebts: customers
        .filter(c => (c.currentBalance || 0) > 0)
        .map(c => ({ name: c.name, phone: c.phone, balance: c.currentBalance })),
      activeRepairs: activeJobCards.map(j => ({
        jobNo: j.jobNo,
        device: `${j.deviceBrand} ${j.deviceModel}`,
        problem: j.problemDescription,
        status: j.status,
        estimatedCost: j.estimatedCost
      })),
      expensesBreakdown: expenses.slice(0, 10).map(e => ({
        title: e.title,
        category: e.category,
        amount: e.amount,
        date: e.date
      })),
      staffRoster: users.map(u => ({ name: u.name, role: u.role, status: u.status }))
    };
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText || inputPrompt;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInputPrompt('');
    setLoading(true);

    try {
      const storeContext = getStoreContext();
      const historyPayload = messages.map(m => ({ role: m.role, text: m.text }));

      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          storeContext,
          history: historyPayload
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Server error occurred');
      }

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        text: data.reply || 'No response returned.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Error fetching AI reply:', err);
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        text: `⚠️ **AI Service Error**: ${err.message || 'Failed to reach AI Assistant server.'}\n\nPlease verify that your \`GEMINI_API_KEY\` is configured in Secrets.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSend(prompt);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div
        className={`bg-slate-900 border-l border-slate-800 h-full shadow-2xl flex flex-col transition-all duration-300 ${
          isExpanded ? 'w-full md:w-3/4 lg:w-2/3' : 'w-full sm:w-[480px] md:w-[540px]'
        }`}
      >
        {/* Drawer Top Header */}
        <div className="p-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl shadow-md text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base tracking-tight text-white">Store AI Assistant</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  LIVE DATA
                </span>
              </div>
              <p className="text-xs text-slate-400">Reports, Income, Profits & Store Analytics</p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title={isExpanded ? 'Collapse Drawer' : 'Expand Drawer'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title="Close Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-slate-950/80 border-b border-slate-800 overflow-x-auto flex items-center space-x-2 shrink-0 no-scrollbar">
          <button
            onClick={() => handleQuickPrompt("Give me a complete summary of today's income, sales revenue, and net profit.")}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 text-slate-300 hover:text-indigo-400 text-xs font-medium whitespace-nowrap transition cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>📊 Income & Revenue</span>
          </button>

          <button
            onClick={() => handleQuickPrompt('Which customers have pending Udhar Khata debt and what are the totals?')}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 text-slate-300 hover:text-indigo-400 text-xs font-medium whitespace-nowrap transition cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>💰 Customer Udhar</span>
          </button>

          <button
            onClick={() => handleQuickPrompt('What is the current status of all pending repair job cards?')}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 text-slate-300 hover:text-indigo-400 text-xs font-medium whitespace-nowrap transition cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span>🛠️ Repair Status</span>
          </button>

          <button
            onClick={() => handleQuickPrompt('List all products that are low on inventory stock and need restocking.')}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 text-slate-300 hover:text-indigo-400 text-xs font-medium whitespace-nowrap transition cursor-pointer"
          >
            <Package className="w-3.5 h-3.5 text-rose-400" />
            <span>📦 Low Stock Alert</span>
          </button>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/60">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div className="flex items-center space-x-2 px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {msg.role === 'user' ? 'You' : 'AI Assistant'}
                </span>
                <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
              </div>

              <div
                className={`relative group max-w-[90%] p-4 rounded-2xl text-sm leading-relaxed shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none font-medium'
                    : 'bg-slate-900 text-slate-100 border border-slate-800 rounded-tl-none'
                }`}
              >
                {/* Formatted Markdown-like rendering */}
                <div className="whitespace-pre-wrap font-sans space-y-2">
                  {msg.text.split('\n').map((line, idx) => {
                    if (line.startsWith('### ')) {
                      return <h4 key={idx} className="font-bold text-base mt-2 text-indigo-400">{line.replace('### ', '')}</h4>;
                    }
                    if (line.startsWith('## ')) {
                      return <h3 key={idx} className="font-bold text-lg mt-2 text-indigo-400">{line.replace('## ', '')}</h3>;
                    }
                    if (line.startsWith('* ') || line.startsWith('- ')) {
                      return (
                        <div key={idx} className="flex items-start space-x-2 pl-2">
                          <span className="text-indigo-400 font-bold">•</span>
                          <span>{line.substring(2)}</span>
                        </div>
                      );
                    }
                    return <p key={idx}>{line}</p>;
                  })}
                </div>

                {/* Copy Button */}
                <button
                  onClick={() => handleCopyText(msg.id, msg.text)}
                  className={`absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${
                    msg.role === 'user' ? 'text-indigo-200 hover:text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="Copy message"
                >
                  {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-3 p-4 bg-slate-900 rounded-2xl border border-slate-800 max-w-[80%] shadow-xs">
              <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
              <span className="text-xs font-medium text-slate-300">Analyzing store reports & financial ledgers...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 shrink-0 space-y-2">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask AI about sales, profits, repair status, customer dues..."
              value={inputPrompt}
              onChange={e => setInputPrompt(e.target.value)}
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden bg-slate-900 text-white placeholder-slate-500 focus:bg-slate-900 transition"
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim() || loading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white p-2.5 rounded-xl shadow-md transition shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[11px] text-center text-slate-500">
            Powered by Gemini AI 3.6 • Synchronized with Mobile World Care live store context
          </p>
        </div>
      </div>
    </div>
  );
};
