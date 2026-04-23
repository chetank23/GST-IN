import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";

export function BottomActionBar({
  total,
  onSaveDraft,
  onGenerate,
  isSaving = false,
  isGenerating = false,
}: {
  total: number;
  onSaveDraft?: () => void;
  onGenerate: () => void;
  isSaving?: boolean;
  isGenerating?: boolean;
}) {
  return (
    <div className="fixed bottom-16 left-0 right-0 z-20 border-t border-line bg-surface p-3 md:static md:mt-4 md:rounded-2xl md:border">
      <div className="app-shell flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted">Total</p>
          <p className="text-lg font-bold">Rs {total.toFixed(2)}</p>
        </div>
        <div className="flex gap-2">
          <SecondaryButton type="button" onClick={onSaveDraft} disabled={isSaving || isGenerating}>
            {isSaving ? "Saving..." : "Save Draft"}
          </SecondaryButton>
          <PrimaryButton type="button" onClick={onGenerate} disabled={isSaving || isGenerating}>
            {isGenerating ? "Opening..." : "Generate PDF"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
