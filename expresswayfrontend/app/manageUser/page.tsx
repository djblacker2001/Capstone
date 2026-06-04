import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import MainLayout from "../layout/Layout";


const ManageUserPage = () => {
    return (
        <ProtectedRoute role="admin">
            <MainLayout>
                Manage User
            </MainLayout>
        </ProtectedRoute>
    )
}

export default ManageUserPage;