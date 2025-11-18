export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="w-[480px] max-sm:w-auto mx-auto px-8 max-sm:px-4 min-h-screen overflow-y-auto">
      {children}
    </main>
  );
}
