import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3005;

  app.use(express.json());

  // AI Validation Endpoint for Sharia Compliance
  app.post("/api/validate-sharia", async (req, res) => {
    try {
      const { product, amount, transactionType } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key is not configured." });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
        Validate the following transaction for Sharia compliance in a UMKM context.
        Product: ${JSON.stringify(product)}
        Quantity: ${amount}
        Transaction Type: ${transactionType} (e.g., Murabahah, Mudharabah, Musyarakah, normal sale)

        Provide a brief check:
        1. Is this akad (contract) valid?
        2. Are there any specific restrictions (e.g., non-halal items)?
        3. Simple advice for the UMKM owner.

        Respond in JSON format with fields: compliant (boolean), message (string), and suggestions (array of strings).
      `;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const validation = JSON.parse(result.text || "{}");
      res.json(validation);
    } catch (error) {
      console.error("AI Validation Error:", error);
      res.status(500).json({ error: "Failed to validate transaction via AI." });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: {
          port: 24680 // Menggunakan port HMR alternatif agar tidak bentrok di port 24678
        }
      },
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
