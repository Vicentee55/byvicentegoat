import { useLayoutEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT as string | undefined;
const EMAIL = import.meta.env.VITE_CONTACT_EMAIL as string | undefined;
const WHATSAPP = "https://wa.me/5513981292703";
const LINKEDIN = "https://www.linkedin.com/in/vicente33/";

const colors = {
  bg: "#0A0A0B",
  strong: "#FFFFFF",
  text: "#EDEDEF",
  muted: "#8B8B90",
  dim: "#5C5C61",
  accent: "#A78BFA",
  error: "#FF8A8A",
  line: "rgba(255,255,255,0.16)",
};

type Key = "name" | "email" | "message";
type Status = "idle" | "sending" | "sent" | "error";
type Values = Record<Key, string> & { type: string };

const empty: Values = { name: "", email: "", message: "", type: "" };

const projectTypes = ["Sistema web", "App mobile", "Software desktop", "Outro"];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const validate = (key: Key, value: string) => {
  const text = value.trim();
  if (key === "name") return text.length < 2 ? "Informe seu nome." : "";
  if (key === "email") {
    if (!text) return "Informe seu e-mail.";
    return emailPattern.test(text) ? "" : "Digite um e-mail válido.";
  }
  return text.length < 10 ? "Escreva ao menos 10 caracteres." : "";
};

const Line = ({ children }: { children: ReactNode }) => (
  <span className="-my-[0.1em] block overflow-hidden py-[0.1em]">
    <span data-line className="block will-change-transform">
      {children}
    </span>
  </span>
);

const Field = ({
  id,
  label,
  message,
  children,
}: {
  id: Key;
  label: string;
  message: string;
  children: ReactNode;
}) => (
  <div data-cfade className="relative">
    <label
      htmlFor={`c-${id}`}
      className="ct-mono mb-1 block text-[11px] uppercase tracking-[0.22em]"
      style={{ color: colors.dim }}
    >
      {label}
    </label>
    <div className="relative">
      {children}
      <span aria-hidden className="absolute bottom-0 left-0 block h-px w-full" style={{ backgroundColor: colors.line }} />
      <span
        data-fline={id}
        aria-hidden
        className="absolute bottom-0 left-0 block h-px w-full origin-left"
        style={{ backgroundColor: colors.strong, transform: "scaleX(0)" }}
      />
    </div>
    <p
      id={`c-${id}-error`}
      data-err={id}
      className="overflow-hidden text-[13px]"
      style={{ height: 0, opacity: 0, color: colors.error }}
    >
      <span className="block pt-2">{message}</span>
    </p>
  </div>
);

const inputClass =
  "block w-full bg-transparent py-3 text-[18px] tracking-[-0.01em] text-white outline-none placeholder:text-[#5C5C61] md:text-[20px]";

export const Component = () => {
  const root = useRef<HTMLElement>(null);
  const prevStatus = useRef<Status>("idle");
  const errorsRef = useRef<Partial<Record<Key, string>>>({});
  const [values, setValues] = useState<Values>(empty);
  const [errors, setErrors] = useState<Partial<Record<Key, string>>>({});
  const [shown, setShown] = useState<Partial<Record<Key, string>>>({});
  const [status, setStatus] = useState<Status>("idle");

  const applyErrors = (next: Partial<Record<Key, string>>) => {
    errorsRef.current = next;
    setErrors(next);
    setShown((current) => {
      const merged = { ...current };
      (Object.keys(next) as Key[]).forEach((key) => {
        const text = next[key];
        if (text) merged[key] = text;
      });
      return merged;
    });
  };

  const lineFor = (key: Key) => root.current?.querySelector<HTMLElement>(`[data-fline="${key}"]`) ?? null;

  const setLine = (key: Key, active: boolean) => {
    const line = lineFor(key);
    if (!line) return;
    const failed = Boolean(errorsRef.current[key]);
    gsap.to(line, {
      scaleX: active || failed ? 1 : 0,
      backgroundColor: failed ? colors.error : colors.strong,
      duration: 0.6,
      ease: "expo.out",
      overwrite: "auto",
    });
  };

  const change = (key: Key | "type", value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    if (key !== "type" && errorsRef.current[key]) {
      applyErrors({ ...errorsRef.current, [key]: validate(key, value) });
    }
  };

  const blur = (key: Key) => {
    const next = validate(key, values[key]);
    applyErrors({ ...errorsRef.current, [key]: next });
    const line = lineFor(key);
    if (line) {
      gsap.to(line, {
        scaleX: next ? 1 : 0,
        backgroundColor: next ? colors.error : colors.strong,
        duration: 0.6,
        ease: "expo.out",
        overwrite: "auto",
      });
    }
  };

  const send = async (data: Values) => {
    if (ENDPOINT) {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...data, type: data.type || "Não informado" }),
      });
      if (!response.ok) throw new Error("request failed");
      return;
    }

    if (EMAIL) {
      const subject = encodeURIComponent(`Contato pelo site: ${data.type || "Projeto"}`);
      const body = encodeURIComponent(
        `Nome: ${data.name}\nE-mail: ${data.email}\nTipo de projeto: ${data.type || "Não informado"}\n\n${data.message}`
      );
      window.location.assign(`mailto:${EMAIL}?subject=${subject}&body=${body}`);
      return;
    }

    throw new Error("no destination");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;

    const form = event.currentTarget;
    const trap = (form.elements.namedItem("website") as HTMLInputElement | null)?.value;
    if (trap) {
      setStatus("sent");
      return;
    }

    const next: Partial<Record<Key, string>> = {
      name: validate("name", values.name),
      email: validate("email", values.email),
      message: validate("message", values.message),
    };
    applyErrors(next);

    const firstInvalid = (["name", "email", "message"] as Key[]).find((key) => next[key]);
    if (firstInvalid) {
      document.getElementById(`c-${firstInvalid}`)?.focus();
      return;
    }

    setStatus("sending");
    try {
      await send(values);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  const reset = () => {
    applyErrors({});
    setValues(empty);
    setStatus("idle");
  };

  useLayoutEffect(() => {
    const scope = root.current;
    if (!scope) return;

    const q = <T extends HTMLElement>(selector: string) => gsap.utils.toArray<T>(selector, scope);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const header = scope.querySelector<HTMLElement>("[data-cheader]");
      const form = scope.querySelector<HTMLElement>("[data-cform]");

      if (header) {
        gsap
          .timeline({
            defaults: { ease: "power3.out" },
            scrollTrigger: { trigger: header, start: "top 82%", once: true },
          })
          .from(q("[data-eyebrow]"), { y: 12, opacity: 0, duration: 1 })
          .from(q("[data-line]"), { yPercent: 110, duration: 1.3, stagger: 0.1, ease: "expo.out" }, 0.1)
          .from(q("[data-intro]"), { y: 16, opacity: 0, duration: 1, stagger: 0.08 }, 0.6);
      }

      if (form) {
        gsap.from(q("[data-cfade]"), {
          y: 26,
          opacity: 0,
          duration: 1,
          stagger: 0.09,
          ease: "power3.out",
          scrollTrigger: { trigger: form, start: "top 82%", once: true },
        });
      }
    });

    return () => mm.revert();
  }, []);

  useLayoutEffect(() => {
    const scope = root.current;
    if (!scope) return;

    errorsRef.current = errors;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const d = reduce ? 0 : 0.45;

    (["name", "email", "message"] as Key[]).forEach((key) => {
      const el = scope.querySelector<HTMLElement>(`[data-err="${key}"]`);
      const has = Boolean(errors[key]);
      if (el) {
        gsap.to(el, { height: has ? "auto" : 0, opacity: has ? 1 : 0, duration: d, ease: "power3.out", overwrite: "auto" });
      }

      const line = scope.querySelector<HTMLElement>(`[data-fline="${key}"]`);
      if (line) {
        const focused = document.activeElement?.id === `c-${key}`;
        gsap.to(line, {
          scaleX: has || focused ? 1 : 0,
          backgroundColor: has ? colors.error : colors.strong,
          duration: d,
          ease: "power3.out",
          overwrite: "auto",
        });
      }
    });
  }, [errors]);

  useLayoutEffect(() => {
    const scope = root.current;
    if (!scope) return;

    const previous = prevStatus.current;
    prevStatus.current = status;

    const form = scope.querySelector<HTMLElement>("[data-cform]");
    const done = scope.querySelector<HTMLElement>("[data-cdone]");
    if (!form || !done) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const d = reduce ? 0 : 1;

    if (status === "sent" && previous !== "sent") {
      const lines = gsap.utils.toArray<HTMLElement>("[data-dline]", done);
      const fades = gsap.utils.toArray<HTMLElement>("[data-dfade]", done);
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .to(form, { opacity: 0, y: -14, duration: 0.5 * d })
        .set(form, { display: "none" })
        .set(done, { display: "block" })
        .fromTo(lines, { yPercent: 110 }, { yPercent: 0, duration: 1.2 * d, stagger: 0.1, ease: "expo.out" })
        .fromTo(fades, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: d, stagger: 0.08 }, "<0.3");
      ScrollTrigger.refresh();
    }

    if (status === "idle" && previous === "sent") {
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .set(done, { display: "none" })
        .set(form, { display: "block", opacity: 0, y: 14 })
        .to(form, { opacity: 1, y: 0, duration: 0.7 * d });
      ScrollTrigger.refresh();
    }
  }, [status]);

  const pickType = (type: string, target: HTMLElement) => {
    change("type", values.type === type ? "" : type);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) gsap.fromTo(target, { scale: 0.93 }, { scale: 1, duration: 0.55, ease: "back.out(2.2)" });
  };

  return (
    <section
      ref={root}
      id="contato"
      aria-labelledby="contato-title"
      className="ct-sans relative w-full px-5 py-28 selection:bg-white/20 md:px-10 md:py-44"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@1&display=swap');
        .ct-sans { font-family: 'Geist', 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
        .ct-mono { font-family: 'Geist Mono', 'SF Mono', ui-monospace, Menlo, monospace; }
        .ct-serif { font-family: 'Instrument Serif', 'Times New Roman', serif; font-style: italic; font-weight: 400; font-size: 1.14em; letter-spacing: -0.01em; }
        .ct-sans input:-webkit-autofill, .ct-sans textarea:-webkit-autofill { -webkit-text-fill-color: #fff; transition: background-color 9999s ease-out; }
      `}</style>

      <div className="mx-auto grid w-full max-w-[1200px] gap-16 md:grid-cols-[1fr_1.15fr] md:gap-24">
        <div data-cheader className="md:sticky md:top-28 md:self-start">
          <p
            data-eyebrow
            className="mb-6 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.3em] md:mb-9"
            style={{ color: colors.dim }}
          >
            <span className="h-px w-8" style={{ backgroundColor: colors.dim }} />
            Contato
          </p>

          <h2
            id="contato-title"
            className="text-[clamp(2.1rem,5vw,4.25rem)] font-semibold leading-[1.04] tracking-[-0.045em]"
            style={{ color: colors.strong }}
          >
            <Line>Vamos tirar sua</Line>
            <Line>
              ideia do{" "}
              <span className="ct-serif" style={{ color: colors.accent }}>
                papel.
              </span>
            </Line>
          </h2>

          <p
            data-intro
            className="mt-6 max-w-[420px] text-[16px] leading-[1.55] tracking-[-0.01em] md:mt-8 md:text-[18px]"
            style={{ color: colors.muted }}
          >
            Conte o que você precisa e retornamos com o melhor caminho para o seu projeto.
          </p>

          <ul data-intro className="ct-mono mt-8 flex flex-col gap-3 text-[12px] uppercase tracking-[0.18em] md:mt-10">
            {[
              { label: "WhatsApp", href: WHATSAPP },
              { label: "LinkedIn", href: LINKEDIN },
            ].map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A78BFA]"
                  style={{ color: colors.muted }}
                >
                  {item.label}
                  <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <form data-cform noValidate onSubmit={submit} aria-label="Enviar mensagem" className="flex flex-col gap-9 md:gap-11">
            <Field id="name" label="Nome" message={errors.name || shown.name || ""}>
              <input
                id="c-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Seu nome"
                value={values.name}
                aria-invalid={Boolean(errors.name)}
                aria-describedby="c-name-error"
                onChange={(e) => change("name", e.target.value)}
                onFocus={() => setLine("name", true)}
                onBlur={() => blur("name")}
                className={inputClass}
              />
            </Field>

            <Field id="email" label="E-mail" message={errors.email || shown.email || ""}>
              <input
                id="c-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="voce@empresa.com"
                value={values.email}
                aria-invalid={Boolean(errors.email)}
                aria-describedby="c-email-error"
                onChange={(e) => change("email", e.target.value)}
                onFocus={() => setLine("email", true)}
                onBlur={() => blur("email")}
                className={inputClass}
              />
            </Field>

            <div data-cfade>
              <p id="c-type-label" className="ct-mono mb-3 text-[11px] uppercase tracking-[0.22em]" style={{ color: colors.dim }}>
                Tipo de projeto <span style={{ color: colors.dim }}>(opcional)</span>
              </p>
              <div role="radiogroup" aria-labelledby="c-type-label" className="flex flex-wrap gap-2.5">
                {projectTypes.map((type) => {
                  const active = values.type === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={(e) => pickType(type, e.currentTarget)}
                      className="rounded-full border px-4 py-2 text-[14px] transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A78BFA]"
                      style={{
                        borderColor: active ? colors.strong : colors.line,
                        backgroundColor: active ? colors.strong : "transparent",
                        color: active ? "#0A0A0B" : colors.muted,
                      }}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            <Field id="message" label="Mensagem" message={errors.message || shown.message || ""}>
              <textarea
                id="c-message"
                name="message"
                rows={4}
                placeholder="Conte um pouco sobre o projeto"
                value={values.message}
                aria-invalid={Boolean(errors.message)}
                aria-describedby="c-message-error"
                onChange={(e) => change("message", e.target.value)}
                onFocus={() => setLine("message", true)}
                onBlur={() => blur("message")}
                className={`${inputClass} resize-none`}
              />
            </Field>

            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
            />

            <div data-cfade className="flex flex-col items-start gap-4">
              <button
                type="submit"
                disabled={status === "sending"}
                aria-busy={status === "sending"}
                className="group inline-flex h-14 items-center gap-2 rounded-full px-8 text-[16px] font-medium text-black transition-opacity duration-300 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:opacity-60"
                style={{ background: "linear-gradient(to bottom, #FFFFFF, #E4E4E8)" }}
              >
                {status === "sending" ? "Enviando…" : "Enviar mensagem"}
                <ArrowUpRight
                  className="h-[18px] w-[18px] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={2}
                  aria-hidden
                />
              </button>

              <p role="alert" className="min-h-[1.25rem] text-[14px]" style={{ color: colors.error }}>
                {status === "error" && (
                  <>
                    Não foi possível enviar agora. Fale com a gente pelo{" "}
                    <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                      WhatsApp
                    </a>
                    .
                  </>
                )}
              </p>
            </div>
          </form>

          <div data-cdone role="status" className="py-6" style={{ display: "none" }}>
            <h3
              className="text-[clamp(1.9rem,4vw,3.25rem)] font-semibold leading-[1.06] tracking-[-0.045em]"
              style={{ color: colors.strong }}
            >
              <span className="-my-[0.1em] block overflow-hidden py-[0.1em]">
                <span data-dline className="block">
                  Mensagem enviada.
                </span>
              </span>
            </h3>
            <p
              data-dfade
              className="mt-5 max-w-[420px] text-[16px] leading-[1.55] md:text-[18px]"
              style={{ color: colors.muted }}
            >
              Obrigado{values.name ? `, ${values.name.trim().split(" ")[0]}` : ""}. Recebemos o seu contato e vamos responder em breve.
            </p>
            <button
              data-dfade
              type="button"
              onClick={reset}
              className="mt-8 text-[15px] font-medium underline underline-offset-4 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A78BFA]"
              style={{ color: colors.muted }}
            >
              Enviar outra mensagem
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Component;