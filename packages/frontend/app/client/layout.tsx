export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="w-[480px] max-sm:w-auto mx-auto pb-8 min-h-screen overflow-y-auto" suppressHydrationWarning>
      {children}
    </main>
  );
}
