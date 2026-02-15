import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginApi } from "../api/client";
import styles from "./Auth.module.css";

export default function Login() {
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || "/";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const user = await loginApi(formData);
            login(user);
            navigate(from, { replace: true });
        } catch (err: any) {
            setError(err.message || "Failed to login");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.authCard}>
                <h2 className={styles.title}>Welcome Back</h2>
                <p className={styles.subtitle}>Manage your solar energy efficiently</p>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Username</label>
                        <input
                            type="text"
                            name="username"
                            className={styles.input}
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Password</label>
                        <input
                            type="password"
                            name="password"
                            className={styles.input}
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button type="submit" className={styles.button}>
                        Sign In
                    </button>
                </form>

                <p className={styles.linkText}>
                    Don't have an account?
                    <Link to="/signup" className={styles.link}>Sign up</Link>
                </p>
            </div>
        </div>
    );
}
