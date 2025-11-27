import type React from "react"

export const macStyles = {
  window: {
    backgroundColor: "var(--card)",
    border: "3px solid var(--primary)",
    boxShadow: "3px 3px 0 0 #c71585, inset -2px -2px 0 0 #ffc0e0, inset 2px 2px 0 0 #ffffff",
  } as React.CSSProperties,

  titleBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "6px 10px",
    background: "linear-gradient(180deg, #ff69b4 0%, #ff1493 50%, #c71585 100%)",
    borderBottom: "3px solid #c71585",
  } as React.CSSProperties,

  titleBarStripes: {
    background: "repeating-linear-gradient(to bottom, #ffb6d9 0px, #ffb6d9 2px, #ff69b4 2px, #ff69b4 4px)",
    height: "14px",
    flex: 1,
    margin: "0 10px",
    border: "1px solid #c71585",
  } as React.CSSProperties,

  closeButton: {
    width: "14px",
    height: "14px",
    border: "2px solid #c71585",
    backgroundColor: "#00e5ff",
    cursor: "pointer",
    boxShadow: "inset -1px -1px 0 0 #008b8b, inset 1px 1px 0 0 #7fffd4",
  } as React.CSSProperties,

  button: {
    padding: "6px 14px",
    fontSize: "12px",
    fontWeight: "bold",
    border: "2px solid var(--primary)",
    background: "linear-gradient(180deg, #ffffff 0%, #ffc0e0 50%, #ffb6d9 100%)",
    color: "#4a0033",
    cursor: "pointer",
    boxShadow: "inset -2px -2px 0 0 #c71585, inset 2px 2px 0 0 #ffffff, 2px 2px 0 0 #c71585",
    textShadow: "1px 1px 0 #ffffff",
  } as React.CSSProperties,

  buttonHover: {
    background: "linear-gradient(180deg, #ffffff 0%, #ffb6d9 50%, #ff69b4 100%)",
  } as React.CSSProperties,

  buttonActive: {
    boxShadow: "inset 2px 2px 0 0 #c71585, inset -2px -2px 0 0 #ffffff",
    background: "linear-gradient(180deg, #ffc0e0 0%, #ff69b4 100%)",
  } as React.CSSProperties,

  buttonPrimary: {
    padding: "6px 14px",
    fontSize: "12px",
    fontWeight: "bold",
    border: "2px solid #c71585",
    background: "linear-gradient(180deg, #ff69b4 0%, #ff1493 50%, #c71585 100%)",
    color: "white",
    cursor: "pointer",
    boxShadow: "2px 2px 0 0 #8b0050, inset -2px -2px 0 0 #c71585, inset 2px 2px 0 0 #ffb6d9",
    textShadow: "1px 1px 0 #8b0050",
  } as React.CSSProperties,

  buttonSecondary: {
    padding: "6px 14px",
    fontSize: "12px",
    fontWeight: "bold",
    border: "2px solid #7c3aed",
    background: "linear-gradient(180deg, #c4b5fd 0%, #a855f7 50%, #7c3aed 100%)",
    color: "white",
    cursor: "pointer",
    boxShadow: "2px 2px 0 0 #5b21b6, inset -2px -2px 0 0 #7c3aed, inset 2px 2px 0 0 #e9d5ff",
    textShadow: "1px 1px 0 #5b21b6",
  } as React.CSSProperties,

  buttonAccent: {
    padding: "6px 14px",
    fontSize: "12px",
    fontWeight: "bold",
    border: "2px solid #0891b2",
    background: "linear-gradient(180deg, #a5f3fc 0%, #00e5ff 50%, #0891b2 100%)",
    color: "#004050",
    cursor: "pointer",
    boxShadow: "2px 2px 0 0 #0e7490, inset -2px -2px 0 0 #0891b2, inset 2px 2px 0 0 #e0f7ff",
    textShadow: "1px 1px 0 #a5f3fc",
  } as React.CSSProperties,

  toolIcon: {
    width: "52px",
    height: "52px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    cursor: "pointer",
    border: "2px solid var(--primary)",
    background: "linear-gradient(180deg, #ffffff 0%, #ffc0e0 100%)",
    boxShadow: "inset -2px -2px 0 0 #c71585, inset 2px 2px 0 0 #ffffff, 2px 2px 0 0 #c71585",
    imageRendering: "pixelated",
    color: "#4a0033",
  } as React.CSSProperties,

  toolIconActive: {
    boxShadow: "inset 2px 2px 0 0 #c71585, inset -2px -2px 0 0 #ffffff",
    background: "linear-gradient(180deg, #ff69b4 0%, #ff1493 100%)",
    color: "white",
  } as React.CSSProperties,

  mobileDrawer: {
    position: "fixed" as const,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    background: "linear-gradient(180deg, #fff0f7 0%, #ffc0e0 100%)",
    borderTop: "3px solid var(--primary)",
    boxShadow: "0 -3px 0 0 #c71585",
    maxHeight: "45vh",
    overflowY: "auto" as const,
  } as React.CSSProperties,
}

// Helper component for Mac-style buttons
export function MacButton({
  children,
  primary = false,
  secondary = false,
  accent = false,
  active = false,
  className = "",
  style = {},
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  primary?: boolean
  secondary?: boolean
  accent?: boolean
  active?: boolean
}) {
  let baseStyle = macStyles.button
  if (primary) baseStyle = macStyles.buttonPrimary
  else if (secondary) baseStyle = macStyles.buttonSecondary
  else if (accent) baseStyle = macStyles.buttonAccent

  const activeStyle = active ? macStyles.buttonActive : {}

  return (
    <button className={`pixel-text ${className}`} style={{ ...baseStyle, ...activeStyle, ...style }} {...props}>
      {children}
    </button>
  )
}

// Helper component for Mac-style windows
export function MacWindow({ children, className = "", style = {}, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} style={{ ...macStyles.window, ...style }} {...props}>
      {children}
    </div>
  )
}

// Helper component for tool icons
export function ToolIcon({
  children,
  active = false,
  className = "",
  style = {},
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={`pixel-text ${className}`}
      style={{
        ...macStyles.toolIcon,
        ...(active ? macStyles.toolIconActive : {}),
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  )
}
