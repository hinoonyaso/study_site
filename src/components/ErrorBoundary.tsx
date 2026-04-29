import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.fallback) return this.fallback;
      return (
        <div className="error-boundary-fallback" style={{
          padding: "20px",
          border: "2px dashed var(--red-2)",
          borderRadius: "12px",
          background: "rgba(255, 0, 0, 0.05)",
          color: "var(--foreground)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          margin: "20px 0"
        }}>
          <AlertTriangle size={32} color="var(--red)" />
          <div style={{ textAlign: "center" }}>
            <h3 style={{ margin: "0 0 4px 0" }}>시각화 로딩 오류</h3>
            <p style={{ fontSize: "0.9em", opacity: 0.8, maxWidth: "300px" }}>
              이 시각화 구성 요소를 불러오는 중 오류가 발생했습니다.
            </p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              background: "var(--primary)",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.9em"
            }}
          >
            <RotateCcw size={14} />
            다시 시도
          </button>
        </div>
      );
    }

    return this.props.children;
  }
  
  private get fallback() {
    return this.props.fallback;
  }
}
