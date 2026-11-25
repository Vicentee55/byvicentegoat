import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const IMAGE = "/logo.jpg";

const colors = {
  bg: "#0A0A0B",
  panel: "#0A0A0B",
  strong: "#FFFFFF",
  text: "#EDEDEF",
  muted: "#8B8B90",
  dim: "#5C5C61",
  accent: "#A78BFA",
  line: "rgba(255,255,255,0.14)",
  faint: "rgba(255,255,255,0.1)",
};

const about = {
  lead: "Somos a",
  name: "GoatRealm",
  paragraphs: [
    "Uma empresa focada em desenvolvimento de sistemas web, aplicativos mobile e desktop, além de soluções digitais personalizadas sob demanda.",
    "Trabalhamos com especialistas dedicados para entregar projetos modernos, escaláveis e sob medida. Nossa abordagem combina expertise técnica com profundo entendimento das necessidades do seu negócio.",
  ],
  values: ["Inovação", "Qualidade", "Transparência", "Parceria", "Comprometimento"],
};

const services = [
  {
    title: "Sistemas web",
    text: "Plataformas robustas e escaláveis, de dashboards administrativos a e-commerces completos.",
    tags: ["React / Next.js", "APIs REST & GraphQL", "Cloud native"],
  },
  {
    title: "Apps mobile",
    text: "Aplicativos iOS e Android com experiência nativa e performance excepcional.",
    tags: ["React Native", "iOS & Android", "Offline-first"],
  },
  {
    title: "Software desktop",
    text: "Aplicações desktop poderosas para Windows, macOS e Linux.",
    tags: ["Electron / Tauri", "Multiplataforma", "Atualização automática"],
  },
  {
    title: "Soluções sob medida",
    text: "Desenvolvimento sob medida para as necessidades únicas do seu negócio.",
    tags: ["ERPs & CRMs", "Automação", "Escalabilidade"],
  },
  {
    title: "Integrações",
    text: "Conectamos seus sistemas e automatizamos processos com APIs modernas.",
    tags: ["REST & GraphQL", "Webhooks", "Tempo real"],
  },
];

const pad = (n: number) => String(n).padStart(2, "0");

const Line = ({ children }: { children: ReactNode }) => (
  <span className="-my-[0.1em] block overflow-hidden py-[0.1em]">
    <span data-line className="block will-change-transform">
      {children}
    </span>
  </span>
);

const Label = ({ children }: { children: ReactNode }) => (
  <p
    data-fade
    className="sv-mono text-[11px] font-medium uppercase tracking-[0.24em]"
    style={{ color: colors.dim }}
  >
    {children}
  </p>
);

const Draw = ({ className = "" }: { className?: string }) => (
  <span
    data-draw
    aria-hidden
    className={`block h-px w-full origin-left ${className}`}
    style={{ backgroundColor: colors.line }}
  />
);

export const Component = () => {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const scope = root.current;
    if (!scope) return;

    const stage = scope.querySelector<HTMLElement>("[data-stage]");
    const track = scope.querySelector<HTMLElement>("[data-track]");
    if (!stage || !track) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: reduce)", () => {
      stage.style.overflowX = "auto";
      stage.tabIndex = 0;
      return () => {
        stage.style.overflowX = "";
        stage.removeAttribute("tabindex");
      };
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const panels = gsap.utils.toArray<HTMLElement>("[data-panel]", track);
      const image = scope.querySelector<HTMLElement>("[data-img]");

      const distance = () => Math.max(0, track.scrollWidth - stage.clientWidth);

      const move = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: () => `+=${distance() * 1.5}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      const build = (panel: HTMLElement) => {
        const rules = gsap.utils.toArray<HTMLElement>("[data-rule]", panel);
        const lines = gsap.utils.toArray<HTMLElement>("[data-line]", panel);
        const fades = gsap.utils.toArray<HTMLElement>("[data-fade]", panel);
        const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });

        if (rules.length) {
          tl.from(rules, { scaleX: 0, transformOrigin: "left center", duration: 1.3, ease: "expo.inOut" }, 0);
        }
        if (lines.length) {
          tl.from(lines, { yPercent: 110, duration: 1.3, stagger: 0.1, ease: "expo.out" }, 0.1);
        }
        if (fades.length) {
          tl.from(fades, { y: 18, opacity: 0, duration: 1, stagger: 0.08 }, 0.3);
        }
        return tl;
      };

      panels.forEach((panel, i) => {
        const tl = build(panel);

        if (i === 0) {
          ScrollTrigger.create({
            trigger: scope,
            start: "top 70%",
            once: true,
            onEnter: () => tl.play(),
          });
          return;
        }

        ScrollTrigger.create({
          trigger: panel,
          containerAnimation: move,
          start: "left 78%",
          onEnter: () => tl.play(),
          onLeaveBack: () => tl.reverse(),
        });

        const draws = gsap.utils.toArray<HTMLElement>("[data-draw]", panel);
        if (draws.length) {
          gsap.fromTo(
            draws,
            { scaleX: 0 },
            {
              scaleX: 1,
              transformOrigin: "left center",
              ease: "none",
              stagger: 0.14,
              scrollTrigger: {
                trigger: panel,
                containerAnimation: move,
                start: "left 88%",
                end: "left 2%",
                scrub: true,
              },
            }
          );
        }
      });

      if (image && panels[0]) {
        gsap.set(image, { scale: 1.2 });
        gsap.fromTo(
          image,
          { xPercent: -7 },
          {
            xPercent: 7,
            ease: "none",
            scrollTrigger: {
              trigger: panels[0],
              containerAnimation: move,
              start: "left left",
              end: "right left",
              scrub: true,
            },
          }
        );
      }
    });

    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={root}
      id="servicos"
      aria-labelledby="servicos-title"
      className="sv-sans relative w-full selection:bg-white/20"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap');
        .sv-sans { font-family: 'Geist', 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
        .sv-mono { font-family: 'Geist Mono', 'SF Mono', ui-monospace, Menlo, monospace; }
      `}</style>

      <div data-stage className="relative w-full overflow-hidden" style={{ height: "100svh" }}>
        <div data-track className="flex h-full w-max will-change-transform">
          <div data-panel className="flex h-full w-screen shrink-0 flex-col md:flex-row">
            <div
              className="relative h-[27%] w-full shrink-0 overflow-hidden md:h-full md:w-[45%]"
              style={{ backgroundColor: colors.panel }}
            >
              <img
                data-img
                src={IMAGE}
                alt=""
                draggable={false}
                onError={(e) => (e.currentTarget.style.display = "none")}
                className="absolute inset-0 h-full w-full select-none object-contain p-[12%] mix-blend-screen"
                style={{ opacity: 0.85 }}
              />
            </div>

            <div className="flex min-h-0 flex-1 flex-col justify-between px-5 pb-8 pt-8 md:px-14 md:pb-[8vh] md:pt-[15vh]">
              <div>
                <span data-rule aria-hidden className="-mr-5 block h-px md:-mr-14" style={{ backgroundColor: colors.line }} />
                <div className="mt-5 md:mt-7">
                  <Label>Sobre nós</Label>
                </div>

                <h2
                  id="servicos-title"
                  className="mt-4 text-[clamp(2.1rem,min(5.6vw,9vh),4.75rem)] font-semibold leading-[1.04] tracking-[-0.045em] md:mt-6"
                  style={{ color: colors.strong }}
                >
                  <Line>
                    <span style={{ color: colors.muted }}>{about.lead}</span>
                  </Line>
                  <Line>{about.name}</Line>
                </h2>

                <div className="mt-4 flex max-w-[560px] flex-col gap-3 md:mt-7 md:gap-4">
                  {about.paragraphs.map((text) => (
                    <p
                      key={text}
                      data-fade
                      className="text-[clamp(0.8rem,min(1.45vw,2.3vh),1.15rem)] leading-[1.55] tracking-[-0.01em]"
                      style={{ color: colors.muted }}
                    >
                      {text}
                    </p>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <Label>Valores</Label>
                <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 md:mt-4 md:flex-col md:gap-y-1.5">
                  {about.values.map((value) => (
                    <li
                      key={value}
                      data-fade
                      className="text-[13px] leading-[1.4] md:text-[clamp(0.8rem,1.9vh,1rem)]"
                      style={{ color: colors.text }}
                    >
                      {value}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div
            data-panel
            className="flex h-full w-screen shrink-0 flex-col justify-center px-5 pb-6 pt-16 md:px-14 md:pb-[6vh] md:pt-[12vh]"
          >
            <div className="mx-auto w-full max-w-[1280px]">
              <div className="mb-4 flex items-end md:mb-6">
                <h3
                  data-fade
                  className="sv-mono text-[11px] font-medium uppercase tracking-[0.24em]"
                  style={{ color: colors.dim }}
                >
                  O que fazemos
                </h3>
              </div>

              <ul>
                <li aria-hidden>
                  <Draw />
                </li>

                {services.map((service, i) => (
                  <li key={service.title} className="relative">
                    <div
                      data-fade
                      className="grid grid-cols-[1.75rem_1fr] gap-x-3 gap-y-1.5 py-3.5 md:grid-cols-[4rem_1.1fr_1.3fr_1fr] md:items-center md:gap-x-8 md:py-[clamp(1rem,3.4vh,2.2rem)]"
                    >
                      <span className="sv-mono text-[11px] md:text-[12px]" style={{ color: colors.dim }}>
                        {pad(i + 1)}
                      </span>

                      <h4
                        className="text-[20px] font-medium leading-[1.1] tracking-[-0.04em] md:text-[clamp(1.4rem,min(2.7vw,4.6vh),2.75rem)]"
                        style={{ color: colors.strong }}
                      >
                        {service.title}
                      </h4>

                      <p
                        className="col-start-2 text-[12.5px] leading-[1.45] md:col-start-auto md:text-[clamp(0.85rem,1.25vw,1.05rem)] md:leading-[1.5]"
                        style={{ color: colors.muted }}
                      >
                        {service.text}
                      </p>

                      <ul
                        className="sv-mono col-start-2 flex flex-wrap gap-x-3.5 gap-y-0.5 text-[10.5px] md:col-start-auto md:flex-col md:items-end md:gap-y-1 md:text-[12px]"
                        style={{ color: colors.dim }}
                      >
                        {service.tags.map((tag) => (
                          <li key={tag}>{tag}</li>
                        ))}
                      </ul>
                    </div>
                    <Draw className="absolute bottom-0 left-0" />
                  </li>
                ))}
              </ul>

              <a
                data-fade
                href="#contato"
                className="group mt-5 inline-flex items-center gap-2 text-[15px] font-medium transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A78BFA] md:mt-8 md:text-[17px]"
                style={{ color: colors.muted }}
              >
                Iniciar um projeto
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  strokeWidth={2}
                  aria-hidden
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Component;