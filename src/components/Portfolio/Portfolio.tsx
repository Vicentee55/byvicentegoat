import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const colors = {
  bg: "#0A0A0B",
  strong: "#FFFFFF",
  text: "#EDEDEF",
  muted: "#8B8B90",
  dim: "#5C5C61",
  accent: "#A78BFA",
  line: "rgba(255,255,255,0.14)",
};

type Category = "web" | "mobile" | "desktop";
type Filter = "todos" | Category;

type Project = {
  category: Category;
  image?: string;
  parts: [string, string];
  description: string;
  stack: string[];
};

const projects: Project[] = [
  {
    category: "web",
    image: "/src/assets/Projetos/Screenshot_52.png",
    parts: ["Sistema de Gestão", "Empresarial"],
    description: "ERP completo para gestão de estoque, vendas, financeiro e relatórios gerenciais.",
    stack: ["React", "Node.js", "PostgreSQL", "AWS"],
  },
  {
    category: "mobile",
    image: "/src/assets/Projetos/Screenshot_54.png",
    parts: ["App de", "Delivery"],
    description: "Aplicativo com rastreamento em tempo real e pagamentos integrados.",
    stack: ["React Native", "Firebase", "Stripe"],
  },
  {
    category: "web",
    image: "/src/assets/Projetos/Screenshot_55.png",
    parts: ["Plataforma de", "Agendamentos"],
    description: "Sistema de agendamentos online com confirmação automática.",
    stack: ["Next.js", "Prisma", "Twilio"],
  },
  {
    category: "desktop",
    image: "/src/assets/Projetos/Screenshot_65.png",
    parts: ["Software", "Industrial"],
    description: "Monitoramento e controle de processos industriais em tempo real.",
    stack: ["Electron", "Python", "MQTT"],
  },
  {
    category: "web",
    image: "/src/assets/Projetos/Screenshot_66.png",
    parts: ["Dashboard", "Analytics"],
    description: "Painel de analytics com visualizações de dados em tempo real.",
    stack: ["Next.js", "D3.js", "Supabase"],
  },
  {
    category: "mobile",
    image: "/src/assets/Projetos/Screenshot_66.png",
    parts: ["App", "Fitness"],
    description: "Aplicativo de treinos personalizados com gamificação.",
    stack: ["React Native", "Node.js", "MongoDB"],
  },
];

const filters: { id: Filter; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "web", label: "Web" },
  { id: "mobile", label: "Mobile" },
  { id: "desktop", label: "Desktop" },
];

const pad = (n: number) => String(n).padStart(2, "0");

const stroke = "rgba(255,255,255,0.22)";
const soft = "rgba(255,255,255,0.07)";
const bars = [0.45, 0.7, 0.35, 0.85, 0.55, 0.75, 0.5];

const Thumb = ({ kind, seed }: { kind: Category; seed: number }) => {
  const heights = bars.map((_, i) => bars[(i + seed) % bars.length]);

  return (
    <svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" className="block h-full w-full" aria-hidden>
      <rect width="160" height="100" fill="#121215" />

      {kind === "web" && (
        <>
          <rect width="160" height="12" fill={soft} />
          {[8, 14, 20].map((x) => (
            <circle key={x} cx={x} cy="6" r="1.6" fill={stroke} />
          ))}
          <rect y="12" width="34" height="88" fill="rgba(255,255,255,0.03)" />
          {[24, 34, 44, 54].map((y) => (
            <rect key={y} x="8" y={y} width="18" height="3" rx="1.5" fill={soft} />
          ))}
          {[0, 1, 2].map((i) => (
            <rect key={i} x={42 + i * 39} y="20" width="35" height="20" rx="3" fill="none" stroke={stroke} strokeWidth="0.8" />
          ))}
          {heights.map((value, i) => (
            <rect
              key={i}
              x={44 + i * 16}
              y={96 - value * 44}
              width="9"
              height={value * 44}
              rx="1.5"
              fill={i === seed % bars.length ? colors.accent : "rgba(255,255,255,0.16)"}
            />
          ))}
        </>
      )}

      {kind === "mobile" && (
        <>
          <rect x="55" y="7" width="50" height="88" rx="9" fill="none" stroke={stroke} strokeWidth="0.9" />
          <rect x="73" y="11" width="14" height="3" rx="1.5" fill={soft} />
          <circle cx="66" cy="28" r="4" fill={colors.accent} />
          <rect x="74" y="25" width="22" height="3" rx="1.5" fill={stroke} />
          <rect x="74" y="31" width="14" height="2.5" rx="1.25" fill={soft} />
          {[44, 56, 68].map((y) => (
            <rect key={y} x="62" y={y} width="36" height="8" rx="2.5" fill={soft} />
          ))}
          <rect x="65" y="84" width="30" height="5" rx="2.5" fill="rgba(255,255,255,0.14)" />
        </>
      )}

      {kind === "desktop" && (
        <>
          <rect x="16" y="9" width="128" height="68" rx="4" fill="none" stroke={stroke} strokeWidth="0.9" />
          <rect x="16" y="9" width="128" height="9" rx="4" fill={soft} />
          {[23, 28, 33].map((x) => (
            <circle key={x} cx={x} cy="13.5" r="1.4" fill={stroke} />
          ))}
          <rect x="22" y="24" width="30" height="46" rx="2" fill={soft} />
          <rect x="58" y="24" width="38" height="10" rx="2" fill={soft} />
          <rect x="100" y="24" width="38" height="10" rx="2" fill={soft} />
          <polyline
            points="58,62 70,52 82,57 94,42 106,48 118,34 138,40"
            fill="none"
            stroke={colors.accent}
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <rect x="74" y="77" width="12" height="9" fill={soft} />
          <rect x="62" y="86" width="36" height="3" rx="1.5" fill={stroke} />
        </>
      )}
    </svg>
  );
};

const Media = ({ project, seed }: { project: Project; seed: number }) => {
  const [failed, setFailed] = useState(false);

  if (!project.image || failed) return <Thumb kind={project.category} seed={seed} />;

  return (
    <img
      src={project.image}
      alt=""
      draggable={false}
      loading="lazy"
      onError={() => setFailed(true)}
      className="block h-full w-full select-none object-cover"
    />
  );
};

const Line = ({ children }: { children: ReactNode }) => (
  <span className="-my-[0.1em] block overflow-hidden py-[0.1em]">
    <span data-line className="block will-change-transform">
      {children}
    </span>
  </span>
);

export const Component = () => {
  const root = useRef<HTMLElement>(null);
  const first = useRef(true);
  const filterRef = useRef<Filter>("todos");
  const [filter, setFilter] = useState<Filter>("todos");

  const visibleCount = projects.filter((p) => filter === "todos" || p.category === filter).length;

  useLayoutEffect(() => {
    const scope = root.current;
    if (!scope) return;

    const q = <T extends HTMLElement>(selector: string) => gsap.utils.toArray<T>(selector, scope);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(q("[data-slot]"), { width: "1.3em", marginRight: "0.3em" });
      gsap.set(q("[data-slot-img]"), { scale: 1 });
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const header = scope.querySelector<HTMLElement>("[data-pheader]");
      const list = scope.querySelector<HTMLElement>("[data-plist]");
      const cleanups: Array<() => void> = [];

      if (header) {
        gsap
          .timeline({
            defaults: { ease: "power3.out" },
            scrollTrigger: { trigger: header, start: "top 82%", once: true },
          })
          .from(q("[data-eyebrow]"), { y: 12, opacity: 0, duration: 1 })
          .from(q("[data-line]"), { yPercent: 110, duration: 1.3, stagger: 0.1, ease: "expo.out" }, 0.1)
          .from(q("[data-tabs]"), { y: 16, opacity: 0, duration: 1 }, 0.5);
      }

      if (list) {
        gsap
          .timeline({
            defaults: { ease: "power3.out" },
            scrollTrigger: { trigger: list, start: "top 85%", once: true },
          })
          .from(q("[data-pdraw]"), {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 1.4,
            stagger: 0.1,
            ease: "expo.inOut",
          })
          .from(q("[data-pfade]"), { y: 24, opacity: 0, duration: 1, stagger: 0.07 }, 0.2);
      }

      const rows = q("[data-prow]");
      const bodies = q("[data-pbody]");
      const slotOf = (row: HTMLElement) => row.querySelector<HTMLElement>("[data-slot]");
      const imgOf = (row: HTMLElement) => row.querySelector<HTMLElement>("[data-slot-img]");

      gsap.set(q("[data-slot-img]"), { scale: 1.25 });

      const show = (row: HTMLElement) => {
        gsap.to(slotOf(row), { width: "1.3em", marginRight: "0.3em", duration: 0.55, ease: "expo.out", overwrite: "auto" });
        gsap.to(imgOf(row), { scale: 1, duration: 0.8, ease: "expo.out", overwrite: "auto" });
      };

      const hide = (row: HTMLElement) => {
        gsap.to(slotOf(row), { width: 0, marginRight: 0, duration: 0.45, ease: "expo.inOut", overwrite: "auto" });
        gsap.to(imgOf(row), { scale: 1.25, duration: 0.5, ease: "power2.out", overwrite: "auto" });
      };

      const focusRow = (row: HTMLElement) => {
        show(row);
        rows.forEach((other) => {
          if (other !== row) hide(other);
        });
        gsap.to(
          bodies.filter((body) => body.closest("[data-prow]") !== row),
          { opacity: 0.3, duration: 0.4, ease: "power2.out", overwrite: "auto" }
        );
        gsap.to(
          bodies.filter((body) => body.closest("[data-prow]") === row),
          { opacity: 1, duration: 0.4, ease: "power2.out", overwrite: "auto" }
        );
      };

      const clear = () => {
        rows.forEach(hide);
        gsap.to(bodies, { opacity: 1, duration: 0.5, ease: "power2.out", overwrite: "auto" });
      };

      if (window.matchMedia("(hover: hover)").matches) {
        rows.forEach((row) => {
          const enter = () => focusRow(row);
          row.addEventListener("pointerenter", enter);
          row.addEventListener("focus", enter);
          row.addEventListener("blur", clear);
          cleanups.push(() => {
            row.removeEventListener("pointerenter", enter);
            row.removeEventListener("focus", enter);
            row.removeEventListener("blur", clear);
          });
        });

        if (list) {
          list.addEventListener("pointerleave", clear);
          cleanups.push(() => list.removeEventListener("pointerleave", clear));
        }
      } else {
        let current: HTMLElement | null = null;

        rows.forEach((row) => {
          const toggle = () => {
            if (current === row) {
              current = null;
              clear();
              return;
            }
            current = row;
            focusRow(row);
          };
          row.addEventListener("click", toggle);
          cleanups.push(() => row.removeEventListener("click", toggle));
        });
      }

      return () => cleanups.forEach((cleanup) => cleanup());
    });

    return () => mm.revert();
  }, []);

  useLayoutEffect(() => {
    const scope = root.current;
    if (!scope) return;

    filterRef.current = filter;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const d = reduce || first.current ? 0 : 0.7;
    const rows = gsap.utils.toArray<HTMLElement>("[data-prow]", scope);

    rows.forEach((row) => {
      const show = filter === "todos" || row.dataset.cat === filter;
      gsap.to(row, {
        height: show ? "auto" : 0,
        autoAlpha: show ? 1 : 0,
        duration: d,
        delay: show ? d * 0.2 : 0,
        ease: "power3.inOut",
        overwrite: "auto",
      });
    });

    const place = (duration: number) => {
      const tab = scope.querySelector<HTMLElement>(`[data-tab="${filterRef.current}"]`);
      const indicator = scope.querySelector<HTMLElement>("[data-ind]");
      if (!tab || !indicator) return;
      gsap.to(indicator, {
        x: tab.offsetLeft,
        width: tab.offsetWidth,
        duration,
        ease: "power3.out",
        overwrite: "auto",
      });
    };

    place(d * 0.8);

    const onResize = () => place(0);
    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(() => place(0));

    let refresh: gsap.core.Tween | null = null;
    if (!first.current) {
      refresh = gsap.delayedCall(d + 0.15, () => ScrollTrigger.refresh());
    }
    first.current = false;

    return () => {
      window.removeEventListener("resize", onResize);
      refresh?.kill();
    };
  }, [filter]);

  return (
    <section
      ref={root}
      id="portfolio"
      aria-labelledby="portfolio-title"
      className="pf-sans relative w-full px-5 py-28 selection:bg-white/20 md:px-10 md:py-44"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@1&display=swap');
        .pf-sans { font-family: 'Geist', 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
        .pf-mono { font-family: 'Geist Mono', 'SF Mono', ui-monospace, Menlo, monospace; }
        .pf-serif { font-family: 'Instrument Serif', 'Times New Roman', serif; font-style: italic; font-weight: 400; font-size: 1.14em; letter-spacing: -0.01em; }
      `}</style>

      <div className="mx-auto w-full max-w-[1200px]">
        <div data-pheader className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p
              data-eyebrow
              className="mb-6 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.3em] md:mb-9"
              style={{ color: colors.dim }}
            >
              <span className="h-px w-8" style={{ backgroundColor: colors.dim }} />
              Portfólio
            </p>

            <h2
              id="portfolio-title"
              className="text-[clamp(2.1rem,5.6vw,4.75rem)] font-semibold leading-[1.04] tracking-[-0.045em]"
              style={{ color: colors.strong }}
            >
              <Line>Projetos que</Line>
              <Line>
                <span className="pf-serif" style={{ color: colors.accent }}>
                  entregam
                </span>
              </Line>
            </h2>
          </div>

          <div data-tabs role="group" aria-label="Filtrar projetos" className="relative flex gap-6 md:gap-8">
            {filters.map((item) => (
              <button
                key={item.id}
                data-tab={item.id}
                type="button"
                aria-pressed={filter === item.id}
                onClick={() => setFilter(item.id)}
                className="pf-mono py-2 text-[12px] uppercase tracking-[0.2em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A78BFA]"
                style={{ color: filter === item.id ? colors.strong : colors.dim }}
              >
                {item.label}
              </button>
            ))}
            <span
              data-ind
              aria-hidden
              className="absolute bottom-0 left-0 block h-px"
              style={{ width: 0, backgroundColor: colors.strong }}
            />
          </div>
        </div>

        <p className="sr-only" aria-live="polite">
          {visibleCount} {visibleCount === 1 ? "projeto" : "projetos"}
        </p>

        <div data-plist className="mt-14 md:mt-20">
          <span data-pdraw aria-hidden className="block h-px w-full" style={{ backgroundColor: colors.line }} />

          <ul>
            {projects.map((project, i) => {
              const show = filter === "todos" || project.category === filter;

              return (
                <li
                  key={project.parts.join(" ")}
                  data-prow
                  data-cat={project.category}
                  tabIndex={show ? 0 : -1}
                  aria-hidden={!show}
                  aria-label={`${project.parts.join(" ")}. ${project.description}`}
                  className="relative overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#A78BFA]"
                >
                  <div
                    data-pbody
                    className="grid gap-x-8 gap-y-5 py-7 md:grid-cols-[6rem_1fr] md:py-10"
                  >
                    <div
                      data-pfade
                      className="pf-mono flex items-center gap-4 text-[11px] uppercase tracking-[0.2em] md:flex-col md:items-start md:gap-2 md:pt-3"
                    >
                      <span style={{ color: colors.dim }}>{pad(i + 1)}</span>
                      <span style={{ color: colors.muted }}>{project.category}</span>
                    </div>

                    <div>
                      <h3
                        data-pfade
                        className="text-[clamp(1.9rem,4vw,3.9rem)] font-semibold leading-[1.08] tracking-[-0.045em]"
                        style={{ color: colors.strong }}
                      >
                        {project.parts[0]}{" "}
                        <span
                          data-slot
                          aria-hidden
                          className="hidden h-[0.84em] overflow-hidden rounded-[0.12em] align-[-0.05em] md:inline-block"
                          style={{ width: 0 }}
                        >
                          <span data-slot-img className="block h-full w-[1.3em]">
                            <Media project={project} seed={i} />
                          </span>
                        </span>
                        {project.parts[1]}
                      </h3>

                      <div data-pfade className="mt-4 aspect-[16/10] w-full max-w-[320px] overflow-hidden rounded-xl md:hidden">
                        <Media project={project} seed={i} />
                      </div>

                      <div className="mt-5 flex flex-col gap-4 md:mt-6 md:flex-row md:items-start md:justify-between md:gap-10">
                        <p
                          data-pfade
                          className="max-w-[460px] text-[15px] leading-[1.55] tracking-[-0.01em] md:text-[17px]"
                          style={{ color: colors.muted }}
                        >
                          {project.description}
                        </p>

                        <ul
                          data-pfade
                          className="pf-mono flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] md:max-w-[260px] md:justify-end md:text-right"
                          style={{ color: colors.dim }}
                        >
                          {project.stack.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <span data-pdraw aria-hidden className="absolute bottom-0 left-0 block h-px w-full" style={{ backgroundColor: colors.line }} />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Component;