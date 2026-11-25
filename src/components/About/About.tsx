import { Fragment, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const colors = {
  bg: "#0A0A0B",
  text: "#F4F4F6",
  muted: "#8B8B90",
  dim: "#5C5C61",
  line: "rgba(255,255,255,0.08)",
  accent: "#A78BFA",
};

type Word = { w: string; k?: "accent" | "serif" };

const words: Word[] = [
  { w: "Sistemas" },
  { w: "web," },
  { w: "apps" },
  { w: "e" },
  { w: "software" },
  { w: "desktop" },
  { w: "sob", k: "accent" },
  { w: "medida,", k: "accent" },
  { w: "com" },
  { w: "código" },
  { w: "documentado," },
  { w: "entregas" },
  { w: "escaláveis" },
  { w: "e" },
  { w: "comunicação" },
  { w: "clara.", k: "serif" },
];

const statement = words.map((item) => item.w).join(" ");

export const Component = () => {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const scope = root.current;
    if (!scope) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const chars = gsap.utils.toArray<HTMLElement>("[data-char]", scope);

      gsap.fromTo(
        chars,
        { opacity: 0.15 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.05,
          scrollTrigger: {
            trigger: scope.querySelector("[data-text]"),
            start: "top 80%",
            end: "bottom 45%",
            scrub: 0.5,
          },
        }
      );
    });

    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={root}
      id="sobre"
      aria-labelledby="sobre-title"
      className="ab-sans relative w-full pb-28 pt-4 md:pb-40 md:pt-8"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Instrument+Serif:ital@1&display=swap');
        .ab-sans { font-family: 'Geist', 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
        .ab-serif { font-family: 'Instrument Serif', 'Times New Roman', serif; font-style: italic; font-weight: 400; font-size: 1.14em; letter-spacing: -0.01em; }
        .ab-sans ::selection { background: rgba(167, 139, 250, 0.35); }
      `}</style>

      <div className="w-full">
        <div className="mx-auto w-full max-w-[1200px] px-5 md:px-10">
          <h2
            id="sobre-title"
            className="mb-6 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.3em] md:mb-9"
            style={{ color: colors.dim }}
          >
            <span className="h-px w-8" style={{ backgroundColor: colors.dim }} />
            Sobre a GoatRealm
          </h2>

          <p
            id="servicos"
            data-text
            className="max-w-[1040px] text-[clamp(1.85rem,5.2vw,4.5rem)] font-medium leading-[1.08] tracking-[-0.04em]"
          >
            <span className="sr-only">{statement}</span>
            <span aria-hidden>
              {words.map((item, i) => (
                <Fragment key={i}>
                  <span
                    className={`inline-block whitespace-nowrap ${item.k === "serif" ? "ab-serif" : ""}`}
                    style={item.k === "accent" ? { color: colors.accent } : undefined}
                  >
                    {item.w.split("").map((char, j) => (
                      <span key={j} data-char>
                        {char}
                      </span>
                    ))}
                  </span>{" "}
                </Fragment>
              ))}
            </span>
          </p>

          <a
            href="#servicos"
            className="group mt-8 inline-flex items-center gap-2 text-[15px] font-medium transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A78BFA] md:mt-10 md:text-[17px]"
            style={{ color: colors.muted }}
          >
            Conhecer serviços
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              strokeWidth={2}
              aria-hidden
            />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Component;