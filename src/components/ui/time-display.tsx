import { useEffect, useState } from "react";

const ZONES: { label: string; tz: string }[] = [
  { label: "LA", tz: "America/Los_Angeles" },
  { label: "NYC", tz: "America/New_York" },
  { label: "LDN", tz: "Europe/London" },
  { label: "DEL", tz: "Asia/Kolkata" },
];

function formatDate(d: Date) {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

function formatTimeInZone(d: Date, tz: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(d);
}

export function TimeDisplay() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const localTime = formatTimeInZone(now, Intl.DateTimeFormat().resolvedOptions().timeZone);

  return (
    <div className="absolute top-24 md:top-8 left-1/2 -translate-x-1/2 z-20 text-center font-mono text-foreground whitespace-nowrap">
      <div className="text-xs md:text-sm tracking-widest uppercase">
        {formatDate(now)} {localTime}
      </div>
      <div className="mt-1 text-xs md:text-sm tracking-widest uppercase">
        Los Angeles | San Francisco | New York City
      </div>
    </div>
  );
}
