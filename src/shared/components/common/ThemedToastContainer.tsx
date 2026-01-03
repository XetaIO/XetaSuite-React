import { ToastContainer } from "react-toastify";
import { useTheme } from "@/shared/hooks";

/**
 * Toast container that syncs with the app's dark mode
 */
export function ThemedToastContainer() {
    const { theme } = useTheme();

    return (
        <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme={theme === "dark" ? "dark" : "light"}
        />
    );
}
