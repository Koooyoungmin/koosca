import Sidebar from "@/components/shared/Sidebar";
import BottomNav from "@/components/shared/BottomNav";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-brand-50">
      <Sidebar role="student" userName="학생" />
      <main className="flex-1 pb-20 lg:pb-0 overflow-auto">
        {children}
      </main>
      <BottomNav role="student" />
    </div>
  );
}
