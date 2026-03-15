import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
    return (
        <div>
            <h2>Dashboard</h2>
            <Outlet />
        </div>
    );
}
