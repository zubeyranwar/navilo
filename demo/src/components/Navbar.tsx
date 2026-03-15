import { Link } from "react-router-dom";

export function Navbar() {
    return (
        <nav>
            <ul>
                <li>
                    <Link to="/">Home</Link>
                </li>
                <li>
                    <Link to="/dashboard">Dashboard</Link>
                </li>
                <li>
                    <Link to="/dashboard/users/1">User 1</Link>
                </li>
                <li>
                    <Link to="/blog/hello-world">Blog Post</Link>
                </li>
            </ul>
        </nav>
    );
}
