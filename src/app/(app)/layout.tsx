import NavBar from "@/components/NavBar";
import { SearchProvider } from "@/components/search/SearchProvider";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SearchProvider>
      <div className="min-h-full">
        <NavBar />
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </div>
    </SearchProvider>
  );
}
