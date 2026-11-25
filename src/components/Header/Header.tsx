import { useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { X } from "lucide-react";
import "./header.css";

const navItems = [
  { title: "Home", href: "#inicio" },
  { title: "Work", href: "#servicos" },
  { title: "About", href: "#sobre" },
  { title: "Contact", href: "#contato" },
];

const socials = [
  { title: "Instagram", href: "https://www.instagram.com/dev_white3/" },
  { title: "YouTube", href: "https://www.youtube.com/@zWhitezinn55" },
  { title: "GitHub", href: "https://github.com/Vicentee55" },
  { title: "LinkedIn", href: "https://www.linkedin.com/in/vicente33/" },
  { title: "WhatsApp", href: "https://wa.me/5513981292703" },
];

const ease = [0.76, 0, 0.24, 1] as const;

const menuSlide = {
  initial: { x: "calc(100% + 40px)", opacity: 0 },
  enter: { x: "0%", opacity: 1, transition: { duration: 0.8, ease } },
  exit: { x: "calc(100% + 40px)", opacity: 0, transition: { duration: 0.8, ease } },
};

const linkSlide = {
  initial: { x: 60, opacity: 0 },
  enter: (index: number) => ({
    x: 0,
    opacity: 1,
    transition: { duration: 0.7, delay: 0.25 + 0.06 * index, ease },
  }),
  exit: (index: number) => ({
    x: 60,
    opacity: 0,
    transition: { duration: 0.5, delay: 0.03 * index, ease },
  }),
};

const mapUrl = (stops: [string, string, string, string], vertical: boolean) => {
  const [a, b, c, d] = stops;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'><defs><linearGradient id='g' x1='0' y1='0' x2='${vertical ? 0 : 1}' y2='${vertical ? 1 : 0}'><stop offset='0' stop-color='${a}'/><stop offset='.2' stop-color='${b}'/><stop offset='.8' stop-color='${c}'/><stop offset='1' stop-color='${d}'/></linearGradient></defs><rect width='100' height='100' fill='url(#g)'/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const mapX = mapUrl(["rgb(255,128,128)", "rgb(128,128,128)", "rgb(128,128,128)", "rgb(0,128,128)"], false);
const mapY = mapUrl(["rgb(128,255,128)", "rgb(128,128,128)", "rgb(128,128,128)", "rgb(128,0,128)"], true);

function GlassFilter() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <filter
        id="lg-refract"
        x="0"
        y="0"
        width="1"
        height="1"
        colorInterpolationFilters="sRGB"
      >
        <feImage href={mapX} preserveAspectRatio="none" result="mx" />
        <feImage href={mapY} preserveAspectRatio="none" result="my" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="mx"
          scale="46"
          xChannelSelector="R"
          yChannelSelector="B"
          result="dx"
        />
        <feDisplacementMap
          in="dx"
          in2="my"
          scale="46"
          xChannelSelector="B"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}

function Menu({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState("#inicio");

  return (
    <motion.aside
      className="glass header-menu"
      variants={menuSlide}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      <button
        type="button"
        className="glass lg-button header-menu__close"
        data-glass-interactive
        aria-label="Close navigation"
        onClick={onClose}
      >
        <X size={22} strokeWidth={1.5} />
      </button>

      <div className="header-menu__body">
        <nav className="header-menu__nav" onMouseLeave={() => setSelected("#inicio")}>
          {navItems.map((item, index) => (
            <motion.div
              key={item.href}
              className="header-menu__link"
              custom={index}
              variants={linkSlide}
              initial="initial"
              animate="enter"
              exit="exit"
              onMouseEnter={() => setSelected(item.href)}
            >
              <motion.span
                className="header-menu__indicator"
                animate={{ scale: selected === item.href ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 24 }}
              />
              <a href={item.href} onClick={onClose}>
                {item.title}
              </a>
            </motion.div>
          ))}
        </nav>

<div className="header-menu__footer">
  {socials.map((social) => (
    <a
      key={social.title}
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {social.title}
    </a>
  ))}
</div>
      </div>
    </motion.aside>
  );
}

export default function Header() {
  const button = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    gsap.set(button.current, { scale: window.scrollY > window.innerHeight ? 1 : 0 });

    const trigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 0,
      end: "100vh",
      onLeave: () => gsap.to(button.current, { scale: 1, duration: 0.25, ease: "power1.out" }),
      onEnterBack: () => {
        setIsActive(false);
        gsap.to(button.current, { scale: 0, duration: 0.25, ease: "power1.out" });
      },
    });

    const onPointerMove = (event: PointerEvent) => {
      const target = (event.target as HTMLElement).closest<HTMLElement>("[data-glass-interactive]");
      if (!target) return;
      const rect = target.getBoundingClientRect();
      target.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      target.style.setProperty("--my", `${event.clientY - rect.top}px`);
    };

    document.addEventListener("pointermove", onPointerMove);

    return () => {
      trigger.kill();
      document.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <>
      <GlassFilter />

      <div
        ref={button}
        className={`header-button-container${isActive ? " header-button-container--hidden" : ""}`}
      >
        <button
          type="button"
          className="glass lg-button header-button"
          data-glass-interactive
          aria-label={isActive ? "Close navigation" : "Open navigation"}
          aria-expanded={isActive}
          onClick={() => setIsActive((active) => !active)}
        >
          <span className={`header-burger${isActive ? " header-burger--active" : ""}`} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isActive && <Menu onClose={() => setIsActive(false)} />}
      </AnimatePresence>
    </>
  );
}