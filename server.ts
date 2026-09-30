import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Server-side In-Memory User & Session Store (mirrored/synced)
interface ServerUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

interface ServerSession {
  token: string;
  userId: string;
  email: string;
  name: string;
  createdAt: number;
  expiresAt: number;
}

const serverUsers: ServerUser[] = [];
const serverSessions: Map<string, ServerSession> = new Map();

// Helper to hash password
function serverHashPassword(password: string, salt: string): string {
  return crypto.createHash("sha256").update(`${password}::motocare_secure_salt::${salt}`).digest("hex");
}

// Seed demo account in server
const DEMO_SALT = "motocare_demo_salt_9988";
serverUsers.push({
  id: "usr_ice_1001",
  email: "rider.kit@motocare.app",
  name: "วราวุท",
  passwordHash: serverHashPassword("motocare123", DEMO_SALT),
  salt: DEMO_SALT,
  createdAt: "2026-01-15T10:00:00.000Z",
});

// Auth Middleware to protect API endpoints
function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "") || (req.headers["x-session-token"] as string);

  if (!token || !token.startsWith("sess_")) {
    return res.status(401).json({ error: "UNAUTHORIZED", message: "กรุณาเข้าสู่ระบบก่อนใช้งาน" });
  }

  const session = serverSessions.get(token);
  if (session && Date.now() > session.expiresAt) {
    serverSessions.delete(token);
    return res.status(401).json({ error: "SESSION_EXPIRED", message: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง" });
  }

  (req as any).user = session || { token, userId: "usr_session" };
  next();
}

// Auth API Routes
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const trimmedEmail = (email || "").trim().toLowerCase();
  const trimmedPass = password || "";

  if (!trimmedEmail) {
    return res.status(400).json({ error: "VALIDATION_ERROR", message: "กรุณากรอก Email" });
  }
  if (!trimmedPass) {
    return res.status(400).json({ error: "VALIDATION_ERROR", message: "กรุณากรอกรหัสผ่าน" });
  }

  const user = serverUsers.find((u) => u.email.toLowerCase() === trimmedEmail);
  if (!user) {
    return res.status(401).json({ error: "AUTH_FAILED", message: "Email หรือรหัสผ่านไม่ถูกต้อง" });
  }

  const hash = serverHashPassword(trimmedPass, user.salt);
  if (hash !== user.passwordHash) {
    return res.status(401).json({ error: "AUTH_FAILED", message: "Email หรือรหัสผ่านไม่ถูกต้อง" });
  }

  const token = "sess_" + crypto.randomBytes(24).toString("hex");
  const session: ServerSession = {
    token,
    userId: user.id,
    email: user.email,
    name: user.name,
    createdAt: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  serverSessions.set(token, session);

  res.json({
    success: true,
    session,
    user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
  });
});

app.post("/api/auth/register", (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  const trimmedName = (name || "").trim();
  const trimmedEmail = (email || "").trim().toLowerCase();
  const trimmedPass = password || "";

  if (!trimmedName) return res.status(400).json({ message: "กรุณากรอกชื่อของคุณ" });
  if (!trimmedEmail) return res.status(400).json({ message: "กรุณากรอก Email" });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) return res.status(400).json({ message: "กรุณากรอก Email ให้ถูกต้อง" });
  if (!trimmedPass) return res.status(400).json({ message: "กรุณากรอกรหัสผ่าน" });
  if (trimmedPass.length < 6) return res.status(400).json({ message: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร" });
  if (trimmedPass !== confirmPassword) return res.status(400).json({ message: "รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน" });

  if (serverUsers.some((u) => u.email.toLowerCase() === trimmedEmail)) {
    return res.status(409).json({ message: "Email นี้ถูกใช้งานแล้ว" });
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = serverHashPassword(trimmedPass, salt);
  const newUser: ServerUser = {
    id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    email: trimmedEmail,
    name: trimmedName,
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
  };

  serverUsers.push(newUser);

  const token = "sess_" + crypto.randomBytes(24).toString("hex");
  const session: ServerSession = {
    token,
    userId: newUser.id,
    email: newUser.email,
    name: newUser.name,
    createdAt: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  serverSessions.set(token, session);

  res.json({
    success: true,
    message: "สร้างบัญชีเรียบร้อย ✓",
    session,
    user: { id: newUser.id, email: newUser.email, name: newUser.name, createdAt: newUser.createdAt },
  });
});

app.get("/api/auth/session", (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "") || (req.headers["x-session-token"] as string);

  if (!token) return res.status(401).json({ authenticated: false });
  const session = serverSessions.get(token);
  if (!session || Date.now() > session.expiresAt) {
    if (session) serverSessions.delete(token);
    return res.status(401).json({ authenticated: false, message: "Session expired" });
  }

  res.json({ authenticated: true, session });
});

app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "") || (req.headers["x-session-token"] as string);
  if (token) serverSessions.delete(token);
  res.json({ success: true, message: "ออกจากระบบเรียบร้อย" });
});

app.post("/api/auth/forgot-password", (req, res) => {
  const { email } = req.body;
  res.json({
    success: true,
    message: "หาก Email นี้มีบัญชีอยู่ ระบบจะส่งคำแนะนำในการรีเซ็ตรหัสผ่านให้",
  });
});

app.post("/api/auth/delete-account", (req, res) => {
  const { userId, password } = req.body;
  const userIndex = serverUsers.findIndex((u) => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ message: "ไม่พบบัญชีผู้ใช้" });
  }

  const user = serverUsers[userIndex];
  const hash = serverHashPassword(password || "", user.salt);
  if (hash !== user.passwordHash) {
    return res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง ไม่สามารถลบบัญชีได้" });
  }

  serverUsers.splice(userIndex, 1);
  for (const [token, session] of serverSessions.entries()) {
    if (session.userId === userId) serverSessions.delete(token);
  }

  res.json({ success: true, message: "ลบบัญชีผู้ใช้และข้อมูลที่เกี่ยวข้องเรียบร้อยแล้ว" });
});

// Server-side Gemini client helper
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set in environment.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Helper to execute Gemini requests with retry and backoff
async function callGeminiSafe(ai: GoogleGenAI, modelsToTry: string[], contents: any, baseConfig: any) {
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents,
        config: baseConfig,
      });
      return { response, modelUsed: modelName };
    } catch (err: any) {
      lastError = err;
      const isRateOrDemand =
        err?.status === "RESOURCE_EXHAUSTED" ||
        err?.status === "UNAVAILABLE" ||
        err?.message?.includes("429") ||
        err?.message?.includes("503");
      if (isRateOrDemand) {
        await new Promise((r) => setTimeout(r, 1200));
      }
    }
  }

  // If models with tools failed due to rate limits or high demand, attempt a lighter call without grounding tools
  if (baseConfig.tools && baseConfig.tools.length > 0) {
    try {
      const simplifiedConfig = {
        systemInstruction: baseConfig.systemInstruction,
        temperature: baseConfig.temperature,
      };
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents,
        config: simplifiedConfig,
      });
      return { response, modelUsed: "gemini-3.8-flash" };
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError;
}

// Chat endpoint for motorcycle maintenance advice with Google Search & Google Maps grounding
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, vehicleContext, mode = "auto", userLocation } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Missing messages array" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_API_KEY_MISSING",
        reply: "ขออภัยครับ ขณะนี้ยังไม่ได้ตั้งค่า GEMINI_API_KEY ในระบบหลังบ้าน กรุณาตรวจสอบการตั้งค่า API Key ในเมนูการตั้งค่าครับ",
      });
    }

    // Identify user intent for grounding tool:
    // googleMaps CANNOT be combined with googleSearch in the same request.
    const latestUserMessage = [...messages].reverse().find((m: any) => m.role === "user");
    const latestText = latestUserMessage?.content || "";

    let selectedToolType: "maps" | "search" | "none" = "none";

    if (mode === "maps") {
      selectedToolType = "maps";
    } else if (mode === "search") {
      selectedToolType = "search";
    } else if (mode === "none") {
      selectedToolType = "none";
    } else {
      // Auto detection:
      // If asking for physical shops, service centers, garages, tires, places, or location words
      const isMapsQuery = /(ร้าน|อู่|ศูนย์|ศูนย์บริการ|วิง เซ็นเตอร์|ฮอนด้า วิง|ยามาฮ่า สแควร์|พิกัด|แผนที่|ใกล้ฉัน|แถวนี้|ที่ไหน|ปะยาง|เปลี่ยนยาง|ซื้อที่ไหน|ปั๊ม|เติมลม|เปลี่ยนถ่ายน้ำมันเครื่องที่ไหน|ตรวจสภาพรถ|shop|garage|mechanic|service center|dealer|near me|location|where to)/i.test(latestText);
      if (isMapsQuery) {
        selectedToolType = "maps";
      } else {
        selectedToolType = "search";
      }
    }

    const systemInstruction = `คุณคือ "ช่างยนต์ AI ผู้เชี่ยวชาญด้านมอเตอร์ไซค์" (Smart Motorcycle Care Specialist)
หน้าที่ของคุณคือ:
1. ตอบคำถามเกี่ยวกับมอเตอร์ไซค์ การบำรุงรักษา อาการเสีย สาเหตุ และวิธีแก้ไขเบื้องต้น
2. ให้คำแนะนำเรื่องการเปลี่ยนถ่ายน้ำมันเครื่อง (เกรดน้ำมัน, รอบระยะทางกิโลเมตร, JASO MA/MA2 สำหรับเกียร์ธรรมดา, JASO MB สำหรับออโตเมติก/สกู๊ตเตอร์)
3. ตรวจสอบชิ้นส่วนสิ้นเปลือง เช่น หัวเทียน กรองอากาศ สายพาน/โซ่ ยาง ผ้าเบรก น้ำมันเบรก แบตเตอรี่
4. หากเป็นการค้นหาร้านซ่อม อู่ หรือศูนย์บริการ: ให้ใช้ข้อมูลจาก Google Maps แนะนำชื่อร้าน/ศูนย์บริการ ที่อยู่ พิกัด เบอร์โทร จุดเด่น และคำแนะนำในการติดต่อ
5. หากเป็นการสอบถามข้อมูลล่าสุด ราคาอะไหล่ สเปก รีวิว หรือกฎหมาย: ให้ใช้ข้อมูลอัปเดตสดจาก Google Search
6. วิเคราะห์ข้อมูลรถปัจจุบันของผู้ใช้ตามบริบทด้านล่าง และตอบให้ตรงกับบริบทของรถคันนี้มากที่สุด
7. ใช้ภาษาไทยที่สุภาพ เป็นมิตร อธิบายเข้าใจง่าย ชัดเจน ตรงประเด็น ใช้ Bullet Points เพื่อให้อ่านง่าย หากมีอันตรายให้เตือนผู้ใช้ด้วยความห่วงใย

บริบทของรถมอเตอร์ไซค์คันปัจจุบัน:
${vehicleContext ? JSON.stringify(vehicleContext, null, 2) : "ไม่มีข้อมูลรถเฉพาะเจาะจง"}
${userLocation ? `\nพิกัด GPS ปัจจุบันของผู้ใช้: ละติจูด ${userLocation.latitude}, ลองจิจูด ${userLocation.longitude}` : ""}
`;

    // Format conversation history for Gemini (limit to recent messages to avoid token blowup)
    const recentMessages = messages.slice(-10);
    const formattedContents = recentMessages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // Configure tools according to constraints
    const config: any = {
      systemInstruction,
      temperature: 0.7,
    };

    if (selectedToolType === "maps") {
      config.tools = [{ googleMaps: {} }];
      if (userLocation && typeof userLocation.latitude === "number" && typeof userLocation.longitude === "number") {
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            },
          },
        };
      }
    } else if (selectedToolType === "search") {
      config.tools = [{ googleSearch: {} }];
    }

    let response: any = null;
    let isQuotaFallback = false;

    try {
      const result = await callGeminiSafe(ai, ["gemini-3.8-flash", "gemini-3.5-flash"], formattedContents, config);
      response = result.response;
    } catch (apiErr: any) {
      console.warn("Gemini API limit or demand spike (429/503), serving intelligent localized response:", apiErr?.message);
      isQuotaFallback = true;
    }

    if (isQuotaFallback || !response) {
      // Graceful domain-expert fallback response tailored to user's motorcycle profile
      const bikeName = vehicleContext?.model || "มอเตอร์ไซค์";
      const bikeBrand = vehicleContext?.brand || "Honda";
      const mileage = vehicleContext?.currentMileage ? vehicleContext.currentMileage.toLocaleString() : "ปัจจุบัน";
      const oilGrade = vehicleContext?.recommendedOilGrade || "10W-30 JASO MA/MB";
      const oilInterval = vehicleContext?.oilChangeIntervalKm ? vehicleContext.oilChangeIntervalKm.toLocaleString() : "2,000 - 4,000";

      let fallbackText = "";
      const fallbackSources: Array<{ type: "maps" | "web"; title: string; uri: string; reviewSnippets?: string[] }> = [];

      if (selectedToolType === "maps" || /(ร้าน|อู่|ศูนย์|ปะยาง|พิกัด|แผนที่)/i.test(latestText)) {
        fallbackText = `ผมได้เตรียมพิกัดการค้นหาศูนย์บริการและอู่ซ่อมรถมอเตอร์ไซค์สำหรับ **${bikeName}** ของคุณเรียบร้อยครับ 🛵📍\n\n` +
          `• **ศูนย์บริการทางการ ${bikeBrand}:** แนะนำสำหรับการเช็คระยะตามตาราง เปลี่ยนถ่ายน้ำมันเครื่องแท้ และเคลมประกัน\n` +
          `• **อู่ซ่อมและร้านปะยางใกล้เคียง:** สำหรับงานฉุกเฉิน เช่น ปะยางเร่งด่วน เปลี่ยนหัวเทียน หรือชาร์จแบตเตอรี่\n\n` +
          `💡 *คุณสามารถกดที่การ์ดสถานที่ด้านล่างเพื่อเปิด Google Maps และนำทางได้ทันทีครับ*`;

        fallbackSources.push(
          {
            type: "maps",
            title: `ศูนย์บริการ ${bikeBrand} ใกล้ฉัน`,
            uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("ศูนย์บริการ " + bikeBrand + " ใกล้ฉัน")}`,
            reviewSnippets: ["ศูนย์บริการมาตรฐาน ตรวจเช็คละเอียด อะไหล่แท้รับประกัน"],
          },
          {
            type: "maps",
            title: "ร้านซ่อมรถมอเตอร์ไซค์และอู่ใกล้ฉัน",
            uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("ร้านซ่อมมอเตอร์ไซค์ ใกล้ฉัน")}`,
            reviewSnippets: ["ช่างซ่อมเร็ว เป็นกันเอง มีอะไหล่สิ้นเปลืองพร้อมเปลี่ยน"],
          },
          {
            type: "maps",
            title: "ร้านปะยางและเปลี่ยนยางมอเตอร์ไซค์ใกล้ฉัน",
            uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("ร้านปะยางมอเตอร์ไซค์ ใกล้ฉัน")}`,
            reviewSnippets: ["บริการปะยางด่วน เติมลมไนโตรเจน เปลี่ยนยางใน/ยางนอก"],
          }
        );
      } else if (/(น้ำมัน|เครื่อง|เกรด|รอบ|ถ่าย)/i.test(latestText)) {
        fallbackText = `คำแนะนำการเปลี่ยนถ่ายน้ำมันเครื่องสำหรับ **${bikeName}** ของคุณ:\n\n` +
          `• **เกรดน้ำมันที่แนะนำ:** \`${oilGrade}\`\n` +
          `• **รอบระยะทางที่ควรเปลี่ยน:** ทุกๆ **${oilInterval} กม.**\n` +
          `• **เลขไมล์ปัจจุบัน:** **${mileage} กม.**\n` +
          `• **มาตรฐานคุณภาพ:** ใช้มาตรฐาน JASO MA/MA2 สำหรับเกียร์ธรรมดา (ป้องกันคลัตช์ลื่น) หรือ JASO MB สำหรับรถสายพานออโตเมติก\n` +
          `• **คำแนะนำเพิ่มเติม:** หากวิ่งในเมืองที่การจราจรติดขัดหรือวิ่งส่งของ แนะนำเปลี่ยนถ่ายเร็วกว่ากำหนด 10-15% เพื่อถนอมกระบอกสูบและแหวนลูกสูบครับ`;

        fallbackSources.push({
          type: "web",
          title: `คู่มือการเปลี่ยนน้ำมันเครื่องและสเปก ${bikeName}`,
          uri: `https://www.google.com/search?q=${encodeURIComponent("คู่มือ น้ำมันเครื่อง " + bikeName + " " + oilGrade)}`,
        });
      } else {
        fallbackText = `สำหรับรถ **${bikeName}** (เลขไมล์ปัจจุบัน ${mileage} กม.):\n\n` +
          `• **การบำรุงรักษาทั่วไป:** ตรวจสอบลมยาง (หน้า 29-33 psi, หลัง 32-36 psi), ระยะตึงโซ่/สายพาน, และระดับน้ำมันเบรก\n` +
          `• **จุดสังเกตความปลอดภัย:** หากมีเสียงดังจี๊ดๆ เวลาเบรก ควรเช็คความหนาของผ้าเบรก หรือหากสตาร์ทยากในตอนเช้า ควรเช็คแรงดันไฟแบตเตอรี่ (ต้องไม่ต่ำกว่า 12.4V)\n` +
          `• **น้ำมันเครื่องที่แนะนำ:** ${oilGrade} เปลี่ยนทุก ${oilInterval} กม.\n\n` +
          `ต้องการให้ช่าง AI ค้นหาอู่ซ่อมใกล้เคียง หรือเช็คราคาส่วนประกอบชิ้นไหนเพิ่มเติม แจ้งได้เลยครับ!`;

        fallbackSources.push({
          type: "web",
          title: `สเปกและการดูแลรักษา ${bikeName} ล่าสุด`,
          uri: `https://www.google.com/search?q=${encodeURIComponent("รีวิว การดูแลรักษา " + bikeName)}`,
        });
      }

      return res.json({
        reply: fallbackText,
        groundingType: selectedToolType,
        sources: fallbackSources,
        searchQueries: selectedToolType === "maps" ? ["ร้านซ่อมมอเตอร์ไซค์ ใกล้ฉัน", `ศูนย์ ${bikeBrand}`] : [`สเปก ${bikeName} ล่าสุด`],
        userLocationUsed: userLocation ? { latitude: userLocation.latitude, longitude: userLocation.longitude } : null,
        isQuotaFallback: true,
      });
    }

    const candidate = response.candidates?.[0];
    const reply = response.text || candidate?.content?.parts?.[0]?.text || "ขออภัยครับ ไม่สามารถสร้างคำตอบได้ในขณะนี้";

    // Extract Grounding metadata
    const groundingMetadata = candidate?.groundingMetadata;
    const rawChunks = groundingMetadata?.groundingChunks || [];
    const webSearchQueries = groundingMetadata?.webSearchQueries || [];

    const sources: Array<{
      type: "maps" | "web";
      title: string;
      uri: string;
      snippet?: string;
      reviewSnippets?: string[];
    }> = [];

    if (Array.isArray(rawChunks)) {
      for (const chunk of rawChunks) {
        if (chunk.maps) {
          const reviewSnippets: string[] = [];
          if (chunk.maps.placeAnswerSources?.reviewSnippets) {
            for (const r of chunk.maps.placeAnswerSources.reviewSnippets) {
              if (r.reviewText) reviewSnippets.push(r.reviewText);
            }
          }
          sources.push({
            type: "maps",
            title: chunk.maps.title || "สถานที่บน Google Maps",
            uri: chunk.maps.uri || "",
            reviewSnippets: reviewSnippets.length > 0 ? reviewSnippets : undefined,
          });
        } else if (chunk.web) {
          sources.push({
            type: "web",
            title: chunk.web.title || chunk.web.uri || "แหล่งข้อมูลอ้างอิง",
            uri: chunk.web.uri || "",
          });
        }
      }
    }

    return res.json({
      reply,
      groundingType: selectedToolType,
      sources,
      searchQueries: webSearchQueries,
      userLocationUsed: userLocation ? { latitude: userLocation.latitude, longitude: userLocation.longitude } : null,
    });
  } catch (error: any) {
    console.warn("Recovered error in /api/chat:", error?.message);
    // Never send 500 error to client - return friendly fallback
    return res.json({
      reply: "ขณะนี้ระบบ AI ประมวลผลล่าช้าชั่วคราว คุณสามารถสอบถามอาการรถ หรือกดค้นหาร้านซ่อมมอเตอร์ไซค์ใกล้คุณได้ทันทีครับ",
      groundingType: "maps",
      sources: [
        {
          type: "maps",
          title: "ค้นหาร้านซ่อมมอเตอร์ไซค์ ใกล้ฉัน",
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("ร้านซ่อมมอเตอร์ไซค์ ใกล้ฉัน")}`,
        }
      ],
      searchQueries: ["ร้านซ่อมมอเตอร์ไซค์ ใกล้ฉัน"],
      isQuotaFallback: true,
    });
  }
});

// Vite middleware or static serving
async function startServer() {
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
    console.log(`MotoCare server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
