import { useEffect, useState, type ReactNode } from "react";

const PASSWORD = "FiveRiver05082026";
const STORAGE_KEY = "frv-unlocked";

export const PasswordGate = ({ children }: { children: ReactNode }) => {
  const [unlocked, setUnlocked] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(STORAGE_KEY) === "1") {
      setUnlocked(true);
    }
    setReady(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value === PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setUnlocked(true);
    } else {
      setError(true);
    }
  };

  if (!ready) return null;
  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <label htmlFor="frv-password" className="text-xs font-mono uppercase tracking-[0.2em] text-foreground/70">
          Enter password
        </label>
        <input
          id="frv-password"
          type="password"
          autoFocus
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(false);
          }}
          className="w-full bg-transparent border-b border-foreground/40 focus:border-foreground outline-none py-2 text-foreground font-mono tracking-wider"
        />
        {error && (
          <p className="text-xs font-mono text-destructive">Incorrect password</p>
        )}
        <button
          type="submit"
          className="self-start mt-2 text-xs font-mono uppercase tracking-[0.2em] text-foreground/80 hover:text-foreground transition-colors"
        >
          Enter →
        </button>
      </form>
    </div>
  );
};
