import { Outlet } from "react-router-dom";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";

const MobileLayout = () => {
  return (
    <div className="min-h-screen bg-chip/50">
      <div className="relative mx-auto min-h-screen w-full max-w-md bg-background shadow-xl shadow-black/5">
        <Header />
        <main className="px-4 pb-28 pt-4">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
};

export default MobileLayout;
