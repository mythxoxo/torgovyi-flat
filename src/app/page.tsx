"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';

const translations = {
  en: {
    nav: { join: 'Join Community', about: 'About', features: 'Features', roadmap: 'Roadmap', faq: 'FAQ' },
    hero: {
      badge: 'TON-native market culture',
      title: 'Trade sharper. Move faster. Build the next TON legend.',
      subtitle:
        'A dark, high-signal TON hub for degen communities — built for market momentum, live TON stats, and Telegram-native growth.',
      primary: 'Join Community',
      secondary: 'Read Litepaper',
      countdown: 'Countdown to next phase'
    },
    about: {
      title: 'About the project',
      body:
        'TONK is a TON ecosystem for communities that want more than a static token page. We turn hype into structure: trading rails, community loops, live stats, and a route from testnet chaos to mainnet conviction.'
    },
    stats: {
      members: 'Community members',
      volume: 'Testnet volume',
      launch: 'Public phase'
    },
    features: {
      title: 'Built for serious degens',
      items: [
        {
          title: 'Telegram-first market flow',
          text: 'Fast onboarding, zero friction handoff from social hype to onchain action.'
        },
        {
          title: 'Market-grade dashboards',
          text: 'Track bonding progress, TON liquidity, and trading heat without fake vanity metrics.'
        },
        {
          title: 'Dual-mode rollout',
          text: 'Ship in testnet, validate community behavior, then escalate to mainnet with confidence.'
        },
        {
          title: 'Meme energy, real structure',
          text: 'Brand, token utility, and community loops designed to survive after the first hype candle.'
        }
      ]
    },
    roadmap: {
      title: 'Roadmap',
      stages: [
        { title: 'Testnet', text: 'Closed testers, wallet flows, product mechanics, stress testing.', current: true },
        { title: 'Audit', text: 'Security review, readiness checklist, treasury and contract hardening.' },
        { title: 'Mainnet', text: 'Public phase, partner campaigns, live liquidity and community scaling.' }
      ]
    },
    join: {
      title: 'How to join',
      steps: [
        { title: 'Join the Telegram', text: 'Get the earliest alpha, market alerts, and community coordination.' },
        { title: 'Connect your TON wallet', text: 'Be ready for testnet tasks, snapshots, and participation.' },
        { title: 'Watch the market board', text: 'Track roadmap updates, the TON price pulse, and the countdown.' }
      ]
    },
    faq: {
      title: 'FAQ',
      items: [
        { q: 'Is this already on mainnet?', a: 'No. The current phase is testnet-first. Mainnet comes after testing, feedback, and audit.' },
        { q: 'Why TON?', a: 'Fast finality, Telegram-native distribution, and a user base that actually moves onchain.' },
        { q: 'What makes this different?', a: 'It is built around market intensity: community loops, momentum visibility, and a brand that feels alive instead of corporate.' },
        { q: 'How do I prepare?', a: 'Join Telegram, connect a TON wallet, follow updates, and be ready before the countdown ends.' }
      ]
    },
    footer: {
      disclaimer: 'Currently on Testnet',
      socials: ['Telegram', 'X / Twitter', 'Docs']
    }
  },
  ru: {
    nav: { join: 'Войти', about: 'О проекте', features: 'Фичи', roadmap: 'Роадмап', faq: 'FAQ' },
    hero: {
      badge: 'TON-native market culture',
      title: 'Запускай жёстче. Торгуй быстрее. Собери следующую легенду TON.',
      subtitle:
        'Тёмный, агрессивный TON-хаб для комьюнити — под живой рыночный импульс и Telegram-native рост.',
      primary: 'Вступить в комьюнити',
      secondary: 'Открыть litepaper',
      countdown: 'Обратный отсчёт до следующей фазы'
    },
    about: {
      title: 'О проекте',
      body:
        'TONK — это экосистема для комьюнити, которым мало статичной токен-страницы. Мы превращаем хайп в структуру: market rails, комьюнити-рельсы, живые метрики и путь от тестнета к mainnet.'
    },
    stats: {
      members: 'Участников в комьюнити',
      volume: 'Объём в тестнете',
      launch: 'Публичная фаза'
    },
    features: {
      title: 'Сделано для сильных дегенов',
      items: [
        {
          title: 'Telegram-first market flow',
          text: 'Быстрый онбординг и почти нулевое трение между хайпом и ончейн-действием.'
        },
        {
          title: 'Маркет-уровень дашбордов',
          text: 'Следи за bonding progress, TON-ликвидностью и торговой температурой без фейковых vanity metrics.'
        },
        {
          title: 'Двухэтапный rollout',
          text: 'Сначала testnet, затем валидация поведения комьюнити, потом — осознанный mainnet.'
        },
        {
          title: 'Мем-энергия, но с каркасом',
          text: 'Бренд, utility и community loops, которые не умирают после первой свечи хайпа.'
        }
      ]
    },
    roadmap: {
      title: 'Роадмап',
      stages: [
        { title: 'Testnet', text: 'Закрытые тестеры, wallet flows, продуктовые механики, стресс-тест.', current: true },
        { title: 'Audit', text: 'Security review, readiness checklist, укрепление treasury и контрактов.' },
        { title: 'Mainnet', text: 'Публичная фаза, партнёрские кампании, живая ликвидность и рост комьюнити.' }
      ]
    },
    join: {
      title: 'Как зайти',
      steps: [
        { title: 'Зайди в Telegram', text: 'Получай раннюю альфу, рыночные алерты и координацию комьюнити.' },
        { title: 'Подключи TON-кошелёк', text: 'Будь готов к testnet-задачам, snapshot’ам и участию.' },
        { title: 'Следи за market board', text: 'Смотри обновления роадмапа, пульс TON и обратный отсчёт.' }
      ]
    },
    faq: {
      title: 'FAQ',
      items: [
        { q: 'Это уже mainnet?', a: 'Нет. Сейчас проект в testnet-фазе. Mainnet будет после тестов, фидбека и аудита.' },
        { q: 'Почему именно TON?', a: 'Быстрый finality, Telegram-native дистрибуция и аудитория, которая реально двигает ончейн.' },
        { q: 'Чем это отличается?', a: 'Фокус на market intensity: циклы комьюнити, видимый импульс и бренд, который ощущается живым.' },
        { q: 'Как подготовиться?', a: 'Зайди в Telegram, подключи TON-кошелёк, следи за апдейтами и будь готов до нуля таймера.' }
      ]
    },
    footer: {
      disclaimer: 'Сейчас проект в Testnet',
      socials: ['Telegram', 'X / Twitter', 'Docs']
    }
  }
};

const faqIds = ['faq-1', 'faq-2', 'faq-3', 'faq-4'];
const statsConfig = [
  { key: 'members' as const, target: 18240, suffix: '+' },
  { key: 'volume' as const, target: 943, suffix: ' TON' },
  { key: 'launch' as const, target: 1, suffix: ' Sep' }
];

const visuals = {
  hero: '/brand/img_01.jpg',
  about: '/brand/img_05.jpg',
  join: '/brand/img_08.jpg'
};

function useIntersectionAnimation() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll('[data-reveal]'));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.18 }
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
}

function useTonPrice() {
  const [price, setPrice] = useState<{ usd: number | null; change: number | null; error: boolean }>({ usd: null, change: null, error: false });

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd&include_24hr_change=true'
        );
        const json = await res.json();
        if (!alive) return;
        setPrice({
          usd: json['the-open-network']?.usd ?? null,
          change: json['the-open-network']?.usd_24h_change ?? null,
          error: false
        });
      } catch {
        if (!alive) return;
        setPrice((prev) => ({ ...prev, error: true }));
      }
    };
    load();
    const interval = setInterval(load, 30000);
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, []);

  return price;
}

function useLaunchCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(targetDate).getTime();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

function useCountUp(target: number, visible: boolean, duration = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = Math.max(1, Math.ceil(target / (duration / 16)));
    const interval = setInterval(() => {
      start += step;
      if (start >= target) {
        setValue(target);
        clearInterval(interval);
      } else {
        setValue(start);
      }
    }, 16);
    return () => clearInterval(interval);
  }, [target, visible, duration]);

  return value;
}

function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rx = ((y / rect.height) - 0.5) * -10;
    const ry = ((x / rect.width) - 0.5) * 12;
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)';
  };

  return (
    <div ref={ref} onMouseMove={handleMove} onMouseLeave={reset} className={`tilt-card ${className}`}>
      {children}
    </div>
  );
}

function ParticlesCanvas() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let frame: number;
    let particles: Array<{ x: number; y: number; r: number; vx: number; vy: number }> = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      particles = Array.from({ length: 28 }).map((): { x: number; y: number; r: number; vx: number; vy: number } => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.3,
        vy: Math.random() * -0.4 - 0.1
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        ctx.beginPath();
        ctx.fillStyle = p.r > 2 ? 'rgba(0,152,234,0.85)' : 'rgba(255,255,255,0.5)';
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      frame = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={ref} className="hero-particles" />;
}

export default function TonLandingArtifact() {
  const [lang, setLang] = useState<'en' | 'ru'>('en');
  const [openFaq, setOpenFaq] = useState<number>(0);
  const statsRef = useRef<HTMLDivElement | null>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const price = useTonPrice();
  const countdown = useLaunchCountdown('2026-09-01T00:00:00Z');

  useIntersectionAnimation();

  useEffect(() => {
    const stored = localStorage.getItem('tonk-lang');
    if (stored === 'en' || stored === 'ru') setLang(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem('tonk-lang', lang);
  }, [lang]);

  useEffect(() => {
    if (!statsRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStatsVisible(true);
      },
      { threshold: 0.2 }
    );
    observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const t = translations[lang];
  const statValues = statsConfig.map((item) => useCountUp(item.target, statsVisible));
  const tonChangePositive = (price.change ?? 0) >= 0;

  return (
    <div className="tonk-artifact">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700;800&family=IBM+Plex+Mono:wght@400;700&display=swap');
        :root {
          --bg: #06111a;
          --surface: rgba(15, 26, 38, 0.72);
          --surface-strong: rgba(19, 33, 48, 0.9);
          --text: #eef6fb;
          --muted: #9fb5c4;
          --line: rgba(255,255,255,0.08);
          --ton: #0098EA;
          --green: #2fe1a8;
          --red: #ff6b7d;
        }
        * { box-sizing: border-box; }
        body { margin: 0; background: radial-gradient(circle at top, rgba(0,152,234,0.12), transparent 35%), #06111a; }
        .tonk-artifact { color: var(--text); font-family: 'Outfit', sans-serif; background: linear-gradient(180deg,#07111b 0%, #06111a 100%); min-height: 100vh; }
        .container { width: min(1180px, calc(100% - 32px)); margin: 0 auto; }
        .glass { background: var(--surface); border: 1px solid var(--line); backdrop-filter: blur(16px); box-shadow: 0 20px 60px rgba(0,0,0,0.24); }
        .sticky-nav { position: sticky; top: 0; z-index: 30; backdrop-filter: blur(18px); background: rgba(6,17,26,0.76); border-bottom: 1px solid var(--line); }
        .nav-inner { display:flex; align-items:center; justify-content:space-between; min-height:72px; gap:20px; }
        .brand { display:flex; align-items:center; gap:12px; }
        .brand-mark { width:40px; height:40px; border-radius:14px; display:grid; place-items:center; font-weight:800; background: linear-gradient(135deg, rgba(0,152,234,0.18), rgba(47,225,168,0.2)); border:1px solid rgba(0,152,234,0.4); box-shadow: 0 0 30px rgba(0,152,234,0.2); }
        .brand-title { font-size: 1.05rem; font-weight: 800; letter-spacing: 0.08em; }
        .ton { color: var(--ton); }
        .nav-tools { display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
        .price-pill, .lang-switch, .join-btn, .pill { border-radius: 999px; }
        .price-pill { display:flex; align-items:center; gap:10px; padding:10px 14px; background: rgba(255,255,255,0.03); border:1px solid var(--line); font-size: 0.9rem; }
        .pulse-dot { width:10px; height:10px; border-radius:999px; background: var(--green); box-shadow:0 0 0 rgba(47,225,168,0.4); animation:pulse 1.6s infinite; }
        .lang-switch { display:flex; overflow:hidden; border:1px solid var(--line); background: rgba(255,255,255,0.03); }
        .lang-switch button { padding:10px 14px; background:transparent; color:var(--muted); border:none; cursor:pointer; font-weight:700; }
        .lang-switch button.active { background: rgba(0,152,234,0.18); color: white; }
        .join-btn { padding: 11px 18px; background: linear-gradient(135deg, #0098EA, #19b8ff); color:#03111a; border:none; font-weight:800; cursor:pointer; }
        .hero { position:relative; padding:72px 0 32px; overflow:hidden; }
        .hero-grid { display:grid; grid-template-columns: 1.15fr 0.85fr; gap:28px; align-items:center; }
        .hero-copy { position:relative; z-index:2; }
        .eyebrow { display:inline-flex; gap:10px; align-items:center; padding:8px 12px; border-radius:999px; border:1px solid rgba(0,152,234,0.3); background: rgba(0,152,234,0.1); font-size:0.8rem; text-transform:uppercase; letter-spacing:0.1em; }
        h1 { font-size: clamp(3rem, 7vw, 6rem); line-height: 0.94; margin:18px 0 16px; letter-spacing:-0.04em; }
        .hero-sub { max-width: 600px; font-size:1.05rem; line-height:1.75; color: var(--muted); }
        .hero-actions { display:flex; gap:14px; flex-wrap:wrap; margin-top:28px; }
        .btn-main, .btn-secondary { padding:14px 22px; border-radius:16px; border:none; cursor:pointer; font-weight:800; }
        .btn-main { background: linear-gradient(135deg, #0098EA, #37c2ff); color:#04131e; }
        .btn-secondary { background: rgba(255,255,255,0.03); color:var(--text); border:1px solid var(--line); }
        .hero-side { position:relative; min-height: 420px; }
        .hero-particles { position:absolute; inset:0; width:100%; height:100%; pointer-events:none; }
        .hero-visual { position:absolute; inset:0; border-radius:28px; overflow:hidden; }
        .hero-visual img { width:100%; height:100%; object-fit:cover; filter: saturate(1.08) contrast(1.02); }
        .hero-overlay { position:absolute; inset:0; background: linear-gradient(180deg, rgba(6,17,26,0.08), rgba(6,17,26,0.8)); }
        .countdown { display:grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap:12px; margin-top:28px; }
        .time-box { padding:16px; border-radius:18px; }
        .time-box strong { display:block; font-size:1.7rem; }
        .section { padding: 70px 0; }
        .section-grid { display:grid; grid-template-columns: 0.95fr 1.05fr; gap:24px; align-items:center; }
        .image-card img { width:100%; height:100%; min-height:320px; object-fit:cover; display:block; }
        .stats { display:grid; grid-template-columns: repeat(3, 1fr); gap:16px; margin-top:26px; }
        .stat { padding:18px; border-radius:18px; }
        .stat strong { display:block; font-size:2rem; margin-bottom:6px; }
        .cards-grid { display:grid; grid-template-columns: repeat(4, 1fr); gap:16px; }
        .tilt-card { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .feature-card { min-height:220px; padding:22px; border-radius:22px; }
        .feature-card h3 { margin:0 0 12px; font-size:1.1rem; }
        .roadmap { display:grid; grid-template-columns: repeat(3, 1fr); gap:16px; }
        .roadmap-step { padding:22px; border-radius:20px; position:relative; }
        .roadmap-step.current { border-color: rgba(47,225,168,0.3); box-shadow: 0 0 0 1px rgba(47,225,168,0.08); }
        .join-grid { display:grid; grid-template-columns: 0.88fr 1.12fr; gap:24px; align-items:center; }
        .steps { display:grid; gap:14px; }
        .step { padding:18px; border-radius:18px; display:flex; gap:14px; }
        .step-num { width:34px; height:34px; border-radius:12px; display:grid; place-items:center; background: rgba(0,152,234,0.18); color:var(--ton); font-weight:800; flex-shrink:0; }
        .faq-list { display:grid; gap:12px; }
        .faq-item { border-radius:18px; overflow:hidden; }
        .faq-trigger { width:100%; background:transparent; color:var(--text); border:none; display:flex; justify-content:space-between; align-items:center; padding:18px; text-align:left; cursor:pointer; font-weight:700; }
        .faq-content { padding:0 18px 18px; color:var(--muted); line-height:1.7; }
        .footer { padding:32px 0 56px; border-top:1px solid var(--line); }
        .footer-row { display:flex; justify-content:space-between; gap:16px; flex-wrap:wrap; align-items:center; }
        .socials { display:flex; gap:12px; flex-wrap:wrap; }
        .socials a { color:var(--text); text-decoration:none; padding:10px 14px; border:1px solid var(--line); border-radius:999px; background:rgba(255,255,255,0.03); }
        [data-reveal] { opacity: 0; transform: translateY(28px); transition: opacity 0.7s ease, transform 0.7s ease; }
        [data-reveal].revealed { opacity: 1; transform: translateY(0); }
        @keyframes pulse { 0% { box-shadow:0 0 0 0 rgba(47,225,168,0.35); } 70% { box-shadow:0 0 0 14px rgba(47,225,168,0); } 100% { box-shadow:0 0 0 0 rgba(47,225,168,0); } }
        @media (max-width: 980px) {
          .hero-grid, .section-grid, .join-grid { grid-template-columns: 1fr; }
          .cards-grid { grid-template-columns: repeat(2, 1fr); }
          .roadmap { grid-template-columns: 1fr; }
          .stats { grid-template-columns: 1fr; }
          .nav-inner { align-items:flex-start; padding: 12px 0; }
        }
        @media (max-width: 640px) {
          .container { width: calc(100% - 20px); }
          .cards-grid { grid-template-columns: 1fr; }
          .countdown { grid-template-columns: repeat(2, 1fr); }
          h1 { font-size: 2.4rem; }
          .price-pill { width: 100%; justify-content: center; }
          .nav-tools { width: 100%; }
          .hero { padding-top: 28px; }
          .hero-grid { gap: 16px; }
          .hero-side { min-height: 220px; }
          .hero-visual { position: relative; height: 220px; }
          .section { padding: 44px 0; }
          .section-grid, .join-grid { gap: 16px; }
          .image-card img { min-height: 220px; }
          .time-box { padding: 12px; }
          .time-box strong { font-size: 1.25rem; }
        }
      `}</style>

      <header className="sticky-nav">
        <div className="container nav-inner">
          <div className="brand">
            <div className="brand-mark">T</div>
            <div>
              <div className="brand-title">TONK<span className="ton">.MEM</span></div>
              <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Trade. Meme. Earn.</div>
            </div>
          </div>
          <div className="nav-tools">
            <div className="price-pill glass">
              <span className="pulse-dot" />
              <span>TON</span>
              <strong>
                {price.usd ? `$${price.usd.toFixed(2)}` : 'Loading...'}
              </strong>
              <span style={{ color: tonChangePositive ? 'var(--green)' : 'var(--red)' }}>
                {price.change !== null ? `${tonChangePositive ? '+' : ''}${price.change.toFixed(2)}%` : '--'}
              </span>
            </div>
            <div className="lang-switch glass">
              <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
              <button className={lang === 'ru' ? 'active' : ''} onClick={() => setLang('ru')}>RU</button>
            </div>
            <button className="join-btn">{t.nav.join}</button>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy" data-reveal>
            <div className="eyebrow glass">{t.hero.badge}</div>
            <h1>{t.hero.title}</h1>
            <p className="hero-sub">{t.hero.subtitle}</p>
            <div className="hero-actions">
              <button className="btn-main">{t.hero.primary}</button>
              <button className="btn-secondary">{t.hero.secondary}</button>
            </div>
            <div className="countdown">
              {[
                ['D', countdown.days],
                ['H', countdown.hours],
                ['M', countdown.minutes],
                ['S', countdown.seconds]
              ].map(([label, value]) => (
                <div key={label} className="time-box glass">
                  <strong>{String(value).padStart(2, '0')}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-side" data-reveal>
            <ParticlesCanvas />
            <div className="hero-visual glass">
              <img src={visuals.hero} alt="TON project visual" />
              <div className="hero-overlay" />
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container section-grid">
          <div className="image-card glass" data-reveal>
            <img src={visuals.about} alt="About visual" />
          </div>
          <div data-reveal>
            <div className="eyebrow glass">{t.nav.about}</div>
            <h2 style={{ fontSize: '2.4rem', margin: '18px 0 14px' }}>{t.about.title}</h2>
            <p style={{ color: 'var(--muted)', lineHeight: 1.8 }}>{t.about.body}</p>
            <div className="stats" ref={statsRef}>
              {statsConfig.map((item, idx) => (
                <div key={item.key} className="stat glass">
                  <strong>{statValues[idx]}{item.suffix}</strong>
                  <span>{t.stats[item.key]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container" data-reveal>
          <div className="eyebrow glass">{t.nav.features}</div>
          <h2 style={{ fontSize: '2.4rem', margin: '18px 0 20px' }}>{t.features.title}</h2>
          <div className="cards-grid">
            {t.features.items.map((item, idx) => (
              <TiltCard key={item.title} className="feature-card glass">
                <div style={{ fontSize: '2rem', marginBottom: '18px' }}>{['✦', '⬢', '◉', '⚡'][idx]}</div>
                <h3>{item.title}</h3>
                <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>{item.text}</p>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container" data-reveal>
          <div className="eyebrow glass">{t.nav.roadmap}</div>
          <h2 style={{ fontSize: '2.4rem', margin: '18px 0 20px' }}>{t.roadmap.title}</h2>
          <div className="roadmap">
            {t.roadmap.stages.map((stage) => (
              <div key={stage.title} className={`roadmap-step glass ${stage.current ? 'current' : ''}`}>
                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: stage.current ? 'var(--green)' : 'var(--muted)' }}>
                  {stage.current ? 'Current stage' : 'Stage'}
                </div>
                <h3 style={{ margin: '10px 0 8px', fontSize: '1.35rem' }}>{stage.title}</h3>
                <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>{stage.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container join-grid">
          <div className="image-card glass" data-reveal>
            <img src={visuals.join} alt="How to join visual" />
          </div>
          <div data-reveal>
            <div className="eyebrow glass">{t.nav.join}</div>
            <h2 style={{ fontSize: '2.4rem', margin: '18px 0 20px' }}>{t.join.title}</h2>
            <div className="steps">
              {t.join.steps.map((step, idx) => (
                <div key={step.title} className="step glass">
                  <div className="step-num">{idx + 1}</div>
                  <div>
                    <h3 style={{ margin: '0 0 8px', fontSize: '1.05rem' }}>{step.title}</h3>
                    <p style={{ color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container" data-reveal>
          <div className="eyebrow glass">{t.nav.faq}</div>
          <h2 style={{ fontSize: '2.4rem', margin: '18px 0 20px' }}>{t.faq.title}</h2>
          <div className="faq-list">
            {t.faq.items.map((item, idx) => (
              <div key={faqIds[idx]} className="faq-item glass">
                <button className="faq-trigger" onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}>
                  <span>{item.q}</span>
                  <span>{openFaq === idx ? '−' : '+'}</span>
                </button>
                {openFaq === idx ? <div className="faq-content">{item.a}</div> : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-row">
          <div>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>TONK.MEM</div>
            <div style={{ color: 'var(--muted)' }}>{t.footer.disclaimer}</div>
          </div>
          <div className="socials">
            {t.footer.socials.map((item) => (
              <a key={item} href="#">{item}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
