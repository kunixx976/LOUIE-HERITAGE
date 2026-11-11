import { toast } from "sonner";

export function showAddedToBagToast(description: string, onViewBag: () => void) {
  toast("Added to bag", {
    description,
    action: {
      label: "View bag",
      onClick: onViewBag,
    },
  });
}
