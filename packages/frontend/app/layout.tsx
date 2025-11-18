import React from "react";
import "./global.css";
import { notoSansSC } from "@/fonts";
import { cn } from "@/lib/utils";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-cn">
      <body className={cn(notoSansSC.className, "antialiased")}>
        {children}
      </body>
    </html>
  );
}
