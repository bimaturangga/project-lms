import Link from "next/link";

export default function TestTermsPage() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Test Navigation</h1>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          maxWidth: "300px",
          margin: "0 auto",
        }}
      >
        <Link
          href="/register"
          style={{
            padding: "1rem",
            backgroundColor: "#007bff",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
          }}
        >
          Go to Register
        </Link>
        <Link
          href="/auth/terms"
          style={{
            padding: "1rem",
            backgroundColor: "#28a745",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
          }}
        >
          Go to Terms
        </Link>
        <Link
          href="/auth/privacy"
          style={{
            padding: "1rem",
            backgroundColor: "#17a2b8",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
          }}
        >
          Go to Privacy
        </Link>
        <Link
          href="/login"
          style={{
            padding: "1rem",
            backgroundColor: "#6f42c1",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
          }}
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}
