import React, { useState } from "react";

const getBackendUrl = () => {
  const envUrl = import.meta.env.VITE_BACKEND_URL;
  console.log("Environment VITE_BACKEND_URL:", envUrl);

  if (envUrl) {
    console.log("Using VITE_BACKEND_URL:", envUrl);
    return envUrl;
  }

  if (typeof window === "undefined") return "http://localhost:5000";

  const { hostname } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    console.log("Using localhost fallback");
    return "http://localhost:5000";
  }

  const url = `${window.location.protocol}//${window.location.hostname}`;
  console.log("Using dynamic URL:", url);
  return url;
};

export default function AuthForm({ isLogin }) {
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const backendUrl = getBackendUrl();
    const url = isLogin
      ? `${backendUrl}/api/auth/login`
      : `${backendUrl}/api/auth/register`;

    console.log("Submitting to:", url);

    const body = isLogin
      ? { email: formData.email, password: formData.password }
      : {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        };

    try {
      console.log("Request body:", body);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      console.log("Response status:", res.status);
      const data = await res.json();
      console.log("Response data:", data);

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong!");
      }

      // alert(data.message);

      if (isLogin) {
        localStorage.setItem("token", data.token);
        window.location.href = "/"; // redirect to Landing Page
      } else {
        // After registration, optionally switch to login
        alert("Account created! Please log in now.");
        window.location.reload();
      }
    } catch (err) {
      console.error("Error:", err);
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {!isLogin && (
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="John Doe"
            onChange={handleChange}
          />
        </div>
      )}

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          name="email"
          placeholder="your.email@example.com"
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          name="password"
          placeholder="********"
          onChange={handleChange}
        />
      </div>

      {!isLogin && (
        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="********"
            onChange={handleChange}
          />
        </div>
      )}

      <button
        type="submit"
        className="submit-btn"
        disabled={isLoading}
        style={{ opacity: isLoading ? 0.6 : 1 }}
      >
        {isLoading ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
      </button>

      {/* social login removed */}
    </form>
  );
}
