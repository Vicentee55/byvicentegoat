import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUp } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const BRAND = "GoatRealm";
const OWNER = "GoatRealm by Kawe Vicente";
const TAGLINE = "Sistemas web, apps e software desktop sob medida, com código documentado e comunicação clara.";
const LOGO = "/logo.jpg";
const WHATSAPP = "https://wa.me/5513981292703";
const LINKEDIN = "https://www.linkedin.com/in/vicente33/";

const colors = {
  bg: "#0D0D0D",
  strong: "#FFFFFF",
  text: "rgba(255,255,255,0.58)",
  dim: "rgba(255,255,255,0.38)",
  line: "rgba(255,255,255,0.12)",
};

type FooterLink = { label: string; href: string; external?: boolean };

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Menu",
    links: [
      { label: "Início", href: "#inicio" },
      { label: "Sobre", href: "#sobre" },
      { label: "Serviços", href: "#servicos" },
      { label: "Contato", href: "#contato" },
    ],
  },
  {
    title: "Soluções",
    links: [
      { label: "Sistemas web", href: "#servicos" },
      { label: "Apps mobile", href: "#servicos" },
      { label: "Software desktop", href: "#servicos" },
    ],
  },
  {
    title: "Contato",
    links: [
      { label: "WhatsApp", href: WHATSAPP, external: true },
      { label: "LinkedIn", href: LINKEDIN, external: true },
    ],
  },
];

const socials: FooterLink[] = [
  { label: "Instagram", href: "https://www.instagram.com/dev_white3/", external: true },
  { label: "YouTube", href: "https://www.youtube.com/@zWhitezinn55", external: true },
  { label: "GitHub", href: "https://github.com/Vicentee55", external: true },
  { label: "LinkedIn", href: LINKEDIN, external: true },
];

const blurSteps = [
  { px: 0.6, from: 0, to: 40 },
  { px: 1.2, from: 20, to: 70 },
  { px: 2.4, from: 45, to: 100 },
];

const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";

const YEAR = new Date().getFullYear();

export const Footer = () => {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    const footer = footerRef.current;
    if (!outer || !inner || !footer) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const q = <T extends HTMLElement>(selector: string) => gsap.utils.toArray<T>(selector, footer);
      const cleanups: Array<() => void> = [];

      const curtain = () => {
        const height = footer.offsetHeight;
        const fits = height > 0 && height <= window.innerHeight;
        outer.style.height = fits ? `${height}px` : "";
        inner.style.position = fits ? "fixed" : "";
        inner.style.bottom = fits ? "0" : "";
        inner.style.left = fits ? "0" : "";
        inner.style.width = fits ? "100%" : "";
      };

      curtain();
      const observer = new ResizeObserver(() => {
        curtain();
        ScrollTrigger.refresh();
      });
      observer.observe(footer);
      cleanups.push(() => {
        observer.disconnect();
        outer.style.height = "";
        inner.style.position = "";
        inner.style.bottom = "";
        inner.style.left = "";
        inner.style.width = "";
      });

      gsap
        .timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: outer, start: "top 75%", once: true },
        })
        .from(q("[data-top]"), { y: 24, opacity: 0, duration: 1, stagger: 0.08 })
        .from(
          q("[data-rule]"),
          { scaleX: 0, transformOrigin: "left center", duration: 1.5, ease: "expo.inOut" },
          0.2
        )
        .from(q("[data-bottom]"), { y: 14, opacity: 0, duration: 1, stagger: 0.06 }, 0.5);

      const letters = q("[data-letter]");
      if (letters.length) {
        gsap.fromTo(
          letters,
          { yPercent: 110 },
          {
            yPercent: 0,
            ease: "none",
            stagger: 0.05,
            scrollTrigger: {
              trigger: outer,
              start: "top bottom",
              end: "bottom bottom",
              scrub: 1,
            },
          }
        );
      }

      q("[data-group]").forEach((box) => {
        const links = gsap.utils.toArray<HTMLElement>("[data-link]", box);

        links.forEach((link) => {
          const enter = () => {
            gsap.to(
              links.filter((other) => other !== link),
              { opacity: 0.35, duration: 0.35, ease: "power2.out", overwrite: "auto" }
            );
            gsap.to(link, { opacity: 1, x: 3, duration: 0.35, ease: "power2.out", overwrite: "auto" });
          };
          const leave = () => {
            gsap.to(links, { opacity: 1, x: 0, duration: 0.45, ease: "power2.out", overwrite: "auto" });
          };

          link.addEventListener("pointerenter", enter);
          link.addEventListener("pointerleave", leave);
          link.addEventListener("focus", enter);
          link.addEventListener("blur", leave);
          cleanups.push(() => {
            link.removeEventListener("pointerenter", enter);
            link.removeEventListener("pointerleave", leave);
            link.removeEventListener("focus", enter);
            link.removeEventListener("blur", leave);
          });
        });
      });

      return () => cleanups.forEach((cleanup) => cleanup());
    });

    return () => mm.revert();
  }, []);

  const backToTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div
      ref={outerRef}
      id="rodape"
      data-footer-outer
      className="relative"
      style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
    >
      <div ref={innerRef}>
        <footer
          ref={footerRef}
          aria-label="Rodapé"
          className="ft-sans relative w-full overflow-hidden px-6 pt-14 selection:bg-white/20 md:px-16 md:pt-20"
          style={{ backgroundColor: colors.bg, color: colors.text }}
        >
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap');
            .ft-sans { font-family: 'Geist', 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
          `}</style>

          <div className="mx-auto w-full max-w-[1280px]">
            <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:gap-8">
              <div data-top className="flex items-start gap-4">
                <a
                  href="#inicio"
                  aria-label={`${BRAND}, ir para o início`}
                  className={`flex shrink-0 items-center gap-3 text-[22px] font-semibold tracking-[-0.03em] ${focus}`}
                  style={{ color: colors.strong }}
                >
                  <img
                    src={LOGO}
                    alt=""
                    draggable={false}
                    onError={(e) => (e.currentTarget.style.display = "none")}
                    className="h-9 w-9 shrink-0 rounded-[10px] border object-cover"
                    style={{ borderColor: colors.line }}
                  />
                  {BRAND}
                </a>
                <span aria-hidden className="mt-1 h-6 w-px shrink-0" style={{ backgroundColor: colors.line }} />
                <p className="mt-0.5 max-w-[260px] text-[12px] leading-[1.6]">{TAGLINE}</p>
              </div>

              {columns.map((col) => (
                <nav key={col.title} data-top data-group aria-label={col.title}>
                  <h3 className="mb-5 text-[13px] font-medium" style={{ color: colors.strong }}>
                    {col.title}
                  </h3>
                  <ul className="flex flex-col gap-3.5">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <a
                          data-link
                          href={link.href}
                          {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                          className={`inline-block text-[13px] transition-colors hover:text-white ${focus}`}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>

            <span
              data-rule
              aria-hidden
              className="mt-14 block h-px w-full md:mt-16"
              style={{ backgroundColor: colors.line }}
            />

            <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 pt-6 text-[12px]">
              <p data-bottom style={{ color: colors.dim }}>
                © {YEAR} {OWNER}. Todos os direitos reservados.
              </p>

              <div data-bottom data-group className="flex flex-wrap items-center gap-x-6 gap-y-3">
                {socials.map((item) => (
                  <a
                    key={item.label}
                    data-link
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`transition-colors hover:text-white ${focus}`}
                    style={{ color: colors.strong }}
                  >
                    {item.label}
                  </a>
                ))}
                <button
                  type="button"
                  onClick={backToTop}
                  aria-label="Voltar ao topo"
                  className={`inline-flex items-center gap-1.5 transition-colors hover:text-white ${focus}`}
                  style={{ color: colors.dim }}
                >
                  Topo
                  <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                </button>
              </div>
            </div>
          </div>

          <div
            aria-hidden
            className="relative mx-auto mt-8 w-full select-none overflow-hidden whitespace-nowrap py-[0.04em] text-center font-bold text-white md:mt-12"
            style={{
              fontSize: "clamp(3rem, 17.5vw, 24rem)",
              lineHeight: 0.92,
              letterSpacing: "-0.055em",
            }}
          >
            {BRAND.split("").map((char, i) => (
              <span key={i} data-letter className="inline-block will-change-transform">
                {char}
              </span>
            ))}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%]">
              {blurSteps.map((step, i) => (
                <div
                  key={i}
                  className="absolute inset-0"
                  style={{
                    backdropFilter: `blur(${step.px}px)`,
                    WebkitBackdropFilter: `blur(${step.px}px)`,
                    maskImage: `linear-gradient(to bottom, transparent ${step.from}%, #000 ${step.from + 20}%, #000 ${step.to}%, transparent ${Math.min(step.to + 20, 100)}%)`,
                    WebkitMaskImage: `linear-gradient(to bottom, transparent ${step.from}%, #000 ${step.from + 20}%, #000 ${step.to}%, transparent ${Math.min(step.to + 20, 100)}%)`,
                  }}
                />
              ))}
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to bottom, rgba(13,13,13,0) 0%, rgba(13,13,13,0.7) 100%)" }}
              />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Footer;