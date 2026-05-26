"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

export function UpgradeToast() {
  const searchParams = useSearchParams();
  const upgradeToastShown = useRef(false);

  useEffect(() => {
    if (upgradeToastShown.current) return;
    if (searchParams.get("upgraded") !== "true") return;

    if (searchParams.get("source") === "wallet") {
      toast.success("Upgrade complete. Paid from your wallet balance.");
    } else {
      toast.success("Upgrade complete. Your subscription is now active.");
    }

    upgradeToastShown.current = true;
  }, [searchParams]);

  return null;
}
