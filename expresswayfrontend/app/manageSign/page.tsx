import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import MainLayout from "../layout/Layout";


const ManageSignPage = () => {
    return (
        <ProtectedRoute role={1}>
            <MainLayout>
                Manage Sign
            </MainLayout>
        </ProtectedRoute>
    )
}

export default ManageSignPage;