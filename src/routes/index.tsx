import { createFileRoute } from "@tanstack/react-router";
// sync: force redeploy 2026-07-19
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Gift,
  Heart,
  Salad,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import nutribabyHeroAsset from "@/assets/nutribaby-hero.jpeg.asset.json";
import maePreparandoAsset from "@/assets/mae-preparando.png.asset.json";
import verdadeIAAsset from "@/assets/verdade-introducao-alimentar.jpeg.asset.json";
import logoAsset from "@/assets/nutribaby-logo-full.webp.asset.json";
import kitMockupAsset from "@/assets/kit-completo-mockup.webp.asset.json";
import guiaMockupAsset from "@/assets/guia-essencial-mockup.webp.asset.json";
import garantiaAsset from "@/assets/15-dias-garantia.jpeg.asset.json";

// Novas importações de ativos para as seções de dor
const EXAUSTA_IMG = "/assets/exausta-2.png";
const ENGASGO_IMG = "/assets/medo_de_engasgo.png";
const DUVIDA_IMG = "/assets/duvida.png";
const COMPARACAO_IMG = "/assets/comparacao.png";
const RECUSA_IMG = "/assets/recusa_alimentar.png";

const HERO_IMG = nutribabyHeroAsset.url;
const MAE_PREPARANDO_IMG = maePreparandoAsset.url;
const VERDADE_IA_IMG = verdadeIAAsset.url;
const LOGO_IMG = logoAsset.url;
const KIT_COMPLETO_IMG = kitMockupAsset.url;
const GUIA_ESSENCIAL_IMG = guiaMockupAsset.url;
const GARANTIA_IMG = garantiaAsset.url;

import guiaEssencialImg from "@/assets/guia-essencial-novo.png";
const GUIA_ESSENCIAL_LEGACY_IMG = guiaEssencialImg;

const whatsappProofs: string[] = [
  "/depoimento-a.webp",
  "/depoimento-b.webp",

  "/depoimento-c.webp",
  "/depoimento-d.webp",
  "/depoimento-e.webp",
  "/depoimento-f.webp",
];

// Checkouts
const ESSENCIAL_URL = "https://pay.cakto.com.br/h7uxhim_976264"; // R$ 14,90
const KIT_URL = "https://pay.cakto.com.br/antx4kt_976228"; // R$ 27,00
const KIT_PROMO_URL = "https://pay.cakto.com.br/sfhanyo_976268"; // R$ 21,90 (não exibido)

/* ───────────────────────────── Utils ───────────────────────────── */

function track(name: string, data?: Record<string, unknown>) {
  try {
    // Meta Pixel
    // @ts-expect-error fbq global
    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      // @ts-expect-error fbq global
      window.fbq("trackCustom", name, data || {});
    }
    // dataLayer
    // @ts-expect-error dl global
    window.dataLayer = window.dataLayer || [];
    // @ts-expect-error dl global
    window.dataLayer.push({ event: name, ...(data || {}) });
  } catch {
    /* noop */
  }
}

function scrollToOffers() {
  const el = document.getElementById("escolher-oferta");
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 72;
  window.scrollTo({ top: y, behavior: "smooth" });
  track("scroll_to_offers");
}

/* Sanitiza links Cakto: remove UTMs vazios */
function CaktoLinkSanitizer() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest?.("a") as HTMLAnchorElement | null;
      if (!target) return;
      const href = target.getAttribute("href") || "";
      if (!href.includes("cakto.com.br")) return;
      try {
        const url = new URL(target.href, window.location.origin);
        const toDel: string[] = [];
        url.searchParams.forEach((v, k) => {
          if (!v || v.trim() === "") toDel.push(k);
        });
        toDel.forEach((k) => url.searchParams.delete(k));
        target.href = url.toString();
      } catch {
        /* noop */
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}

/* ───────────────────────────── Route ───────────────────────────── */

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title:
          "NutriBaby — Receitas práticas e organização para a introdução alimentar",
      },
      {
        name: "description",
        content:
          "Receitas, cardápios, lista de compras e guia visual de cortes reunidos em um único lugar. Consulte pelo celular e tenha ideias práticas para a rotina do bebê.",
      },
      { property: "og:title", content: "NutriBaby — Praticidade na introdução alimentar" },
      {
        property: "og:description",
        content:
          "Ideias organizadas para saber o que preparar, variar as refeições e planejar as compras.",
      },
      { property: "og:image", content: HERO_IMG },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: HERO_IMG },
    ],
  }),
  component: Landing,
});

/* ───────────────────────────── Layout ───────────────────────────── */

function Landing() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <UrgencyBar />
      <Nav />
      <HeroVideo />
      <IntroductionTruth />
      <Hero />
      <TrustBar />
      <Identification />
      <Fears />
      
      <HowItWorks />
      <Benefits />
      <SocialProof />
      <Offers />
      <GuaranteeImage />
      <Guarantee />
      <FAQ />
      <FinalCta />
      <Footer />
      <MobileStickyBar />
      <UpgradePopup />
      <ExitIntentPopup />
      <SalesPopup />
      <CaktoLinkSanitizer />
    </div>
  );
}

/* ───────────────────────────── Urgency bar ───────────────────────────── */

function UrgencyBar() {
  const [timeLeft, setTimeLeft] = useState<{ h: string; m: string; s: string } | null>(null);

  useEffect(() => {
    const KEY = "nb_urgency_deadline_15";
    let deadline = Number(localStorage.getItem(KEY));
    const now = Date.now();
    if (!deadline || deadline < now) {
      deadline = now + 15 * 60 * 1000; // 15 minutos
      localStorage.setItem(KEY, String(deadline));
    }
    const tick = () => {
      const diff = Math.max(0, deadline - Date.now());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({
        h: String(h).padStart(2, "0"),
        m: String(m).padStart(2, "0"),
        s: String(s).padStart(2, "0"),
      });
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative z-50 overflow-hidden bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white shadow-[0_2px_15px_rgba(220,38,38,0.5)]">
      <div className="pointer-events-none absolute inset-0 animate-[pulse_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="container-page relative flex items-center justify-center gap-x-2 px-3 py-1.5 text-center text-[10px] font-extrabold uppercase tracking-tighter sm:gap-x-3 sm:py-2 sm:text-[12px] sm:tracking-wide">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-300 opacity-80" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-yellow-300 shadow-[0_0_8px_rgba(253,224,71,0.8)]" />
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-yellow-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">🔥 Oferta Exclusiva: 70% OFF</span>
          <span className="hidden opacity-40 sm:inline">|</span>
          <span className="flex items-center gap-1">
            <span className="text-[9px] opacity-90 sm:text-[11px]">Expira em:</span>
            <span className="inline-flex min-w-[65px] items-center justify-center gap-0.5 rounded-sm bg-black/40 px-1.5 py-0.5 font-mono text-[11px] tabular-nums tracking-widest text-yellow-300 shadow-[inset_0_1px_4px_rgba(0,0,0,0.3)] sm:min-w-[85px] sm:text-[14px]">
              {timeLeft ? `${timeLeft.h}:${timeLeft.m}:${timeLeft.s}` : "15:00"}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────── Nav ───────────────────────────── */

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="container-page flex h-14 items-center justify-center gap-3 sm:h-16">
        <a href="#top" className="flex items-center gap-2">
          <img src={LOGO_IMG} alt="NutriBaby" className="h-7 w-auto sm:h-9" />
        </a>
      </div>
    </header>
  );
}

/* ───────────────────────────── Hero Video ───────────────────────────── */

function HeroVideo() {
  return (
    <section className="relative bg-background pt-4 pb-0 sm:pt-8">
      <div className="container-page">
        <div className="mx-auto max-w-2xl">
          <div className="mb-3 text-center sm:mb-4">
            <p className="text-[12px] font-semibold text-foreground/80 sm:text-sm">
              Chega de medo e insegurança! Descubra o prazer de nutrir seu bebê com confiança.
            </p>
            <h1 className="mt-1.5 font-serif text-[22px] font-bold leading-[1.15] text-foreground sm:text-3xl">
              GUIA DEFINITIVO DA INTRODUÇÃO ALIMENTAR SEGURA
            </h1>
            <p className="mt-2 text-[13px] leading-snug text-[color:var(--cta)] sm:text-[15px]">
              O passo a passo completo que transforma a{" "}
              <span className="font-bold">INTRODUÇÃO ALIMENTAR</span> em um momento{" "}
              <span className="font-bold">Leve, Seguro e Organizado</span>
            </p>
            <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-foreground sm:text-xs">
              Mamãe, chega de confusão na hora de alimentar seu bebê!
            </p>
          </div>
          <div className="soft-shadow -mx-4 overflow-hidden rounded-2xl border border-border bg-card sm:mx-0">
            <div className="relative w-full aspect-video">

              <iframe
                src="https://www.youtube.com/embed/70tlclIadc8?rel=0&modestbranding=1&playsinline=1"
                title="Protocolo NutriBaby — apresentação"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </div>
          <div className="mt-4 flex flex-col items-center gap-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-foreground sm:text-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                157 pessoas estão assistindo agora
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-xs">
                Assista ao vídeo acima
              </p>
            </div>

            <button
              onClick={() => {
                const el = document.getElementById("introduction-truth");
                if (el) {
                  const y = el.getBoundingClientRect().top + window.scrollY - 80;
                  window.scrollTo({ top: y, behavior: "smooth" });
                }
              }}
              className="group relative flex w-full max-w-sm flex-col items-center justify-center gap-1.5 rounded-2xl bg-white px-6 py-5 font-bold text-foreground border-2 border-emerald-100 shadow-[0_10px_30px_rgba(16,185,129,0.1)] transition-all hover:scale-[1.02] hover:border-emerald-200 hover:shadow-[0_15px_35px_rgba(16,185,129,0.15)] active:scale-[0.98]"
            >
              <div className="flex items-center gap-2 text-lg text-emerald-700">
                <span>VEJA COMO SIMPLIFICAR SUA ROTINA</span>
                <ChevronDown className="h-5 w-5 animate-bounce" />
              </div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground opacity-90">
                Entenda como o guia resolve os desafios do dia a dia
              </span>
            </button>
          </div>
        </div>
      </div>
      {/* Transição suave entre o vídeo e o Hero */}
      <div aria-hidden className="pointer-events-none mt-8 h-16 bg-gradient-to-b from-background to-transparent sm:mt-12 sm:h-20" />
    </section>
  );
}

/* ───────────────────────── Introduction truth ───────────────────────── */

function IntroductionTruth() {
  const painPoints = [
    {
      icon: Clock3,
      title: "Rotina exaustiva",
      text: "A falta de ideias e o estresse na cozinha fazem você pensar todos os dias: ‘O que vou oferecer hoje?’",
    },
    {
      icon: CircleHelp,
      title: "Dúvidas constantes",
      text: "Será que ainda é cedo para o meu bebê comer isso? Qual é a quantidade certa para cada fase?",
    },
    {
      icon: ShieldAlert,
      title: "Medo de engasgos e alergias",
      text: "A insegurança sobre cortes, texturas e possíveis reações transforma cada refeição em preocupação.",
    },
    {
      icon: Salad,
      title: "Recusa dos alimentos",
      text: "Seu bebê fecha a boca e você teme que ele não esteja recebendo os nutrientes necessários para crescer saudável.",
    },
    {
      icon: Heart,
      title: "Culpa e comparação",
      text: "Você vê outros bebês comendo e começa a se perguntar se está fazendo alguma coisa errada.",
    },
  ];

  return (
    <section id="introduction-truth" className="overflow-hidden bg-[#F8F0E7] px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-5xl text-center">
        <img
          src={VERDADE_IA_IMG}
          alt="Mãe enfrentando dúvidas durante a introdução alimentar do bebê"
          loading="lazy"
          className="mx-auto h-auto w-full max-w-[560px] rounded-2xl object-contain shadow-[0_12px_35px_rgba(83,63,45,0.12)]"
        />

        <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5">
          {painPoints.map(({ icon: Icon, title, text }, index) => (
            <article
              key={title}
              className={`group relative overflow-hidden rounded-2xl border border-white/80 bg-white p-5 shadow-[0_8px_24px_rgba(83,63,45,0.08)] sm:p-6 ${
                index === painPoints.length - 1
                  ? "sm:col-span-2 sm:mx-auto sm:w-[calc(50%-0.625rem)]"
                  : ""
              }`}
            >
              {title === "Rotina exaustiva" && (
                <div className="absolute inset-0 opacity-40 transition-opacity group-hover:opacity-50">
                  <img
                    src={EXAUSTA_IMG}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
                </div>
              )}
              {title === "Medo de engasgos e alergias" && (
                <div className="absolute inset-0 opacity-40 transition-opacity group-hover:opacity-50">
                  <img
                    src={ENGASGO_IMG}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
                </div>
              )}
              {title === "Dúvidas constantes" && (
                <div className="absolute inset-0 opacity-40 transition-opacity group-hover:opacity-50">
                  <img
                    src={DUVIDA_IMG}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
                </div>
              )}
              {title === "Recusa dos alimentos" && (
                <div className="absolute inset-0 opacity-40 transition-opacity group-hover:opacity-50">
                  <img
                    src={RECUSA_IMG}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
                </div>
              )}
              {title === "Culpa e comparação" && (
                <div className="absolute inset-0 opacity-40 transition-opacity group-hover:opacity-50">
                  <img
                    src={COMPARACAO_IMG}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
                </div>
              )}



              <div className="relative z-10">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h2 className="text-lg font-bold text-foreground">{title}</h2>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
                  {text}
                </p>
              </div>
            </article>
          ))}
        </div>


        <div className="mx-auto mt-10 max-w-2xl text-center sm:mt-12">
          <p className="font-serif text-2xl font-bold leading-tight text-emerald-800 sm:text-3xl">
            Você não precisa descobrir tudo sozinha.
          </p>
          <p className="mt-4 text-base leading-relaxed text-foreground/75 sm:text-lg">
            Com orientação prática, cada refeição pode se tornar mais segura, variada e tranquila
            para você e seu bebê.
          </p>
        </div>
      </div>
    </section>
  );
}




/* ───────────────────────────── Hero ───────────────────────────── */


function Hero() {
  return (
    <section id="top" className="gradient-hero relative overflow-hidden">
      <div className="container-page grid gap-10 py-10 sm:py-16 lg:grid-cols-2 lg:items-center lg:py-24">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
            <Clock3 className="h-3 w-3" /> Receitas prontas em até 15 minutos
          </span>

          <h1 className="mt-5 font-serif text-4xl leading-[1.05] sm:text-5xl lg:text-6xl text-foreground">
            A solução para quem não tem tempo a perder na cozinha.
          </h1>

          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Acesse agora mais de 100 receitas práticas, cardápios prontos e listas de compras 
            inteligentes. Tudo o que você precisa para uma introdução alimentar rápida, nutritiva e sem complicação.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <button
              onClick={scrollToOffers}
              className="cta-hero inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-bold uppercase tracking-wide shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              Quero Acesso Imediato
              <ArrowRight className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-emerald-500" />
              <span>Consulte direto do celular</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <img
            src={HERO_IMG}
            alt="Mãe preparando rapidamente a refeição do bebê com ajuda do NutriBaby"
            width={1400}
            height={1050}
            loading="eager"
            fetchPriority="high"
            className="w-full rounded-3xl object-cover shadow-2xl"
          />
          <div className="absolute -bottom-6 -left-6 hidden rounded-2xl bg-white p-4 shadow-xl sm:block">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Salad className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Cardápios Semanais</p>
                <p className="text-[10px] text-muted-foreground">Já organizados para você</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── Trust bar ───────────────────────────── */

function TrustBar() {
  const items = [
    { icon: <Sparkles className="h-4 w-4" />, label: "Acesso imediato" },
    { icon: <Check className="h-4 w-4" />, label: "Pagamento único" },
    { icon: <Smartphone className="h-4 w-4" />, label: "Consulte pelo celular" },
    { icon: <ShieldCheck className="h-4 w-4" />, label: "15 dias de garantia" },
  ];
  return (
    <div id="trust-bar" className="border-y border-border bg-secondary/40">
      <div className="container-page grid grid-cols-2 gap-3 py-4 text-sm sm:grid-cols-4">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-2 text-foreground/90">
            <span className="text-primary">{it.icon}</span>
            <span className="font-medium">{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────────── Identification ───────────────────────────── */

function Identification() {
  const doubts = [
    "O que eu preparo hoje?",
    "Como posso variar o pratinho?",
    "Será que essa textura está certa?",
    "Estou oferecendo do jeito adequado?",
    "Quais alimentos devo comprar?",
    "Posso preparar com antecedência?",
  ];
  return (
    <section className="py-14 sm:py-20">
      <div className="container-page max-w-4xl">
        <h2 className="font-serif text-3xl leading-tight sm:text-4xl text-foreground">
          E é exatamente por isso que criamos um caminho organizado.
        </h2>
        <p className="mt-4 text-base text-muted-foreground sm:text-lg">
          No começo, é normal sentir que toda refeição vem acompanhada de uma nova dúvida:
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {doubts.map((d) => (
            <div
              key={d}
              className="rounded-2xl border border-border bg-card p-4 text-sm text-foreground/90"
            >
              “{d}”
            </div>
          ))}
        </div>

        <p className="mt-8 text-base text-muted-foreground">
          E quando você percebe, já abriu vários vídeos, salvou um monte de receitas e ainda
          não decidiu o que vai preparar.
        </p>
        <div className="mt-6 rounded-2xl border-l-4 border-primary bg-primary/5 p-5 text-base text-foreground">
          Se você se sente assim, não é falta de cuidado. Você só precisa de informações mais
          simples e organizadas para consultar.
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── Fears ───────────────────────────── */

function Fears() {
  const cards = [
    {
      title: "“E se eu cortar ou oferecer do jeito errado?”",
      text: "O medo de engasgo pode deixar a mãe insegura na hora de apresentar novos alimentos. Ter referências visuais sobre cortes e texturas ajuda a compreender melhor as orientações e saber o que consultar.",
    },
    {
      title: "“E se meu bebê apresentar alguma reação?”",
      text: "É natural observar com atenção a introdução de novos alimentos. O material pode ajudar na organização, mas alergias e reações exigem avaliação individual.",
    },
    {
      title: "“Será que estou oferecendo variedade suficiente?”",
      text: "Quando faltam ideias, é comum acabar repetindo os mesmos alimentos. Ter receitas e possibilidades de combinação ajuda a trazer mais variedade para o planejamento.",
    },
  ];
  return (
    <section className="bg-secondary/30 py-14 sm:py-20">
      <div className="container-page max-w-5xl">
        <h2 className="max-w-3xl font-serif text-3xl leading-tight sm:text-4xl">
          É normal sentir medo de errar justamente em uma fase tão importante.
        </h2>
        <p className="mt-4 max-w-3xl text-base text-muted-foreground">
          Além da dúvida sobre o que preparar, muitas mães também ficam inseguras com cortes,
          texturas, possíveis reações e com a variedade dos alimentos oferecidos.
        </p>
        <p className="mt-3 max-w-3xl text-base text-muted-foreground">
          São preocupações reais. Quando as informações estão espalhadas em vários lugares, a
          insegurança pode ficar ainda maior.
        </p>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {cards.map((c) => (
            <article
              key={c.title}
              className="premium-card premium-card-hover flex flex-col p-6"
            >
              <h3 className="font-serif text-xl leading-snug text-foreground">{c.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── Solution ───────────────────────────── */


/* ───────────────────────────── How it works ───────────────────────────── */

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Abra pelo celular",
      text: "Consulte o material onde estiver, sem precisar imprimir.",
    },
    {
      n: "02",
      title: "Encontre uma ideia",
      text: "Veja as receitas e orientações organizadas para facilitar sua escolha.",
    },
    {
      n: "03",
      title: "Prepare no seu ritmo",
      text: "Escolha o que combina com a fase do bebê e com a rotina da sua família.",
    },
  ];
  return (
    <section className="bg-secondary/30 py-14 sm:py-20">
      <div className="container-page max-w-5xl">
        <h2 className="max-w-3xl font-serif text-3xl leading-tight sm:text-4xl">
          Simples de consultar, mesmo nos dias mais corridos
        </h2>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="premium-card p-6">
              <span className="font-serif text-4xl text-primary">{s.n}</span>
              <h3 className="mt-3 font-serif text-xl">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-base text-muted-foreground">
          Você não precisa decorar tudo. O NutriBaby estará ali sempre que precisar consultar.
        </p>
      </div>
    </section>
  );
}

/* ───────────────────────────── Benefits (before/after) ───────────────────────────── */

function Benefits() {
  const before = [
    "Receitas salvas em vários lugares",
    "Dificuldade para decidir",
    "Poucas ideias para variar",
    "Pesquisa em praticamente todas as refeições",
    "Sensação de começar do zero",
  ];
  const after = [
    "Conteúdo reunido",
    "Opções para consultar",
    "Mais ideias para variar",
    "Acesso rápido pelo celular",
    "Um caminho mais simples para começar",
  ];
  return (
    <section className="py-14 sm:py-20">
      <div className="container-page max-w-5xl">
        <h2 className="max-w-3xl font-serif text-3xl leading-tight sm:text-4xl">
          Mais ideias para você. Menos uma decisão na correria.
        </h2>
        <p className="mt-4 max-w-3xl text-base text-muted-foreground">
          Nem sempre o mais difícil é preparar a refeição. Muitas vezes, o que cansa é decidir o
          que fazer, procurar uma receita e tentar organizar tudo no meio de tantas outras tarefas.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Antes
            </p>
            <ul className="mt-4 space-y-3">
              {before.map((b) => (
                <li key={b} className="flex gap-3 text-sm text-foreground/90">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border-2 border-primary bg-primary/5 p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Com o NutriBaby
            </p>
            <ul className="mt-4 space-y-3">
              {after.map((a) => (
                <li key={a} className="flex gap-3 text-sm text-foreground/90">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-8 text-center text-base text-muted-foreground">
          Não é uma promessa de rotina perfeita. É uma ajuda para tornar a rotina possível.
        </p>
      </div>
    </section>
  );
}



/* ───────────────────────────── Social proof ───────────────────────────── */

function SocialProof() {
  return (
    <section className="py-14 sm:py-20">
      <div className="container-page">
        <div className="max-w-3xl">
          <h2 className="font-serif text-3xl leading-tight sm:text-4xl">
            Mães reais, vivendo dúvidas parecidas com as suas
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Veja como outras mães usam os materiais para ter mais ideias e organização durante essa
            fase.
          </p>
        </div>

        <div className="mt-8 -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
          {whatsappProofs.map((src, i) => (
            <div
              key={src}
              className="w-[68%] shrink-0 snap-center overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:w-auto sm:min-w-0 sm:rounded-3xl"
            >
              <img
                src={src}
                alt={`Depoimento de mãe ${i + 1}`}
                loading="lazy"
                className="w-full object-cover"
              />
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={() => {
              track("cta_proof_click");
              scrollToOffers();
            }}
            className="cta-hero inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-bold uppercase tracking-wide"
          >
            Quero escolher meu acesso
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── Offers ───────────────────────────── */

function Offers() {
  // Marca a visualização da seção de ofertas
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            track("offers_view");
            io.disconnect();
          }
        });
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onEssencialClick = () => {
    track("essencial_click");
    window.dispatchEvent(new CustomEvent("nb:open-upgrade"));
  };
  const onKitClick = () => {
    track("kit_direct_click");
    track("InitiateCheckout", { plan: "kit", value: 29.9 });
  };

  const kitItems = [
    "Mais de 100 receitas",
    "Cardápios organizados",
    "Lista de compras",
    "Guia visual de cortes",
    "14 videoaulas sobre cortes de alimentos",
    "Guia de texturas",
    "Orientações de armazenamento e congelamento",
    "Lista de substituições",
    "Acesso digital pelo celular",
  ];
  const kitBonusList = [
    "100 Receitas para Bebês e Crianças",
    "123 Receitas de Papinhas",
    "Mini Guia Super Papinhas + BLW",
    "Cardápio Semanal Pronto",
    "Lista de Compras Inteligente",
    "Guia Anti-Seletividade",
  ];
  const essItems = [
    "Conteúdo principal",
    "Receitas incluídas",
    "Orientações incluídas",
    "Acesso digital",
    "Consulta pelo celular",
  ];

  return (
    <section
      id="escolher-oferta"
      ref={ref}
      className="scroll-mt-20 bg-secondary/30 py-14 sm:py-20"
    >
      <div className="container-page max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Escolha como você quer começar
          </span>
          <h2 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">
            Uma opção para ter novas ideias. Outra para organizar a semana inteira.
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            As duas opções possuem pagamento único e acesso digital. Escolha a que faz mais
            sentido para sua rotina.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:items-stretch">
          {/* Kit Completo — DESTAQUE PRINCIPAL */}
          <article className="relative order-2 flex flex-col overflow-hidden rounded-3xl border-4 border-primary bg-card p-6 shadow-[0_25px_60px_-15px_hsl(var(--primary)/0.55)] ring-4 ring-primary/20 sm:p-8 lg:scale-[1.03]">
            <div className="-mx-6 -mt-6 mb-5 bg-gradient-to-r from-primary via-primary to-primary/90 px-6 py-2.5 text-center sm:-mx-8 sm:-mt-8 sm:px-8">
              <p className="flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-primary-foreground">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                Mais escolhido • 92% das mães
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              </p>
            </div>
            <span className="absolute right-4 top-14 rounded-full bg-yellow-400 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-yellow-950 shadow-lg">
              Melhor oferta
            </span>
            <img
              src={KIT_COMPLETO_IMG}
              alt="Kit Completo NutriBaby — todos os materiais"
              loading="lazy"
              className="mx-auto mb-4 h-44 w-auto object-contain drop-shadow-xl sm:h-56"
            />
            <p className="text-xs font-black uppercase tracking-widest text-primary">
              Kit Completo NutriBaby
            </p>
            <h3 className="mt-1 font-serif text-2xl leading-tight sm:text-3xl">
              Organize desde as compras até a montagem do pratinho.
            </h3>

            <div className="mt-5 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground line-through">
                De R$ 97,00
              </p>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-serif text-xl text-primary">R$</span>
                <span className="font-serif text-6xl font-bold leading-none tabular-nums text-primary">29,90</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-foreground">
                à vista • ou 3x de R$ 10,60
              </p>
              <p className="mt-1 text-xs italic text-primary">
                Apenas R$ 10,00 a mais que o Guia Essencial.
              </p>
            </div>

            <ul className="mt-5 space-y-2.5">
              {kitItems.map((i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 rounded-2xl border-2 border-dashed border-primary/50 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-primary-foreground shadow-sm">
                  <Gift className="h-3 w-3" />
                  Bônus grátis
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  6 e-books extras
                </span>
              </div>
              <p className="mt-2 text-xs text-foreground/80">
                Leve <strong>hoje</strong> junto com o Kit Completo, sem custo adicional:
              </p>
              <ul className="mt-2.5 grid gap-1.5 sm:grid-cols-2">
                {kitBonusList.map((b) => (
                  <li key={b} className="flex items-start gap-1.5 text-[12px] leading-snug">
                    <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                    <span className="font-medium text-foreground">{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <a
              id="first-offer-cta"
              href={KIT_URL}
              onClick={onKitClick}
              className="cta-hero mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-5 text-base font-black uppercase tracking-wide shadow-xl shadow-primary/30"
            >
              Quero o Kit Completo por R$ 29,90
              <ArrowRight className="h-5 w-5" />
            </a>
            <p className="mt-3 text-center text-[11px] font-semibold text-muted-foreground">
              ✓ Acesso imediato  ✓ Pagamento único  ✓ 15 dias de garantia
            </p>
          </article>

          {/* Guia Essencial */}
          <article className="order-1 flex flex-col rounded-3xl border border-border bg-card p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Guia Essencial NutriBaby
            </p>
            <img
              src={GUIA_ESSENCIAL_IMG}
              alt="Guia Essencial NutriBaby"
              loading="lazy"
              className="mx-auto my-4 h-56 w-auto object-contain drop-shadow-xl sm:h-72"
            />
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-xl text-foreground">R$</span>
              <span className="font-serif text-5xl leading-none tabular-nums">19,90</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Pagamento único</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Para mães que querem receitas e orientações práticas para consultar.
            </p>

            <ul className="mt-5 space-y-2.5">
              {essItems.map((i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={onEssencialClick}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-foreground/20 bg-background px-6 py-4 text-sm font-bold uppercase tracking-wide text-foreground transition-colors hover:bg-secondary"
            >
              Quero o Guia por R$ 19,90
            </button>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              92% das mães escolhem o Kit Completo.
            </p>
          </article>
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-muted-foreground">
          Você pode começar pelo essencial ou escolher o planejamento completo. O mais importante é
          escolher o que realmente combina com sua rotina.
        </p>
      </div>
    </section>
  );
}

/* ───────────────────────────── Upgrade popup (after click on R$14,90) ───────────────────────────── */

function UpgradePopup() {
  const [open, setOpen] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const shownRef = useRef(false);

  useEffect(() => {
    const onOpen = () => {
      if (shownRef.current) {
        // Já mostrado nesta sessão — vai direto para o checkout essencial
        window.location.href = ESSENCIAL_URL;
        return;
      }
      shownRef.current = true;
      setOpen(true);
      track("upgrade_popup_open");
    };
    window.addEventListener("nb:open-upgrade", onOpen);
    return () => window.removeEventListener("nb:open-upgrade", onOpen);
  }, []);

  if (!open) return null;

  const close = () => {
    setOpen(false);
    setConfirmClose(true);
    track("upgrade_popup_close");
    window.setTimeout(() => setConfirmClose(false), 6000);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[70] flex items-end justify-center bg-foreground/60 pt-3 backdrop-blur-sm sm:items-center sm:p-4"
        onClick={close}
      >
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
          className="relative max-h-[calc(100dvh-0.75rem)] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-3xl border border-border bg-card px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-3xl sm:p-8"
        >
          <button
            onClick={close}
            aria-label="Fechar"
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
            Antes de continuar
          </span>
          <h3 className="mt-3 pr-8 font-serif text-xl leading-tight sm:mt-4 sm:pr-0 sm:text-3xl">
            Quer levar o Kit Completo por apenas R$ 4,00 a mais?
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground sm:mt-3 sm:text-sm">
            Além do Guia Essencial, você recebe cardápios, lista de compras, materiais
            complementares e 14 videoaulas práticas sobre cortes.
          </p>

          <div className="mt-4 rounded-2xl border border-primary/40 bg-primary/5 p-4 sm:mt-5 sm:p-5">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-muted-foreground">Guia Essencial</span>
              <span className="font-semibold tabular-nums">R$ 19,90</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between text-sm">
              <span className="font-semibold text-primary">Kit Completo nesta condição</span>
              <span className="font-serif text-2xl font-bold text-foreground tabular-nums">
                R$ 23,90
              </span>
            </div>
            <p className="mt-3 text-xs italic text-foreground/80">
              Por apenas R$ 4,00 a mais, você leva a opção completa.
            </p>
          </div>

          <ul className="mt-3 grid grid-cols-1 gap-1 text-[13px] sm:mt-4 sm:grid-cols-2 sm:gap-1.5 sm:text-sm">
            {[
              "Mais de 100 receitas",
              "Cardápios organizados",
              "Lista de compras",
              "14 videoaulas sobre cortes",
              "Guia de cortes e texturas",
              "Orientações de congelamento",
            ].map((i) => (
              <li key={i} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{i}</span>
              </li>
            ))}
          </ul>

          <a
            href={KIT_PROMO_URL}
            onClick={() => {
              track("upgrade_accept");
              track("InitiateCheckout", { plan: "kit_promo", value: 23.9 });
            }}
            className="cta-hero mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3.5 text-xs font-bold uppercase tracking-wide sm:mt-6 sm:px-6 sm:py-4 sm:text-sm"
          >
            Sim, quero o Kit Completo por R$ 23,90
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href={ESSENCIAL_URL}
            onClick={() => {
              track("upgrade_decline");
              track("InitiateCheckout", { plan: "essencial", value: 19.9 });
            }}
            className="mt-2 inline-flex w-full items-center justify-center rounded-full border border-border bg-background px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-foreground hover:bg-secondary sm:mt-3 sm:px-6 sm:py-3 sm:text-xs"
          >
            Quero continuar com o Guia de R$ 19,90
          </a>
          <p className="mt-2 text-center text-[10px] text-muted-foreground sm:mt-3 sm:text-[11px]">
            Pagamento único • Acesso imediato • Produto digital
          </p>
        </div>
      </div>

      {confirmClose && (
        <div className="fixed bottom-24 left-1/2 z-[65] -translate-x-1/2 rounded-full border border-border bg-card px-5 py-3 text-xs shadow-xl">
          Continuando com o Guia por R$ 19,90 —{" "}
          <a href={ESSENCIAL_URL} className="font-bold text-primary underline">
            ir para o checkout
          </a>
        </div>
      )}
    </>
  );
}

/* ───────────────────────────── Exit intent popup (desktop) ───────────────────────────── */

function ExitIntentPopup() {
  const [open, setOpen] = useState(false);
  const shownRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isDesktop = window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches;
    if (!isDesktop) return;

    const onMouseOut = (e: MouseEvent) => {
      if (shownRef.current) return;
      if (e.clientY <= 0 && !e.relatedTarget) {
        shownRef.current = true;
        setOpen(true);
        track("exit_intent_open");
      }
    };
    document.addEventListener("mouseout", onMouseOut);
    return () => document.removeEventListener("mouseout", onMouseOut);
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-2xl"
      >
        <button
          onClick={() => setOpen(false)}
          aria-label="Fechar"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>
        <h3 className="font-serif text-2xl leading-tight sm:text-3xl">
          Antes de sair, leve o Kit Completo com uma condição especial
        </h3>
        <p className="mt-3 text-sm text-muted-foreground">
          Tenha receitas, cardápios, lista de compras e 14 videoaulas sobre cortes por R$ 23,90.
        </p>
        <a
          href={KIT_PROMO_URL}
          onClick={() => {
            track("exit_intent_accept");
            track("InitiateCheckout", { plan: "kit_promo", value: 23.9 });
          }}
          className="cta-hero mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-bold uppercase tracking-wide"
        >
          Quero o Kit Completo por R$ 23,90
          <ArrowRight className="h-4 w-4" />
        </a>
        <button
          onClick={() => setOpen(false)}
          className="mt-3 inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
        >
          Continuar na página
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────────── Mobile sticky bar ───────────────────────────── */

function MobileStickyBar() {
  const [seenOffers, setSeenOffers] = useState(false);
  const [pastThird, setPastThird] = useState(false);

  useEffect(() => {
    const el = document.getElementById("escolher-oferta");
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setSeenOffers(true);
        });
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      // Libera a barra somente depois que o usuário passar do primeiro botão de oferta.
      const btn = document.getElementById("first-offer-cta");
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      if (rect.bottom < 0) setPastThird(true);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!pastThird) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)] backdrop-blur lg:hidden">

      {!seenOffers ? (
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
              A partir de
            </p>
            <p className="font-serif text-xl leading-none tabular-nums">R$ 19,90</p>
          </div>
          <button
            onClick={() => {
              track("sticky_view_options");
              scrollToOffers();
            }}
            className="cta-hero inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full px-4 text-xs font-bold uppercase tracking-wide"
          >
            Ver opções
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Kit Completo
              </p>
              <p className="font-serif text-xl leading-none tabular-nums">R$ 29,90</p>
            </div>
            <a
              href={KIT_URL}
              onClick={() => {
                track("sticky_kit_click");
                track("InitiateCheckout", { plan: "kit", value: 29.9 });
              }}
              className="cta-hero inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full px-4 text-xs font-bold uppercase tracking-wide"
            >
              Quero tudo
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <button
            onClick={() => {
              track("sticky_back_essencial");
              scrollToOffers();
            }}
            className="text-center text-[11px] text-muted-foreground underline underline-offset-2"
          >
            Ver opção de R$ 19,90
          </button>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Guarantee image ───────────────────────── */

function GuaranteeImage() {
  return (
    <section className="overflow-hidden bg-[#F8F0E7] px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto w-full max-w-4xl">
        <img
          src={GARANTIA_IMG}
          alt="Garantia de 15 dias NutriBaby"
          loading="lazy"
          className="mx-auto h-auto w-full rounded-2xl object-contain shadow-[0_12px_35px_rgba(83,63,45,0.12)]"
        />
      </div>
    </section>
  );
}

/* ───────────────────────────── Guarantee ───────────────────────────── */

function Guarantee() {
  return (
    <section className="py-14 sm:py-20">
      <div className="container-page max-w-3xl">
        <div className="premium-card flex flex-col items-center p-8 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h2 className="mt-4 font-serif text-3xl leading-tight sm:text-4xl">
            Conheça o NutriBaby por 15 dias
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Acesse o conteúdo e conheça os materiais com calma. Se dentro de 15 dias você perceber
            que o produto não faz sentido para sua rotina, poderá solicitar o reembolso conforme as
            condições da garantia.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── FAQ ───────────────────────────── */

function FAQ() {
  const items = [
    {
      q: "Meu bebê está começando agora. O material serve para mim?",
      a: "O conteúdo foi organizado para mães que estão vivendo essa fase e precisam de ideias e planejamento. Antes de iniciar a introdução alimentar, confirme com o profissional que acompanha o bebê se ele apresenta os sinais de prontidão.",
    },
    {
      q: "As videoaulas eliminam o risco de engasgo?",
      a: "Não. As videoaulas são materiais educativos sobre cortes e apresentação dos alimentos. Elas não eliminam riscos e não substituem orientação profissional ou treinamento de primeiros socorros.",
    },
    {
      q: "Preciso seguir os cardápios exatamente?",
      a: "Não. Eles servem como orientação prática e podem ser adaptados à rotina da família e às recomendações do profissional que acompanha o bebê.",
    },
    {
      q: "Serve para bebês com alergias?",
      a: "Alergias e restrições precisam de avaliação individual. O material não diagnostica, previne ou trata alergias.",
    },
    {
      q: "O material garante todos os nutrientes necessários?",
      a: "Não. O NutriBaby oferece ideias e variedade para o planejamento, mas necessidades nutricionais individuais devem ser avaliadas por pediatra ou nutricionista.",
    },
    {
      q: "Consigo acessar pelo celular?",
      a: "Sim. O material é digital e pode ser consultado pelo celular, tablet ou computador.",
    },
    {
      q: "O pagamento é mensal?",
      a: "Não. O pagamento é feito uma única vez.",
    },
    {
      q: "Receberei algum produto físico?",
      a: "Não. O NutriBaby é um produto digital.",
    },
    {
      q: "O NutriBaby substitui uma consulta?",
      a: "Não. O material é educativo e de organização. Ele não substitui o acompanhamento de um profissional.",
    },
  ];
  return (
    <section className="bg-secondary/30 py-14 sm:py-20">
      <div className="container-page max-w-3xl">
        <h2 className="font-serif text-3xl leading-tight sm:text-4xl">Perguntas frequentes</h2>
        <div className="mt-8 space-y-3">
          {items.map((it, idx) => (
            <details
              key={idx}
              className="group rounded-2xl border border-border bg-card p-5 open:shadow-sm"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold text-foreground">
                {it.q}
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── Final CTA ───────────────────────────── */

function FinalCta() {
  return (
    <section className="py-14 sm:py-20">
      <div className="container-page max-w-3xl text-center">
        <h2 className="font-serif text-3xl leading-tight sm:text-5xl">
          Você não precisa ter todas as respostas para começar.
        </h2>
        <p className="mt-4 text-base text-muted-foreground">
          Escolha a opção que combina com sua rotina e tenha materiais organizados para consultar
          quando precisar.
        </p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
          <a
            href={KIT_URL}
            onClick={() => {
              track("final_cta_kit");
              track("InitiateCheckout", { plan: "kit", value: 29.9 });
            }}
            className="cta-hero inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-bold uppercase tracking-wide"
          >
            Quero o Kit Completo por R$ 29,90
            <ArrowRight className="h-4 w-4" />
          </a>
          <button
            onClick={() => {
              track("final_cta_essencial");
              window.dispatchEvent(new CustomEvent("nb:open-upgrade"));
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-foreground/20 bg-background px-8 py-4 text-sm font-bold uppercase tracking-wide text-foreground hover:bg-secondary"
          >
            Quero o Guia por R$ 19,90
          </button>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── Footer ───────────────────────────── */

function Footer() {
  return (
    <footer className="border-t border-border bg-card pb-28 pt-10 lg:pb-10">
      <div className="container-page grid gap-6 text-sm text-muted-foreground sm:grid-cols-2">
        <div>
          <img src={LOGO_IMG} alt="NutriBaby" className="h-8 w-auto" />
        </div>
        <div className="text-xs sm:text-right">
          <p>© {new Date().getFullYear()} NutriBaby. Todos os direitos reservados.</p>
          <p className="mt-1">Produto digital • Pagamento único • 15 dias de garantia</p>
        </div>
      </div>
    </footer>
  );
}

/* ───────────────────────────── Sales popup (social proof notifications) ───────────────────────────── */

function SalesPopup() {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const notifications = [
    { name: "Amanda R.", city: "São Paulo, SP", product: "Kit Completo", price: "R$ 29,90", ago: "há 2 min" },
    { name: "Juliana M.", city: "Rio de Janeiro, RJ", product: "Guia Essencial", price: "R$ 19,90", ago: "há 4 min" },
    { name: "Carolina S.", city: "Belo Horizonte, MG", product: "Kit Completo", price: "R$ 29,90", ago: "há 6 min" },
    { name: "Fernanda L.", city: "Curitiba, PR", product: "Kit Completo", price: "R$ 29,90", ago: "há 8 min" },
    { name: "Patrícia B.", city: "Porto Alegre, RS", product: "Guia Essencial", price: "R$ 19,90", ago: "há 11 min" },
    { name: "Bianca T.", city: "Salvador, BA", product: "Kit Completo", price: "R$ 29,90", ago: "há 13 min" },
    { name: "Larissa O.", city: "Recife, PE", product: "Kit Completo", price: "R$ 29,90", ago: "há 15 min" },
    { name: "Camila F.", city: "Fortaleza, CE", product: "Kit Completo", price: "R$ 29,90", ago: "há 18 min" },
    { name: "Mariana P.", city: "Brasília, DF", product: "Kit Completo", price: "R$ 29,90", ago: "há 21 min" },
    { name: "Renata A.", city: "Florianópolis, SC", product: "Kit Completo", price: "R$ 29,90", ago: "há 24 min" },
    { name: "Débora N.", city: "Goiânia, GO", product: "Kit Completo", price: "R$ 29,90", ago: "há 27 min" },
    { name: "Vanessa C.", city: "Manaus, AM", product: "Guia Essencial", price: "R$ 19,90", ago: "há 30 min" },
  ];

  useEffect(() => {
    let i = 0;
    let t1: number | undefined;
    let t2: number | undefined;
    const scrolledEnough = () =>
      window.scrollY > (window.innerHeight || 800) * 1.1;
    const cycle = () => {
      if (!scrolledEnough()) {
        t1 = window.setTimeout(cycle, 2000);
        return;
      }
      setIndex(i % notifications.length);
      setVisible(true);
      t2 = window.setTimeout(() => {
        setVisible(false);
        i++;
        t1 = window.setTimeout(cycle, 12000 + Math.random() * 6000);
      }, 5500);
    };
    t1 = window.setTimeout(cycle, 15000);
    return () => {
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);
    };
  }, [notifications.length]);


  const n = notifications[index];
  const initials = n.name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      aria-live="polite"
      className={`fixed bottom-24 left-3 z-40 w-[320px] max-w-[calc(100vw-1.5rem)] transition-all duration-500 sm:bottom-6 sm:left-6 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border/60 bg-primary/10 px-3 py-1.5">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
              Compra confirmada
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground">{n.ago}</span>
        </div>
        <div className="flex items-start gap-3 p-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/15 text-sm font-bold text-primary">
            {initials}
          </div>
          <div className="min-w-0 flex-1 text-xs leading-tight">
            <p className="flex items-center gap-1 font-semibold text-foreground">
              <span className="truncate">{n.name}</span>
              <ShieldCheck className="h-3 w-3 shrink-0 text-primary" />
            </p>
            <p className="text-[11px] text-muted-foreground">{n.city}</p>
            <p className="mt-1 text-foreground">
              Adquiriu o <span className="font-semibold">{n.product}</span>
            </p>
            <p className="mt-0.5 text-[11px] font-bold text-primary">{n.price} • Pagamento aprovado</p>
          </div>
        </div>
      </div>
    </div>
  );
}
