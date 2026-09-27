import { env } from "cloudflare:workers";

const validWishes = new Set(["好运", "钱", "爱", "自由", "勇气", "新鲜事", "健康", "睡眠"]);

type VisitAction = "enter" | "wish";

export async function recordVisit(action: VisitAction, visitorKey: string, wishAshley?: string, wishSelf?: string) {
  if (!env.DB) throw new Error("Visitor database unavailable");
  const db = env.DB;
  if (action === "wish" && (!validWishes.has(wishAshley || "") || !validWishes.has(wishSelf || ""))) throw new Error("Invalid wish");
  await db.prepare("INSERT OR IGNORE INTO visitors (visitor_key, created_at) VALUES (?, ?)").bind(visitorKey, new Date().toISOString()).run();
  if (action === "wish") {
    await db.prepare("UPDATE visitors SET wish_ashley = ?, wish_self = ? WHERE visitor_key = ? AND wish_ashley IS NULL AND wish_self IS NULL").bind(wishAshley, wishSelf, visitorKey).run();
  }
  const visitor = await db.prepare("SELECT id FROM visitors WHERE visitor_key = ?").bind(visitorKey).first<{ id: number }>();
  const total = await db.prepare("SELECT COUNT(*) AS total FROM visitors").first<{ total: number }>();
  const tally = await db.prepare("SELECT wish, COUNT(*) AS amount FROM (SELECT wish_ashley AS wish FROM visitors WHERE wish_ashley IS NOT NULL UNION ALL SELECT wish_self AS wish FROM visitors WHERE wish_self IS NOT NULL) GROUP BY wish").all<{ wish: string; amount: number }>();
  return { id: visitor?.id ?? 0, total: total?.total ?? 0, counts: Object.fromEntries((tally.results || []).map((x) => [x.wish, x.amount])) };
}
