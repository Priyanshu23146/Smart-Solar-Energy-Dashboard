import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";

export default function Navbar() {
    return (
        <nav className={styles.navbar}>
            <div className={styles.logo}>SolarDash</div>
            <ul className={styles.links}>
                <li>
                    <Link to="/">Dashboard</Link>
                </li>
                <li>
                    <Link to="/appliances">Appliances</Link>
                </li>
                <li>
                    <Link to="/insights">Insights</Link>
                </li>
                <li>
                    <Link to="/settings">Settings</Link>
                </li>
            </ul>
        </nav>
    );
}
