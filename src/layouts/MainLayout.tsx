import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import Footer from "../components/Footer";
import Header from "../components/Header";
import SupabaseConfigNotice from "../components/SupabaseConfigNotice";
import { useFestivalMode } from "../contexts/FestivalModeContext";
import { useScrollToTop } from "../hooks/useScrollToTop";

function MainLayout() {
  useScrollToTop();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const { festivalMode } = useFestivalMode();
  // Animate only real page changes to avoid unnecessary replays on hash/search updates.
  const routeTransitionKey = location.pathname;

  return (
    <div className={festivalMode ? "min-h-screen bg-[#050f4b] text-[#f3f5ff]" : "min-h-screen bg-[#ececf0] text-[#13161d] md:bg-[#f4f4f8]"}>
      <Header />

      <main id="main-content" className={isAdmin ? "py-8" : "mx-auto w-full max-w-[430px] px-4 pb-28 md:pb-12"}>
        <SupabaseConfigNotice />
        <div key={routeTransitionKey} className="route-transition">
          <Outlet />
        </div>
      </main>

      {!isAdmin ? <BottomNav /> : null}
      <Footer />
    </div>
  );
}

export default MainLayout;
