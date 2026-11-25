import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ChevronRight } from "lucide-react";
import Plasma from "./Plasma";

const CTA_PRIMARY = "#contato";
const CTA_SECONDARY = "#sobre";

const colors = {
  bg: "#0A0A0B",
  text: "#EDEDEF",
  strong: "#FFFFFF",
  muted: "#8B8B90",
  dim: "#5C5C61",
  soft: "#B8B8BD",
  accent: "#C4B5FD",
  line: "rgba(255,255,255,0.1)",
};

type Tok = { t: string; c?: string };
type TermLine = { kind: "cmd" | "code" | "out" | "prompt"; tokens: Tok[] };

const termLines: TermLine[] = [
  {
    kind: "cmd",
    tokens: [
      { t: "~/goatrealm", c: colors.muted },
      { t: " ❯ ", c: colors.dim },
      { t: "node studio.ts", c: colors.strong },
    ],
  },
  {
    kind: "code",
    tokens: [
      { t: "const ", c: colors.muted },
      { t: "experience", c: colors.strong },
      { t: " = {", c: colors.dim },
    ],
  },
  {
    kind: "code",
    tokens: [
      { t: "  vision", c: colors.text },
      { t: ": ", c: colors.dim },
      { t: "'unique'", c: colors.soft },
      { t: ",", c: colors.dim },
    ],
  },
  {
    kind: "code",
    tokens: [
      { t: "  design", c: colors.text },
      { t: ": ", c: colors.dim },
      { t: "'purposeful'", c: colors.soft },
      { t: ",", c: colors.dim },
    ],
  },
  {
    kind: "code",
    tokens: [
      { t: "  possibilities", c: colors.text },
      { t: ": ", c: colors.dim },
      { t: "Infinity", c: colors.strong },
      { t: ",", c: colors.dim },
    ],
  },
  { kind: "code", tokens: [{ t: "};", c: colors.dim }] },
  { kind: "code", tokens: [] },
  {
    kind: "code",
    tokens: [
      { t: "build", c: colors.strong },
      { t: "(", c: colors.dim },
      { t: "experience", c: colors.text },
      { t: ");", c: colors.dim },
    ],
  },
  {
    kind: "out",
    tokens: [
      { t: "✓ ", c: colors.strong },
      { t: "compiled in 1.2s", c: colors.muted },
    ],
  },
  {
    kind: "out",
    tokens: [
      { t: "✓ ", c: colors.strong },
      { t: "ready on ", c: colors.muted },
      { t: "goatrealm.com.br", c: colors.text },
    ],
  },
  {
    kind: "prompt",
    tokens: [
      { t: "~/goatrealm", c: colors.muted },
      { t: " ❯ ", c: colors.dim },
    ],
  },
];

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const lineLength = (line: TermLine) => line.tokens.reduce((n, tok) => n + tok.t.length, 0);

const renderLine = (el: HTMLElement, line: TermLine, count: number, cursor?: HTMLElement | null) => {
  let left = count;
  let html = "";
  for (const tok of line.tokens) {
    if (left <= 0) break;
    const part = tok.t.slice(0, left);
    left -= part.length;
    html += `<span style="color:${tok.c ?? colors.text}">${escapeHtml(part)}</span>`;
  }
  el.innerHTML = html;
  if (cursor) el.appendChild(cursor);
};

const buildTyping = (els: HTMLElement[], cursor: HTMLElement) => {
  const tl = gsap.timeline();

  termLines.forEach((line, i) => {
    const el = els[i];
    if (!el) return;
    const total = lineLength(line);

    if (line.kind === "out") {
      tl.to(el, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, ">+0.2");
      return;
    }

    if (line.kind === "prompt") {
      tl.add(() => renderLine(el, line, total, cursor), ">+0.3");
      return;
    }

    if (total === 0) return;

    const state = { n: 0 };
    tl.to(
      state,
      {
        n: total,
        duration: total * (line.kind === "cmd" ? 0.05 : 0.024),
        ease: "none",
        onUpdate: () => renderLine(el, line, Math.round(state.n), cursor),
        onComplete: () => renderLine(el, line, total, null),
      },
      line.kind === "cmd" ? ">+0.2" : ">+0.06"
    );
  });

  return tl;
};

const makeCursor = () => {
  const el = document.createElement("span");
  Object.assign(el.style, {
    display: "inline-block",
    width: "0.55em",
    height: "1.1em",
    marginLeft: "2px",
    verticalAlign: "-0.2em",
    background: colors.strong,
    borderRadius: "1px",
  });
  return el;
};

const Line = ({ children }: { children: ReactNode }) => (
  <span className="-my-[0.1em] block overflow-hidden py-[0.1em]">
    <span data-line className="block will-change-transform">
      {children}
    </span>
  </span>
);

const Stat = ({ to, suffix, label }: { to: number; suffix: string; label: string }) => (
  <span className="whitespace-nowrap">
    <span data-count data-to={to} data-suffix={suffix} style={{ color: colors.strong }}>
      {to}
      {suffix}
    </span>{" "}
    {label}
  </span>
);

export const Component = () => {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const scope = root.current;
    if (!scope) return;

    const q = <T extends Element>(selector: string) => gsap.utils.toArray<T>(selector, scope);

    const lineEls = q<HTMLElement>("[data-tline]");
    const counters = q<HTMLElement>("[data-count]");

    const setCounter = (el: HTMLElement, value: number) => {
      el.textContent = `${Math.round(value)}${el.dataset.suffix ?? ""}`;
    };

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: reduce)", () => {
      const cursor = makeCursor();
      termLines.forEach((line, i) => {
        const el = lineEls[i];
        if (el) renderLine(el, line, lineLength(line), line.kind === "prompt" ? cursor : null);
      });
      counters.forEach((el) => setCounter(el, Number(el.dataset.to ?? 0)));
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const lines = q<HTMLElement>("[data-line]");
      const sub = q<HTMLElement>("[data-sub]");
      const ctas = q<HTMLElement>("[data-cta]");
      const term = q<HTMLElement>("[data-term]");
      const outLines = termLines
        .map((l, i) => (l.kind === "out" ? lineEls[i] : null))
        .filter((el): el is HTMLElement => Boolean(el));

      lineEls.forEach((el, i) => {
        const line = termLines[i];
        if (line.kind === "out") renderLine(el, line, lineLength(line), null);
        else el.innerHTML = "";
      });
      gsap.set(outLines, { opacity: 0, y: 8 });
      counters.forEach((el) => setCounter(el, 0));

      const cursor = makeCursor();
      gsap.to(cursor, { opacity: 0, duration: 0.5, ease: "steps(1)", repeat: -1, yoyo: true });

      const intro = gsap.timeline({ defaults: { ease: "power4.out" } });

      intro
        .from(lines, { yPercent: 110, duration: 1.3, stagger: 0.1, ease: "expo.out" }, 0.3)
        .from(sub, { y: 16, opacity: 0, duration: 1 }, 0.8)
        .from(ctas, { y: 16, opacity: 0, duration: 1, stagger: 0.1 }, 0.95)
        .from(term, { y: 40, opacity: 0, duration: 1.6, ease: "power3.out" }, 1.0)
        .add(buildTyping(lineEls, cursor), 2.2);

      counters.forEach((el) => {
        const state = { v: 0 };
        intro.to(
          state,
          {
            v: Number(el.dataset.to ?? 0),
            duration: 1.6,
            ease: "power3.out",
            onUpdate: () => setCounter(el, state.v),
          },
          2.3
        );
      });

      if (!window.matchMedia("(hover: hover)").matches) return;

      const movers = q<HTMLElement>("[data-px]").map((el) => ({
        depth: Number(el.dataset.px ?? 0),
        x: gsap.quickTo(el, "x", { duration: 1.2, ease: "power3.out" }),
        y: gsap.quickTo(el, "y", { duration: 1.2, ease: "power3.out" }),
      }));

      const onMove = (event: PointerEvent) => {
        const nx = event.clientX / window.innerWidth - 0.5;
        const ny = event.clientY / window.innerHeight - 0.5;
        movers.forEach(({ depth, x, y }) => {
          x(nx * depth * 28);
          y(ny * depth * 18);
        });
      };

      const onLeave = () =>
        movers.forEach(({ x, y }) => {
          x(0);
          y(0);
        });

      scope.addEventListener("pointermove", onMove);
      scope.addEventListener("pointerleave", onLeave);

      return () => {
        scope.removeEventListener("pointermove", onMove);
        scope.removeEventListener("pointerleave", onLeave);
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={root}
      id="inicio"
      className="gr-sans relative isolate flex w-full items-end overflow-hidden px-5 pb-14 pt-32 selection:bg-white/20 md:px-12 md:pb-20"
      style={{ backgroundColor: colors.bg, color: colors.text, minHeight: "100svh" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap');
        .gr-sans { font-family: 'Geist', 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
        .gr-mono { font-family: 'Geist Mono', 'SF Mono', ui-monospace, Menlo, monospace; }
      `}</style>

      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <Plasma
          horizonColor="#5227FF"
          waveColor="#ff9ffc"
          crestColor="#FFFFFF"
          speed={0.4}
          amplitude={2.5}
          relief={1}
          lightAngle={120}
          tilt={40}
          brightness={0.5}
          mouseInteraction
          swellOnClick
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(10,10,11,0.85) 0%, rgba(10,10,11,0.35) 35%, transparent 65%)",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-40"
          style={{ background: `linear-gradient(to bottom, transparent, ${colors.bg})` }}
        />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-[1400px] items-end gap-12 md:grid-cols-[1.05fr_1fr] md:gap-10">
        <div className="flex flex-col items-start text-left">
          <h1
            className="text-[clamp(2.4rem,6vw,5.2rem)] font-semibold leading-[1.02] tracking-[-0.045em]"
            style={{ color: colors.strong }}
          >
            <Line>Criamos experiências</Line>
            <Line>
              digitais <span style={{ color: colors.accent }}>únicas.</span>
            </Line>
          </h1>

          <p
            data-sub
            className="mt-5 max-w-[520px] text-[16px] leading-[1.45] tracking-[-0.01em] md:mt-6 md:text-[18px]"
            style={{ color: colors.soft }}
          >
            Somos a GoatRealm. Transformamos ideias em sistemas web, apps mobile e soluções desktop que impulsionam
            negócios e conectam pessoas.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3 md:mt-9">
            <a
              data-cta
              href={CTA_PRIMARY}
              className="inline-flex h-11 items-center gap-2 rounded-xl px-5 text-[15px] font-medium text-black transition-colors duration-300 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              style={{ background: "linear-gradient(to bottom, #FFFFFF, #E4E4E8)" }}
            >
              Iniciar projeto
              <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
            </a>

            <a
              data-cta
              href={CTA_SECONDARY}
              className="inline-flex h-11 items-center rounded-xl border px-5 text-[15px] font-medium text-white backdrop-blur-md transition-colors duration-300 hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              style={{ backgroundColor: "rgba(255,255,255,0.08)", borderColor: colors.line }}
            >
              Sobre a GoatRealm
            </a>
          </div>
        </div>

        <div data-term className="w-full max-w-[600px] md:justify-self-end">
          <div
            data-px="1"
            className="relative overflow-hidden rounded-[20px] border backdrop-blur-2xl will-change-transform"
            style={{
              backgroundColor: "rgba(14,12,22,0.72)",
              borderColor: colors.line,
              boxShadow: "0 40px 120px -30px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <div className="relative flex h-11 items-center border-b px-4" style={{ borderColor: colors.line }}>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: "#3A3A3D" }} />
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: "#3A3A3D" }} />
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: "#3A3A3D" }} />
              </div>
              <span className="gr-mono absolute left-1/2 -translate-x-1/2 text-[12px]" style={{ color: colors.dim }}>
                goatrealm — studio
              </span>
            </div>

            <div
              className="gr-mono min-h-[280px] px-5 py-5 text-[12.5px] leading-[1.75] md:min-h-[310px] md:px-7 md:py-6 md:text-[14px]"
              aria-label="Terminal executando studio.ts"
            >
              {termLines.map((_, i) => (
                <div key={i} data-tline className="min-h-[1.75em] whitespace-pre-wrap break-words" />
              ))}
            </div>

            <div
              className="gr-mono flex items-center justify-between gap-4 border-t px-5 py-3 text-[11px] md:px-7 md:text-xs"
              style={{ color: colors.dim, borderColor: colors.line }}
            >
              <div className="flex items-center gap-4 md:gap-6">
                <Stat to={50} suffix="+" label="projetos" />
                <Stat to={5} suffix="+" label="anos" />
                <Stat to={100} suffix="%" label="dedicação" />
              </div>
              <span className="hidden items-center gap-2 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: colors.soft }} />
                online
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Component;