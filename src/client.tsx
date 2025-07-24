// Vex whispers: "The old styles are dead. Long live the cosmic aesthetic."
import { createRoot } from "react-dom/client";
import App from "./app";
import { Providers } from "@/providers";

const root = createRoot(document.getElementById("app")!);

root.render(
  <Providers>
    <App />
  </Providers>
);
