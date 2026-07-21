import { useState, type FormEvent } from "react";
import { Phone, Mail, MapPin, CheckCircle2 } from "lucide-react";
import {
  business,
  telHref,
  mailHref,
  FORMSPREE_ID,
} from "../data/business";
import { services } from "../data/services";
import { Button } from "../components/Button";
import { TextInput, SelectInput, TextArea } from "../components/FormInputs";

type Status = "idle" | "submitting" | "success" | "error";
type Errors = Partial<Record<"name" | "phone" | "email" | "service" | "message", string>>;

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(data: Record<string, string>): Errors {
  const errors: Errors = {};
  if (!data.name?.trim()) errors.name = "Please enter your name";
  if (!data.phone?.trim()) errors.phone = "Please enter your phone number";
  else if (data.phone.replace(/[^0-9]/g, "").length < 8)
    errors.phone = "Please enter a valid phone number";
  if (!data.email?.trim()) errors.email = "Please enter your email";
  else if (!emailRe.test(data.email)) errors.email = "Please enter a valid email";
  if (!data.service) errors.service = "Please select a service";
  if (!data.message?.trim())
    errors.message = "Please tell us a little about your project";
  return errors;
}

/**
 * The Book a Quote section — the site's single conversion destination.
 *
 * Used on Home (as part of the one-page overview) and as the primary element of
 * the /quote page. The form is the primary element; phone / email / service area
 * sit beside it in a secondary card.
 *
 * The old `showContactLink` prop is gone: it linked to /contact, which is now
 * this same destination, so it would have been a self-link (spec 05: exactly one
 * quote CTA destination, nothing duplicated).
 */
export function QuoteForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(
      new FormData(form).entries(),
    ) as Record<string, string>;

    const nextErrors = validate(data);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("submitting");
    setFormError("");
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        const body = await res.json().catch(() => null);
        setFormError(
          body?.errors?.[0]?.message ??
            "Something went wrong. Please call us instead.",
        );
        setStatus("error");
      }
    } catch {
      setFormError("Network error. Please check your connection or call us.");
      setStatus("error");
    }
  }

  return (
    <section
      id="quote"
      className="fade-b-to-950 relative scroll-mt-20 overflow-hidden border-t border-white/10 bg-navy-900 py-16 sm:border-t-0 sm:py-24"
    >
      <div className="bg-blueprint absolute inset-0 opacity-60" aria-hidden />
      <div className="container-page relative grid gap-12 lg:grid-cols-2">
        {/* Pitch + contact */}
        <div>
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-accent-400">
            <span className="h-px w-6 bg-accent-500" />
            Get in touch
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Request a quote from us
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-navy-300 sm:text-lg">
            Tell us a little about your project and we'll get back to you to
            discuss the details. Prefer to talk? Give us a call.
          </p>

          {/* Secondary card: the contact details that used to live on the
              separate Contact page. Card radius matches the team/review cards. */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-navy-950/60 p-6 backdrop-blur-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-navy-400">
              Or reach us directly
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a
                  href={telHref}
                  className="inline-flex items-center gap-3 text-white transition-colors hover:text-accent-300"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
                    <Phone className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="font-semibold">{business.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={mailHref}
                  className="inline-flex items-center gap-3 text-white transition-colors hover:text-accent-300"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
                    <Mail className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="font-semibold">{business.email}</span>
                </a>
              </li>
              <li className="inline-flex items-center gap-3 text-navy-300">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
                  <MapPin className="h-5 w-5" aria-hidden />
                </span>
                <span className="font-medium">{business.serviceArea}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Form card */}
        <div className="rounded-2xl bg-white p-6 text-navy-800 shadow-2xl sm:p-8">
          {status === "success" ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CheckCircle2 className="mb-4 h-14 w-14 text-accent-500" aria-hidden />
              <h3 className="text-xl font-bold text-navy-900">
                Thanks, your enquiry's on its way!
              </h3>
              <p className="mt-2 text-navy-600">
                We'll be in touch shortly. For anything urgent, call{" "}
                <a
                  href={telHref}
                  className="font-semibold text-accent-600 hover:underline"
                >
                  {business.phone}
                </a>
                .
              </p>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="mt-6 text-sm font-semibold text-navy-500 hover:text-navy-800"
              >
                Send another enquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <TextInput
                label="Name"
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                error={errors.name}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput
                  label="Phone"
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="04xx xxx xxx"
                  error={errors.phone}
                />
                <TextInput
                  label="Email"
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@email.com"
                  error={errors.email}
                />
              </div>
              <SelectInput
                label="Service"
                id="service"
                defaultValue=""
                error={errors.service}
              >
                <option value="" disabled>
                  Select a service…
                </option>
                {services.map((s) => (
                  <option key={s.id} value={s.title}>
                    {s.title}
                  </option>
                ))}
                <option value="Other / not sure">Other / not sure</option>
              </SelectInput>
              <TextArea
                label="Message"
                id="message"
                rows={4}
                placeholder="Tell us about your project…"
                error={errors.message}
              />

              {status === "error" && formError && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                >
                  {formError}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={status === "submitting"}
              >
                {status === "submitting" ? "Sending…" : "Send enquiry"}
              </Button>
              <p className="text-center text-xs text-navy-500">
                We'll only use your details to respond to your enquiry.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
