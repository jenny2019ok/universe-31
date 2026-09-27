import { recordVisit } from "@/db/visitors";

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    if ((body.action !== "enter" && body.action !== "wish") || typeof body.visitorKey !== "string" || !/^[0-9a-f-]{36}$/.test(body.visitorKey)) return Response.json({ error: "Invalid visitor" }, { status: 400 });
    const data = await recordVisit(body.action, body.visitorKey, typeof body.wishAshley === "string" ? body.wishAshley : undefined, typeof body.wishSelf === "string" ? body.wishSelf : undefined);
    return Response.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Visitor record failed", error);
    return Response.json({ error: "星际档案暂时无法连接" }, { status: 503 });
  }
}
