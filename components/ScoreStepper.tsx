'use client';

interface ScoreStepperProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export default function ScoreStepper({ label, value, onChange }: ScoreStepperProps) {
  return (
    <div className="rounded-2xl border-2 border-accent-gray-200 bg-white p-4 text-center">
      <p className="truncate text-sm font-bold text-accent-gray-600">{label}</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <button type="button" aria-label={`Decrease ${label} score`} onClick={() => onChange(Math.max(0, value - 1))}
          className="h-12 w-12 rounded-full bg-accent-gray-100 text-2xl font-black text-accent-gray-700 active:scale-95">−</button>
        <output aria-label={`${label} score`} className="min-w-12 text-5xl font-black text-primary-purple">{value}</output>
        <button type="button" aria-label={`Increase ${label} score`} onClick={() => onChange(Math.min(99, value + 1))}
          className="h-12 w-12 rounded-full bg-primary-purple/10 text-2xl font-black text-primary-purple active:scale-95">+</button>
      </div>
    </div>
  );
}
