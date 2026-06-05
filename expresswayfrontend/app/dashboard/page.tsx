import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import MainLayout from "../layout/Layout";
import RevenueChart from "./RevenueChart";

const DashboardPage = () => {
    return (
        <ProtectedRoute>
            <MainLayout>
                Dashboard
                <RevenueChart/>
            </MainLayout>
        </ProtectedRoute>
    )
}

export default DashboardPage;