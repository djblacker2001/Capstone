import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import MainLayout from "../layout/Layout";


const ManageSignPage = () => {
    return (
        <ProtectedRoute role="admin">
            <MainLayout>
                Manage Sign
            </MainLayout>
        </ProtectedRoute>
    )
}

export default ManageSignPage;