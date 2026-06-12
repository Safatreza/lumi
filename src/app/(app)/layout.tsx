import ModeNav from "@/components/ModeNav";
import { WortLautProvider } from "@/lib/store/store";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WortLautProvider>
      <div className="flex min-h-dvh flex-col">
        <ModeNav />
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </WortLautProvider>
  );
}
