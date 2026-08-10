import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Initialize Gemini AI Client
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined in environment variables.");
    }
    return new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

// Helper to sanitize and clean AI response text, extracting text if model outputs JSON structure
function cleanAiResponseText(rawText: string): string {
  if (!rawText) return "";
  let text = rawText.trim();

  // Remove markdown codeblock wrapper if present
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  }

  // If text is a raw JSON string or object string, parse and extract message content
  if ((text.startsWith("{") && text.endsWith("}")) || (text.startsWith("[") && text.endsWith("]"))) {
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed === "string") return parsed;
      if (typeof parsed.reply === "string") return parsed.reply;
      if (typeof parsed.text === "string") return parsed.text;
      if (typeof parsed.message === "string") return parsed.message;
      if (typeof parsed.response === "string") return parsed.response;
      if (typeof parsed.content === "string") return parsed.content;
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => typeof item === "string" ? item : JSON.stringify(item)).join("\n");
      }
    } catch {
      // If parsing fails, fall back to cleaned text
    }
  }

  return text;
}

// Helper to generate intelligent local analytics response if Gemini API hits quota limits or errors
function generateFallbackAnalyticsResponse(prompt: string, storeContext: any): string {
  const lowerPrompt = (prompt || '').toLowerCase();
  const summary = storeContext?.summaryMetrics || {};
  const formatRupee = (num: number) => `₹${(num || 0).toLocaleString('en-IN')}`;
  const storeName = storeContext?.storeName || 'Mobile World Care';

  if (
    lowerPrompt.includes('income') ||
    lowerPrompt.includes('revenue') ||
    lowerPrompt.includes('profit') ||
    lowerPrompt.includes('sales') ||
    lowerPrompt.includes('report') ||
    lowerPrompt.includes('finance')
  ) {
    const totalSales = summary.totalSalesRevenue || 0;
    const grossProfit = summary.totalGrossProfit || 0;
    const expenses = summary.totalExpenses || 0;
    const netIncome = summary.netIncome ?? (grossProfit - expenses);

    const salesList = (storeContext?.salesHistorySample || [])
      .map(
        (s: any) =>
          `* **Invoice ${s.invoiceNo}**: **${formatRupee(s.totalAmount)}** (${s.customerName || 'Walk-in Customer'}, Method: ${s.paymentMethod || 'Cash'}, Date: ${s.date || 'Today'})`
      )
      .slice(0, 5)
      .join('\n');

    return (
      `### 📊 ${storeName} - Live Financial & Income Report\n\n` +
      `Here is your real-time store financial performance summary calculated directly from your transaction logs:\n\n` +
      `* **Total Sales Revenue**: **${formatRupee(totalSales)}**\n` +
      `* **Gross Profit Margin**: **${formatRupee(grossProfit)}**\n` +
      `* **Total Shop Operating Expenses**: **${formatRupee(expenses)}**\n` +
      `* **Net Profit / Store Income**: **${formatRupee(netIncome)}**\n` +
      `* **Total Active Customer Udhar Dues**: **${formatRupee(summary.totalCustomerUdharDebt || 0)}**\n\n` +
      `### 🧾 Recent Sales Transactions:\n${salesList || 'No sales transactions recorded yet.'}\n\n` +
      `💡 *Tip: Access the Reports & Revenue Stats tab in the navigation bar to export itemized GST ledgers and profitability charts.*`
    );
  }

  if (
    lowerPrompt.includes('udhar') ||
    lowerPrompt.includes('debt') ||
    lowerPrompt.includes('credit') ||
    lowerPrompt.includes('customer') ||
    lowerPrompt.includes('due') ||
    lowerPrompt.includes('balance') ||
    lowerPrompt.includes('khata')
  ) {
    const debts = storeContext?.unpaidCustomerDebts || [];
    const totalDebt = summary.totalCustomerUdharDebt || 0;

    const debtList =
      debts.length > 0
        ? debts
            .map(
              (d: any) =>
                `* **${d.name}** (${d.phone || 'No phone'}): Outstanding Dues = **${formatRupee(d.balance)}**`
            )
            .join('\n')
        : 'No pending customer debts currently recorded in ledger.';

    return (
      `### 💰 Customer Udhar Khata & Debt Ledger\n\n` +
      `* **Total Outstanding Customer Debt**: **${formatRupee(totalDebt)}**\n` +
      `* **Accounts With Pending Dues**: **${debts.length} active customer account(s)**\n\n` +
      `### 👤 Customer Dues Breakdown:\n${debtList}\n\n` +
      `💡 *Tip: Open the Udhar Khata module to record incoming cash repayments, settlement receipts, or send bill reminders.*`
    );
  }

  if (
    lowerPrompt.includes('repair') ||
    lowerPrompt.includes('job') ||
    lowerPrompt.includes('tech') ||
    lowerPrompt.includes('service') ||
    lowerPrompt.includes('fix') ||
    lowerPrompt.includes('device')
  ) {
    const repairs = storeContext?.activeRepairs || [];
    const repairList =
      repairs.length > 0
        ? repairs
            .map(
              (r: any) =>
                `* **Job #${r.jobNo}** - ${r.device}: "${r.problem}" | Status: **${r.status}** | Estimated Cost: **${formatRupee(r.estimatedCost)}**`
            )
            .join('\n')
        : 'No pending repair job cards currently in the shop queue.';

    return (
      `### 🛠️ Repair Center Job Status\n\n` +
      `* **Active Repair Jobs In Progress**: **${summary.activeRepairJobsCount || 0} device(s)**\n\n` +
      `### 📱 Current Repair Queue:\n${repairList}\n\n` +
      `💡 *Tip: Update job card progress in Repair Center to auto-generate updates for technicians and customers.*`
    );
  }

  if (
    lowerPrompt.includes('stock') ||
    lowerPrompt.includes('inventory') ||
    lowerPrompt.includes('product') ||
    lowerPrompt.includes('item') ||
    lowerPrompt.includes('quantity') ||
    lowerPrompt.includes('restock')
  ) {
    const lowStock = storeContext?.topLowStockProducts || [];
    const lowStockList =
      lowStock.length > 0
        ? lowStock
            .map(
              (p: any) =>
                `* **${p.brand} ${p.name}**: Current Stock = **${p.stock} units** (Reorder Threshold: ${p.minStock} units)`
            )
            .join('\n')
        : 'All catalog items are currently well stocked above threshold levels.';

    return (
      `### 📦 Inventory & Stock Status Report\n\n` +
      `* **Total Catalog Products**: **${summary.totalProductsCount || 0} items**\n` +
      `* **Low Stock Items Needing Reorder**: **${summary.lowStockAlertCount || 0} product(s)**\n\n` +
      `### ⚠️ Low Stock Reorder Alerts:\n${lowStockList}\n\n` +
      `💡 *Tip: Use Inventory Control to update serial/IMEI tags, modify unit costs, or process vendor orders.*`
    );
  }

  if (
    lowerPrompt.includes('staff') ||
    lowerPrompt.includes('user') ||
    lowerPrompt.includes('cashier') ||
    lowerPrompt.includes('role') ||
    lowerPrompt.includes('permission') ||
    lowerPrompt.includes('pin')
  ) {
    const staff = storeContext?.staffRoster || [];
    const staffList = staff
      .map(
        (u: any) =>
          `* **${u.name}** - Role: **${u.role}** | Status: **${u.status || 'Active'}**`
      )
      .join('\n');

    return (
      `### 👥 Store Personnel & Cashier Roster\n\n` +
      `* **Total Staff Accounts**: **${summary.totalStaffMembers || 0} user(s)**\n\n` +
      `### 🆔 Registered Accounts:\n${staffList}\n\n` +
      `💡 *Tip: Access Staff & Cashier Role Permissions to manage user credentials, POS terminal PINs, or edit privilege permissions.*`
    );
  }

  // General comprehensive fallback
  return (
    `### 🏬 ${storeName} - Real-time Business Intelligence Summary\n\n` +
    `Here is a full breakdown of your current store financial and operational status:\n\n` +
    `* **Total Sales Revenue**: **${formatRupee(summary.totalSalesRevenue || 0)}**\n` +
    `* **Gross Profit Margin**: **${formatRupee(summary.totalGrossProfit || 0)}**\n` +
    `* **Operating Expenses**: **${formatRupee(summary.totalExpenses || 0)}**\n` +
    `* **Net Income**: **${formatRupee(summary.netIncome || 0)}**\n` +
    `* **Customer Udhar Debt**: **${formatRupee(summary.totalCustomerUdharDebt || 0)}**\n` +
    `* **Low Stock Reorder Alerts**: **${summary.lowStockAlertCount || 0} items**\n` +
    `* **Active Repair Jobs**: **${summary.activeRepairJobsCount || 0} devices**\n\n` +
    `Feel free to ask for specific reports regarding **Sales Income**, **Udhar Debts**, **Low Stock Alerts**, or **Repair Cards**!`
  );
}

  // AI Store Assistant Route
  app.post("/api/ai-assistant", async (req, res) => {
    const { prompt, storeContext, history } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // If no API key configured, use local intelligent analytics
      const fallbackReply = generateFallbackAnalyticsResponse(prompt, storeContext);
      return res.json({ reply: fallbackReply });
    }

    try {
      const ai = getGeminiClient();

      const systemInstruction = `
You are the AI Business & Finance Assistant for "Mobile World Care & Digital Store", a comprehensive Indian Mobile Retail Shop, Repair Center, Device Buyback & POS Management System.

Your primary duty is to analyze store reports, income figures, sales records, customer udhar (credits), repair job status, product inventory stock, and staff performance, and answer the user's questions clearly, accurately, and professionally.

Here is the current REAL-TIME DATA snapshot of the shop:
${JSON.stringify(storeContext, null, 2)}

INSTRUCTIONS:
1. Always format monetary values using Indian Rupees (₹) with proper comma separators (e.g. ₹1,25,000).
2. Be precise and clear when providing financial summaries, total income, net profits, sales volume, expense breakdowns, and pending customer dues (Udhar Khata).
3. Provide actionable business insights when relevant (e.g. identifying low stock items, top revenue generators, or unpaid credit accounts).
4. Keep answers friendly, well-structured with Markdown headings, bold text, and bullet points.
5. If asked about specific items or customers, refer to the exact names, IMEIs, or figures from the store context provided above.
`;

      let formattedContents: any = prompt;
      if (history && Array.isArray(history) && history.length > 0) {
        const conversationParts = history.map((item: { role: string; text: string }) => ({
          role: item.role === "user" ? "user" : "model",
          parts: [{ text: item.text }],
        }));
        conversationParts.push({
          role: "user",
          parts: [{ text: prompt }],
        });
        formattedContents = conversationParts;
      }

      let responseText = "";

      // Attempt primary model: gemini-3.6-flash
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: formattedContents,
          config: {
            systemInstruction,
            temperature: 0.3,
          },
        });
        responseText = response.text || "";
      } catch (primaryErr: any) {
        // Fallback attempt: gemini-2.5-flash
        try {
          const fallbackModelResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: formattedContents,
            config: {
              systemInstruction,
              temperature: 0.3,
            },
          });
          responseText = fallbackModelResponse.text || "";
        } catch (secondaryErr: any) {
          // If Gemini API quota/key unavailable, seamlessly return instant local store analytics report
          responseText = generateFallbackAnalyticsResponse(prompt, storeContext);
        }
      }

      if (!responseText) {
        responseText = generateFallbackAnalyticsResponse(prompt, storeContext);
      } else {
        responseText = cleanAiResponseText(responseText);
      }

      return res.json({ reply: responseText });
    } catch (err: any) {
      const fallbackReply = generateFallbackAnalyticsResponse(prompt, storeContext);
      return res.json({ reply: fallbackReply });
    }
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Mobile Shop Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
