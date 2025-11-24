export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="px-[20%]">
      {children}
    </main>
  );
}
