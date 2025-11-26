import React from "react";
import "./global.css";
import { notoSansSC } from "@/fonts";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-cn">
      <body className={cn(notoSansSC.className, "antialiased")}>
        <Toaster
          position="bottom-right"
          expand
          richColors/>
        {children}
      </body>
    </html>
  );
}
