import { AnomalousMatterHero } from "@/components/ui/anomalous-matter-hero";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <AnomalousMatterHero
        title="Observation Log: Anomaly 7"
        subtitle="Matter in a state of constant, beautiful flux."
        description="A new form of digital existence has been observed. It responds to stimuli, changes form, and exudes an unknown energy. Further study is required."
      />
    </div>
  );
};

export default Index;
