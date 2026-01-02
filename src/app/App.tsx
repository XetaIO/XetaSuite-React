import type { FC } from "react";
import { BrowserRouter } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "@/shared/hooks";
import { AppConfigProvider } from "@/shared/store";
import { ThemedToastContainer } from "@/shared/components/common";
import { AuthProvider } from "@/features/Auth/store/AuthContext";
import { SettingsProvider } from "@/features/Settings";
import AppRoutes from "./AppRoutes";
import "react-toastify/dist/ReactToastify.css";

/**
 * Main Application Component
 * Sets up all providers and routing
 */
const App: FC = () => {
    return (
        <HelmetProvider>
            <ThemeProvider>
                <AppConfigProvider>
                    <BrowserRouter>
                        <AuthProvider>
                            <SettingsProvider>
                                <AppRoutes />
                                <ThemedToastContainer />
                            </SettingsProvider>
                        </AuthProvider>
                    </BrowserRouter>
                </AppConfigProvider>
            </ThemeProvider>
        </HelmetProvider>
    );
};

export default App;
