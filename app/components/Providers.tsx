"use client";

import { ReactNode, useEffect } from "react";
import { appKit } from "../lib/wallet";

export default function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Initialize AppKit
    appKit.mount();
    return () => appKit.unmount();
  }, []);

  return <>{children}</>;
}
