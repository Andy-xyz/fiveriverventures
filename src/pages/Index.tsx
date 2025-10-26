import { lazy, Suspense } from "react";

const AnomalousMatterHero = lazy(() => import("@/components/ui/anomalous-matter-hero").then(module => ({ default: module.AnomalousMatterHero })));

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <AnomalousMatterHero
          title="COMING IN LATE 2025"
          subtitle=""
          description="FIVE RIVER VENTURES IS A GLOBAL, EARLY-TO-MID STAGE VENTURE CAPITAL FIRM INVESTING IN TRANSFORMATIVE APPLICATION-LAYER AI COMPANIES."
        />
      </Suspense>
    </div>
  );
};

export default Index;
