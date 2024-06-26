import "@/styles/globals.css";
import "@mantine/core/styles.css";
import "@mantine/tiptap/styles.css";
import type { AppProps } from "next/app";
import { MantineProvider, createTheme } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="fixed inset-0">
      <MantineProvider>
        <ModalsProvider>
          <Component {...pageProps} />
        </ModalsProvider>
      </MantineProvider>
    </div>
  );
}
