import { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function IslandCard({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return <section className={`island-card ${className}`.trim()}>{children}</section>;
}

export function AcceptButton({ className = "", ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`accept-button ${className}`.trim()}
      aria-label="Akceptuj"
      {...props}
    >
      ✓
    </button>
  );
}

export function CancelButton({ className = "", ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`cancel-button ${className}`.trim()}
      aria-label="Anuluj zajecia"
      {...props}
    >
      ×
    </button>
  );
}

export function GhostButton({ className = "", ...props }: ButtonProps) {
  return <button type="button" className={`ghost-button ${className}`.trim()} {...props} />;
}
