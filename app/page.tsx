"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Planet = "if" | "okay" | "other" | "wealth" | "hole";
type Screen = "signal" | "warning" | "entry" | "approved" | "map" | Planet | "center" | "wishes" | "ending" | "exit";
type Counts = Record<string, number>;
const names: Record<Planet, string> = { if: "如果星", okay: "没关系星", other: "另一个我星", wealth: "暴富星", hole: "禁止进入的黑洞" };
const identities = [
  ["普通地球人", "今日允许不普通。"],
  ["偷偷摸鱼的宇航员", "宇宙批准你短暂离开轨道。"],
  ["被猫控制的人类", "本宇宙承认猫的最终解释权。"],
  ["最近有点累的碳基生物", "根据《31号宇宙访客保护条例》，疲惫生命体今日禁止自我攻击。"],
  ["前来寻找财富的生命体", "财富线索已记录。请自行探索。"],
  ["我只是点进来看看", "围观许可已签发。"],
] as const;
const ifOptions = ["选了另一份工作", "没有认识那个人", "勇敢一点", "没有放弃", "我没有特别想改的"];
const otherOptions = ["旅行", "换工作", "恋爱", "一个人生活", "学东西", "创业", "躺一年", "其他"];
const wishes = ["好运", "钱", "爱", "自由", "勇气", "新鲜事", "健康", "睡眠"];
const dayScenes: Record<string, string[]> = {
  旅行: ["清晨六点，你在一座陌生城市的车站醒来。没有攻略，只有一张皱掉的车票。", "黄昏时，你坐在海边一家小店里。菜单看不懂，但晚餐很好吃。"],
  换工作: ["新的办公桌旁有一扇窗。你还没记住同事的名字，却已经喜欢上了下班的路。", "第一周并不轻松。午休时，你发现自己又开始期待明天。"],
  恋爱: ["你们为晚餐吃什么争论了十分钟，最后买了两份完全不同的。", "雨突然下大了。你们在便利店门口等雨停，聊了些没用又很快乐的话。"],
  一个人生活: ["厨房里只亮着一盏小灯。晚饭做得有点咸，但这间屋子的安静刚刚好。", "你把家具挪了一个位置。没人问为什么，这个决定却让你开心了半天。"],
  学东西: ["笔记本上全是错题。你终于把昨天怎么都做不对的那一页翻过去了。", "你练了很久的那个动作，今天第一次像样了一点。"],
  创业: ["第一位客人问了很多问题，最后只买了一件很小的东西。你把收据留了下来。", "凌晨一点，你改完第三版计划。窗外没有烟花，但你还是给自己倒了杯茶。"],
  躺一年: ["下午三点，阳光在地板上移动。你没有用这一天证明什么。", "你睡到自然醒，然后慢慢把一颗橘子剥得很完整。"],
  其他: ["那里的你真的试了一次。过程比想象中乱，但故事从那天开始有了新的一页。", "你推开一扇以前总是路过的门。里面没有奇迹，却有很新鲜的空气。"],
};
const initialCounts: Counts = Object.fromEntries(wishes.map((w) => [w, 0]));

export default function Home() {
  const [screen, setScreen] = useState<Screen>("signal");
  const [identity, setIdentity] = useState<number | null>(null);
  const [visited, setVisited] = useState<Planet[]>([]);
  const [ifPick, setIfPick] = useState<string | null>(null);
  const [ifResult, setIfResult] = useState(false);
  const [otherPick, setOtherPick] = useState<string | null>(null);
  const [scene, setScene] = useState<string | null>(null);
  const [wealthStep, setWealthStep] = useState(0);
  const [lucky] = useState(() => Math.floor(Math.random() * 90) + 10);
  const [holeStep, setHoleStep] = useState(0);
  const [holeAnswer, setHoleAnswer] = useState<boolean | null>(null);
  useEffect(() => { if (holeStep !== 2) return; const t = setTimeout(() => setHoleStep(3), 2100); return () => clearTimeout(t); }, [holeStep]);
  const [okayPick, setOkayPick] = useState<string | null>(null);
  const [centerStep, setCenterStep] = useState(0);
  const [hold, setHold] = useState(0);
  const [wishAshley, setWishAshley] = useState<string | null>(null);
  const [wishSelf, setWishSelf] = useState<string | null>(null);
  const [visitorId, setVisitorId] = useState<number | null>(null);
  const [visitorTotal, setVisitorTotal] = useState(0);
  const [counts, setCounts] = useState<Counts>(initialCounts);
  const [saveError, setSaveError] = useState("");
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdStarted = useRef<number>(0);
  const visitorKey = useRef<string>("");

  useEffect(() => {
    const t = setTimeout(() => setScreen((s) => s === "signal" ? "warning" : s), 4400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [screen]);

  const getKey = () => {
    if (visitorKey.current) return visitorKey.current;
    const existing = window.localStorage.getItem("universe31-visitor");
    visitorKey.current = existing || crypto.randomUUID();
    if (!existing) window.localStorage.setItem("universe31-visitor", visitorKey.current);
    return visitorKey.current;
  };

  const syncVisit = useCallback(async (action: "enter" | "wish", ashley?: string, self?: string) => {
    try {
      const response = await fetch("/api/visit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, visitorKey: getKey(), wishAshley: ashley, wishSelf: self }) });
      if (!response.ok) throw new Error("network");
      const data = await response.json() as { id: number; total: number; counts: Counts };
      setVisitorId(data.id);
      setVisitorTotal(data.total);
      setCounts({ ...initialCounts, ...data.counts });
      setSaveError("");
      return true;
    } catch {
      setSaveError("星际档案暂时无法连接，稍后可重试同步访问记录。");
      return false;
    }
  }, []);

  useEffect(() => {
    if (screen !== "map") return;
    const context = (document as Document & { modelContext?: { registerTool?: (tool: unknown, options?: { signal?: AbortSignal }) => unknown } }).modelContext;
    if (!context?.registerTool) return;
    const controller = new AbortController();
    try {
      void Promise.resolve(context.registerTool({
        name: "open_universe_planet",
        title: "探索31号宇宙星球",
        description: "从星图进入一颗星球，并将它记入探索进度。",
        inputSchema: { type: "object", properties: { planet: { type: "string", enum: ["if", "okay", "other", "wealth", "hole"] } }, required: ["planet"], additionalProperties: false },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute(input: unknown) {
          const planet = (input as { planet?: unknown })?.planet;
          if (typeof planet !== "string" || !["if", "okay", "other", "wealth", "hole"].includes(planet)) throw new Error("未知星球");
          const target = planet as Planet;
          setVisited((v) => v.includes(target) ? v : [...v, target]);
          setScreen(target);
          return { opened: names[target] };
        },
      }, { signal: controller.signal })).catch(() => {});
    } catch { /* Browser does not support WebMCP. */ }
    return () => controller.abort();
  }, [screen]);

  const enterPlanet = (p: Planet) => {
    setScreen(p);
    setVisited((v) => v.includes(p) ? v : [...v, p]);
  };
  const backToMap = () => setScreen("map");
  const openCenter = () => { setCenterStep(0); setHold(0); setScreen("center"); };
  const beginHold = () => {
    if (centerStep !== 1) return;
    holdStarted.current = Date.now();
    if (holdTimer.current) clearInterval(holdTimer.current);
    holdTimer.current = setInterval(() => {
      const progress = Math.min(100, ((Date.now() - holdStarted.current) / 3000) * 100);
      setHold(progress);
      if (progress >= 100) { if (holdTimer.current) clearInterval(holdTimer.current); setCenterStep(2); }
    }, 30);
  };
  const stopHold = () => { if (holdTimer.current) clearInterval(holdTimer.current); if (centerStep === 1) setHold(0); };
  useEffect(() => () => { if (holdTimer.current) clearInterval(holdTimer.current); }, []);
  const finishWish = async (choice: string) => { setWishSelf(choice); await syncVisit("wish", wishAshley || "", choice); setScreen("ending"); };
  const formatId = (id: number | null) => `#${String(id || Math.max(visitorTotal, 1)).padStart(4, "0")}`;

  return <main className={`universe screen-${screen}`}>
    <div className="space-art" aria-hidden="true" />
    <div className="stars stars-one" aria-hidden="true" /><div className="stars stars-two" aria-hidden="true" />
    <div className="scanlines" aria-hidden="true" />
    <header className="topbar"><span className="brand"><span className="brand-orbit">◌</span> U31 <span className="brand-divider">/</span> 临时开放日</span><span className="top-status"><i /> SIGNAL ONLINE <span className="top-clock">· 24H ACCESS</span></span></header>
    <div className="hud-left" aria-hidden="true">COORDINATES // 31° 00′ 00″<br/>SECTOR · EARTH ORBIT</div>
    <div className="hud-right" aria-hidden="true">TRANSMISSION<br/>31 / ASHLEY / 01</div>

    {screen === "signal" && <section className="intro-stage" aria-live="polite"><div className="signal-ring"><span className="signal-core" /></div><p className="eyebrow type-in">未知信号接入……</p><p className="intro-line delay-one">坐标确认。</p><p className="intro-line delay-two">地球访客确认。</p><p className="intro-line delay-three">欢迎进入：</p><h1 className="universe-title delay-four">UNIVERSE <em>31</em></h1><p className="cn-title delay-four">31号宇宙</p><button className="text-link skip-intro" onClick={() => setScreen("warning")}>跳过信号校准 ↗</button></section>}

    {screen === "warning" && <section className="center-panel reveal"><p className="eyebrow">ACCESS NOTICE / 入境提示</p><div className="rule"/><p className="warning-symbol">!</p><h1>本宇宙仅开放 <span className="gold">24 小时</span>。</h1><p className="body-copy">原因：</p><p className="statement">宇宙主人今天生日。</p><button className="main-button" onClick={() => setScreen("entry")}>申请入境 <span>↗</span></button><p className="microcopy">访问许可仅在本次宇宙开放期间有效</p></section>}

    {screen === "entry" && <section className="content-panel entry-panel reveal"><p className="eyebrow">IMMIGRATION CONTROL / U31</p><h1>请选择入境身份<span className="gold">。</span></h1><p className="subcopy">没有标准答案。宇宙暂不核验真实身份。</p><div className="choice-grid identity-grid">{identities.map(([label], i) => <button key={label} className={`choice ${identity === i ? "selected" : ""}`} onClick={() => setIdentity(i)}><span className="choice-index">0{i + 1}</span><span>{label}</span><span className="choice-arrow">↗</span></button>)}</div><button className="main-button" disabled={identity === null} onClick={() => { void syncVisit("enter"); setScreen("approved"); }}>提交身份 <span>→</span></button></section>}

    {screen === "approved" && <section className="center-panel reveal"><p className="eyebrow">IDENTITY VERIFIED / 身份审核通过</p><div className="rule"/><p className="approved-role">{identities[identity || 0][0]}</p><h1 className="approval-copy">{identities[identity || 0][1]}</h1><div className="stamp">APPROVED <span>✓</span></div><button className="main-button" onClick={() => setScreen("map")}>进入宇宙 <span>→</span></button></section>}

    {screen === "map" && <section className="map-stage reveal"><div className="map-heading"><p className="eyebrow">UNIVERSE 31 / STARMAP</p><h1>去哪里看看？</h1><p>选择一颗星球。这里没有正确的游览路线。</p></div><div className="starmap"><div className="orbit orbit-a"/><div className="orbit orbit-b"/><span className="map-center" aria-hidden="true" />{(["if","okay","other","wealth","hole"] as Planet[]).map((p, i) => <button key={p} className={`planet planet-${p} ${visited.includes(p) ? "visited" : ""}`} onClick={() => enterPlanet(p)} aria-label={`进入${names[p]}`}><span className="planet-globe"/><span className="planet-label"><small>0{i + 1} / {p === "hole" ? "RESTRICTED" : "DISCOVER"}</small>{names[p]}{visited.includes(p) && <b> ✓</b>}</span></button>)}{visited.length >= 3 && <button className="planet planet-core" onClick={openCenter}><span className="planet-globe"/><span className="planet-label"><small>NEW SIGNAL</small>宇宙中心</span></button>}</div><div className="map-footer"><span>探索进度 {visited.length} / 3 {visited.length >= 3 ? "· 中心已显现" : "· 宇宙中心尚未定位"}</span><span>点击星球进入</span></div></section>}

    {screen === "if" && <section className="content-panel planet-panel reveal"><button className="back" onClick={backToMap}>← 返回星图</button><p className="eyebrow">PLANET 01 / ALTERNATE TIMELINES</p><h1>如果星</h1><p className="lead">这里存放所有<br/><strong>“如果当时……”</strong></p>{!ifPick ? <><p className="prompt">你想偷看哪一种可能？</p><div className="choice-stack">{ifOptions.map(o => <button className="choice" key={o} onClick={() => { setIfPick(o); setTimeout(() => setIfResult(true), 1800); }}><span>{o === "我没有特别想改的" ? o : `如果当时${o}`}</span><span>↗</span></button>)}</div></> : !ifResult ? <div className="calculation"><span className="loader"/>正在计算另一条时间线……</div> : <div className="narrative-result"><p className="system-fail">计算失败。</p><p>平行宇宙拒绝透露答案。</p><div className="pause-line"/><p>不过那里的你，偶尔也会想：</p><blockquote>“如果当初选了另一条路呢？”</blockquote></div>}</section>}

    {screen === "okay" && <section className="content-panel planet-panel reveal"><button className="back" onClick={backToMap}>← 返回星图</button><p className="eyebrow">PLANET 02 / SOFT LANDING</p><h1>没关系星</h1><p className="lead">这里没有考核，<br/>也不需要交一份完美的今天。</p>{!okayPick ? <><p className="prompt">最近最想听哪一句？</p><div className="choice-stack">{["慢一点也没关系", "做不到也没关系", "还没想明白也没关系"].map(o => <button key={o} className="choice" onClick={() => setOkayPick(o)}><span>{o}</span><span>↗</span></button>)}</div></> : <div className="narrative-result"><p className="soft-quote">{okayPick}。</p><p>宇宙已收到。你可以在这里多待一会儿。</p><span className="small-star">✦</span></div>}</section>}

    {screen === "other" && <section className="content-panel planet-panel reveal"><button className="back" onClick={backToMap}>← 返回星图</button><p className="eyebrow">PLANET 03 / THE OTHER YOU</p><h1>另一个我星</h1><p className="lead">在31号宇宙，每个人都有一个<br/><strong>没有活出来的版本。</strong></p>{!otherPick ? <><p className="prompt">如果完全没人评价你，你最想试一次什么？</p><div className="choice-grid">{otherOptions.map(o => <button key={o} className="choice" onClick={() => setOtherPick(o)}><span>{o}</span><span>↗</span></button>)}</div></> : <div className="narrative-result"><p className="eyebrow">平行世界的你 · 宇宙编号 31-{(otherPick.charCodeAt(0) * 7) % 900 + 100}</p><p className="big-copy">那里的你真的去做了。</p><p>情况没有想象中完美。<br/>但活得还挺有意思。</p>{!scene ? <button className="outline-button" onClick={() => { const options = dayScenes[otherPick] || dayScenes["其他"]; setScene(options[Math.floor(Math.random() * options.length)]); }}>偷看 TA 的一天 ↗</button> : <div className="scene-card"><span>ONE DAY / 另一条时间线</span><p>{scene}</p><button className="text-link" onClick={() => { const options = dayScenes[otherPick] || dayScenes["其他"]; setScene(options.find(x => x !== scene) || options[0]); }}>再看另一天 ↗</button></div>}</div>}</section>}

    {screen === "wealth" && <section className="content-panel planet-panel wealth-panel reveal"><button className="back" onClick={backToMap}>← 返回星图</button><p className="eyebrow">PLANET 04 / MOST VISITED</p><h1>暴富星</h1><p className="lead">欢迎来到整个31号宇宙<br/><strong>访问量最高的星球。</strong></p><div className="coin-field" aria-hidden="true"><span>◉</span><span>◉</span><span>◉</span><span>◉</span><span>◉</span><span>◉</span></div>{wealthStep === 0 ? <button className="main-button" onClick={() => setWealthStep(1)}>领取宇宙财富 <span>↗</span></button> : <div className="wealth-result"><p className="eyebrow">TRANSFER COMPLETED</p><strong>¥8,888,888</strong><p>已到账。账户类型：<b>精神账户</b></p>{wealthStep === 1 ? <button className="outline-button" onClick={() => setWealthStep(2)}>退货</button> : <><p className="refund">不支持退款。</p><div className="lucky-number">今日幸运数字 <b>{lucky}</b></div><p className="microcopy">没有任何科学依据。但你可以信一下。</p></>}</div>}</section>}

    {screen === "hole" && <section className="content-panel planet-panel hole-panel reveal"><button className="back" onClick={backToMap}>← 返回星图</button><p className="eyebrow">PLANET 05 / RESTRICTED AREA</p>{holeStep === 0 ? <><h1>禁止进入的黑洞</h1><p className="lead">里面可能存在一些<br/>你不想面对的东西。</p><button className="outline-button danger" onClick={() => setHoleStep(1)}>仍然进入 →</button></> : holeStep === 1 ? <><p className="hole-question">你最近是不是有一件事情，<br/>明明知道该做，<br/>却一直没有做？</p><div className="binary"><button className="outline-button" onClick={() => { setHoleAnswer(true); setHoleStep(2); }}>有。</button><button className="outline-button" onClick={() => { setHoleAnswer(false); setHoleStep(2); }}>没有。</button></div></> : <div className="hole-answer"><p>{holeAnswer ? <>我不知道是什么。<br/>而且我也不会劝你现在就去做。</> : <>那也很好。<br/>这颗星先替你留着。</>}</p><div className="pause-line"/>{holeStep === 3 && <><p>只是替你记一下。</p><span className="released-star">✦</span><p>等你准备好的时候，<br/>再处理它。</p></>}</div>}</section>}

    {screen === "center" && <section className="center-game reveal"><button className="back" onClick={backToMap}>← 返回星图</button><p className="eyebrow">UNIVERSE CORE / ANOMALY DETECTED</p>{centerStep === 0 ? <><p className="alert-line">宇宙中心正在发生异常</p><div className="cake-frame"><img src="/art/cake.png" alt="四支尚未点亮蜡烛的宇宙生日蛋糕"/></div><p className="investigation">经调查，本宇宙今日出现的所有异常，<br/>均由以下事件引起：</p><h1>Ashley 又长大了一岁。</h1><button className="main-button" onClick={() => setCenterStep(1)}>协助稳定宇宙 <span>→</span></button></> : <><div className={`cake-frame ${centerStep === 2 ? "lit" : ""}`} style={{"--hold": `${hold}%`} as React.CSSProperties}><img src="/art/cake.png" alt="宇宙生日蛋糕"/><div className="candle-lights" style={{ opacity: centerStep === 2 ? 1 : hold / 100 }}><i/><i/><i/><i/></div></div>{centerStep === 1 ? <><h1>点亮蜡烛</h1><p className="prompt">长按下方按钮 3 秒，让宇宙慢慢亮起来。</p><button className="hold-button" style={{"--hold": `${hold}%`} as React.CSSProperties} onPointerDown={beginHold} onPointerUp={stopHold} onPointerLeave={stopHold} onPointerCancel={stopHold} onContextMenu={(e) => e.preventDefault()}>按住，直到星光充满 <span>{Math.ceil(hold)}%</span></button></> : <><h1>宇宙暂时稳定了。</h1><p className="prompt">根据31号宇宙传统，寿星不能独占愿望。</p><button className="main-button" onClick={() => setScreen("wishes")}>分配生日愿望 <span>→</span></button></>}</>}</section>}

    {screen === "wishes" && <section className="content-panel wish-panel reveal"><p className="eyebrow">WISH EXCHANGE / 宇宙传统</p><h1>今天这个愿望，<br/><em>一人一半。</em></h1><p className="prompt">{wishAshley ? "第二半：给自己留一个。" : "第一半：给寿星一个愿望。"}</p><div className="wish-grid">{wishes.map(w => <button key={w} className={`wish-choice ${wishAshley === w ? "selected" : ""}`} onClick={() => wishAshley ? void finishWish(w) : setWishAshley(w)}>{w}<span>✦</span></button>)}</div><div className="wish-progress"><span className={wishAshley ? "done" : ""}>01 给 Ashley {wishAshley || "待选择"}</span><span className={wishSelf ? "done" : ""}>02 给自己 {wishSelf || "待选择"}</span></div></section>}

    {screen === "ending" && <section className="ending-stage reveal"><p className="eyebrow">TRANSACTION COMPLETED / 交易完成</p><div className="wish-stars" aria-hidden="true"><span>✦</span><span>✦</span></div><h1>两颗星，<br/>一颗给你，一颗给我。</h1><div className="receipts"><p>Ashley 获得 <strong>{wishAshley} ×1</strong></p><p>你获得 <strong>{wishSelf} ×1</strong></p></div><p className="microcopy">实际到账时间未知。请耐心等待宇宙处理。</p><div className="ending-rule"/><p className="visitor-number">你的宇宙访问编号：<strong>{formatId(visitorId)}</strong></p><p>在你之前，已有 <b>{Math.max(visitorTotal - 1, 0)}</b> 个生命体来过。</p><p className="count-label">他们共同为这个宇宙留下了：</p><div className="counts">{["勇气","好运","钱","睡眠","爱"].map(w => <span key={w}>{w} <b>× {counts[w] || 0}</b></span>)}</div><p className="final-line">你也已经成为31号宇宙今天发生过的一件小事。</p>{saveError && <button className="text-link" onClick={() => void syncVisit("wish", wishAshley || "", wishSelf || "")}>{saveError} 点击重试 ↗</button>}<button className="main-button" onClick={() => setScreen("exit")}>离开宇宙 <span>→</span></button></section>}

    {screen === "exit" && <section className="exit-stage"><div className="exit-point">✦</div><p>信号已断开。</p><h1>有空再来宇宙坐坐。</h1><button className="text-link" onClick={() => setScreen("map")}>返回星图 ↗</button></section>}
    <footer className="footer"><span>UNIVERSE 31 · TEMPORARY OPEN DAY</span><span>EST. TODAY / FOR ASHLEY</span></footer>
  </main>;
}
