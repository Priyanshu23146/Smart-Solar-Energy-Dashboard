import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signupApi } from "../api/client";
import styles from "./Auth.module.css";

export default function Signup() {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        city: "",
    });
    const [error, setError] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const user = await signupApi(formData);
            login(user);
            navigate("/");
        } catch (err: any) {
            setError(err.message || "Failed to sign up");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.authCard}>
                <h2 className={styles.title}>Create Account</h2>
                <p className={styles.subtitle}>Join the smart energy revolution</p>

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
                            placeholder="Choose a username"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Location (City)</label>
                        <input
                            type="text"
                            name="city"
                            className={styles.input}
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="e.g. Mumbai"
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
                            placeholder="Create a password"
                            required
                        />
                    </div>

                    <button type="submit" className={styles.button}>
                        Sign Up
                    </button>
                </form>

                <p className={styles.linkText}>
                    Already have an account?
                    <Link to="/login" className={styles.link}>Login</Link>
                </p>
            </div>
        </div>
    );
}
