import type { ComponentPropsWithoutRef, ReactNode } from "react";

/** Shared label + error wrapper. Every field has a visible label. */
function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-semibold text-navy-800"
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-navy-200 bg-white px-4 py-3 text-navy-900 placeholder:text-navy-400 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/30 aria-[invalid=true]:border-red-500";

export function TextInput({
  label,
  id,
  error,
  ...props
}: { label: string; id: string; error?: string } & ComponentPropsWithoutRef<"input">) {
  return (
    <Field label={label} htmlFor={id} error={error}>
      <input
        id={id}
        name={id}
        className={inputClass}
        aria-invalid={error ? true : undefined}
        {...props}
      />
    </Field>
  );
}

export function TextArea({
  label,
  id,
  error,
  ...props
}: { label: string; id: string; error?: string } & ComponentPropsWithoutRef<"textarea">) {
  return (
    <Field label={label} htmlFor={id} error={error}>
      <textarea
        id={id}
        name={id}
        className={inputClass}
        aria-invalid={error ? true : undefined}
        {...props}
      />
    </Field>
  );
}

export function SelectInput({
  label,
  id,
  error,
  children,
  ...props
}: { label: string; id: string; error?: string } & ComponentPropsWithoutRef<"select">) {
  return (
    <Field label={label} htmlFor={id} error={error}>
      <select
        id={id}
        name={id}
        className={inputClass}
        aria-invalid={error ? true : undefined}
        {...props}
      >
        {children}
      </select>
    </Field>
  );
}
