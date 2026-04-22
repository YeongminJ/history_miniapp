import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(error, this.reset);
    return (
      <div
        style={{
          padding: 24,
          color: "#FFFFFF",
          background: "#1B0000",
          minHeight: "100vh",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>
          ⚠ 문제가 발생했어요
        </div>
        <div
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.7)",
            marginBottom: 20,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {error.message}
        </div>
        <button
          onClick={this.reset}
          type="button"
          style={{
            padding: "12px 24px",
            background: "#FFC107",
            color: "#000",
            fontWeight: 800,
            border: "none",
            borderRadius: 12,
            cursor: "pointer",
          }}
        >
          다시 시도
        </button>
      </div>
    );
  }
}
