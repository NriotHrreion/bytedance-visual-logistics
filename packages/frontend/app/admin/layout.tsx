export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="">
      {children}
    </main>
  );
}
