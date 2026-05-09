import { useEffect, useState, type ReactNode } from "react";
import logo from "@/assets/logo.svg";
import { TimeDisplay } from "@/components/ui/time-display";

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
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <img
        src={logo}
        alt="Five River Ventures"
        className="absolute top-6 left-6 md:top-8 md:left-8 z-20 h-8 md:h-10 w-auto"
      />
      <TimeDisplay />

      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <p className="font-mono text-sm md:text-base tracking-[0.3em] uppercase text-foreground/60">
          Restricted Access
        </p>
        <h1 className="mt-3 font-mono text-xl md:text-3xl tracking-[0.25em] uppercase text-foreground">
          Enter Password to Continue
        </h1>

        <form onSubmit={handleSubmit} className="mt-16 w-full max-w-xl flex flex-col items-center">
          <input
            type="password"
            autoFocus
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(false);
            }}
            aria-label="Password"
            className="w-full bg-transparent border-b border-foreground/40 focus:border-foreground outline-none py-3 text-center text-foreground font-mono text-2xl tracking-[0.6em]"
          />
          <div className="h-5 mt-3">
            {error && (
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-destructive">
                Incorrect password
              </p>
            )}
          </div>
          <button
            type="submit"
            className="mt-8 px-10 py-3 border border-foreground/60 hover:border-foreground hover:bg-foreground/5 transition-colors font-mono text-sm tracking-[0.4em] uppercase text-foreground"
          >
            Enter
          </button>
        </form>
      </main>
    </div>
  );
};
