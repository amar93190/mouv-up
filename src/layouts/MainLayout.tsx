import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import Footer from "../components/Footer";
import Header from "../components/Header";
import PwaInstallPrompt from "../components/PwaInstallPrompt";
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

      <main id="main-content" className={isAdmin ? "py-8" : "px-4 pb-28 md:px-10 md:pb-14"}>
        <div className={isAdmin ? "mx-auto max-w-6xl" : "mx-auto w-full max-w-[1320px]"}>
          <div
            className={
              isAdmin
                ? ""
                : festivalMode
                  ? "md:rounded-[30px] md:border md:border-[#1a3e98] md:bg-[#081a60] md:px-10 md:py-10 md:shadow-[0_20px_60px_rgba(3,14,66,0.45)]"
                  : "md:rounded-[30px] md:border md:border-[#e2e4ea] md:bg-white md:px-10 md:py-10 md:shadow-[0_20px_60px_rgba(19,22,29,0.08)]"
            }
          >
            <div className={isAdmin ? "" : "mx-auto w-full max-w-[430px] md:max-w-none"}>
              <SupabaseConfigNotice />
              <div key={routeTransitionKey} className="route-transition">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </main>

      {!isAdmin ? <BottomNav /> : null}
      {!isAdmin ? <PwaInstallPrompt /> : null}
      <Footer />
    </div>
  );
}

export default MainLayout;
