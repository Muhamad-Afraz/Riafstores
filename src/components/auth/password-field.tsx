"use client";

import { useState } from "react";
import { Eye, EyeOff } from "../icons";
import { authErrorClass, authInputClass, authLabelClass } from "./auth-styles";

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete?: string;
  placeholder?: string;
};

export function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
  autoComplete = "current-password",
  placeholder = "Enter your password",
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className={authLabelClass}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`${authInputClass} pr-11 ${
            error ? "border-ink/50" : ""
          }`}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-ink/40 transition-colors hover:bg-beige hover:text-ink"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      {error && (
        <p id={errorId} className={authErrorClass}>
          {error}
        </p>
      )}
    </div>
  );
}
