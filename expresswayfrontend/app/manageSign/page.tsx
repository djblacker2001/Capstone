import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import MainLayout from "../layout/Layout";


const ManageSignPage = () => {
    return (
        <ProtectedRoute role="admin">
            <MainLayout>
                <table>
                    <th>
                        ID
                    </th>
                    <tr>
                        <td>
                            rfsdfsd
                        </td>
                    </tr>
                </table>
            </MainLayout>
        </ProtectedRoute>
    )
}

export default ManageSignPage;