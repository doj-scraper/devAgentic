export const metadata = {
  title: "Agentic Orchestrator OS",
  description: "Enterprise production-grade self-optimizing agent runtime"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          margin: 0,
          background: "#0b1020",
          color: "#e6e9f2"
        }}
      >
        {children}
      </body>
    </html>
  );
}
