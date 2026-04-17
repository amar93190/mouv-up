import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { FestivalModeProvider } from "./contexts/FestivalModeContext";
import { router } from "./routes";

function App() {
  return (
    <FestivalModeProvider>
      <AuthProvider>
        <RouterProvider router={router} future={{ v7_startTransition: true }} />
      </AuthProvider>
    </FestivalModeProvider>
  );
}

export default App;
