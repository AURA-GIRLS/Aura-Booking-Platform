import type { BookingStep } from "@/types/booking.dtos";

interface BookingProgressProps {
  currentStep: BookingStep;
  // Indicates whether a service has been selected yet. Affects how progress is shown.
  serviceSelected?: boolean;
}

const steps: { key: BookingStep; label: string; description: string; icon: string }[] = [
  { key: "service", label: "Service", description: "Choose service", icon: "�" },
  { key: "datetime", label: "Time", description: "Pick date/time", icon: "📅" },
  { key: "location", label: "Location", description: "Choose place", icon: "📍" },
  { key: "review", label: "Review", description: "Check details", icon: "👀" },
  { key: "checkout", label: "Confirm", description: "Finish", icon: "✨" },
];

export function BookingProgress({ currentStep, serviceSelected }: Readonly<BookingProgressProps>) {
  const currentIndex = steps.findIndex(s => s.key === currentStep);

  // If still on service step and nothing selected, treat progress as 0.
  const rawProgress = currentStep === "service" && !serviceSelected ? 0 : ((currentIndex + 1) / steps.length) * 100;
  const progressPercent = Math.min(100, rawProgress);
  // Map percent to 0-100 rounded to nearest 5 for data attribute
  const rounded = Math.round(progressPercent / 5) * 5;
  let widthClass = 'w-[2%]';
  if (progressPercent >= 5) widthClass = 'w-[8%]';
  if (progressPercent >= 20) widthClass = 'w-1/4';
  if (progressPercent >= 45) widthClass = 'w-1/2';
  if (progressPercent >= 70) widthClass = 'w-3/4';
  if (progressPercent >= 99) widthClass = 'w-full';

  return (
    <div className="w-full mb-8 animate-in fade-in" data-progress={rounded}>
      <div className="flex flex-col items-center gap-2 mb-4">
        <h2 className="text-sm font-semibold tracking-wide text-foreground/80">
          {currentStep === 'service' && !serviceSelected ? (
            <>Step 0 / {steps.length}</>
          ) : (
            <>Step {currentIndex + 1} / {steps.length}</>
          )}
        </h2>
        <div className="w-full h-1.5 rounded-full bg-neutral-200 overflow-hidden">
          <div className={`h-full bg-gradient-to-r from-pink-500 via-pink-400 to-pink-300 transition-all duration-500 ${widthClass}`} aria-hidden="true" />
        </div>
      </div>
      <ol className="flex items-start justify-between gap-2">
        {steps.map((s, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;
          const isService = s.key === 'service';
          const showPlaceholder = isService && !serviceSelected;
          return (
            <li key={s.key} className="flex-1 flex flex-col items-center min-w-0">
              <div className="flex items-center w-full">
                <div
                  className={[
                    "w-9 h-9 rounded-full flex items-center justify-center text-base font-medium border transition-all",
                    isCompleted && "bg-pink-500 border-pink-500 text-white shadow",
                    isCurrent && !isCompleted && !showPlaceholder && "bg-white border-pink-500 text-pink-600 shadow-sm",
                    showPlaceholder && "bg-neutral-50 border-dashed border-neutral-300 text-neutral-300",
                    !isCompleted && !isCurrent && !showPlaceholder && "bg-white border-neutral-200 text-neutral-400"
                  ].filter(Boolean).join(" ")}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {(() => {
                    if (showPlaceholder) return "…";
                    if (isCompleted) return "✓";
                    return s.icon;
                  })()}
                </div>
                {i < steps.length - 1 && (
                  <div className="flex-1 h-px mx-2 bg-neutral-200" />
                )}
              </div>
              <div className="mt-2 text-center px-1">
                {(() => {
                  let labelClass = "text-neutral-400";
                  if (isCompleted) labelClass = "text-pink-500";
                  if (isCurrent && !showPlaceholder) labelClass = "text-pink-600";
                  return <div className={"text-[11px] font-medium " + labelClass}>{s.label}</div>;
                })()}
                <div className="text-[10px] text-neutral-400 truncate max-w-[80px]">
                  {showPlaceholder ? "No service selected" : s.description}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
