import { Col, Row } from "antd";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import MainLayout from "../layout/Layout";
import RevenueChart from "./RevenueChart";
import VehicleTrafficChart from "./VehicleTrafficChart";

const DashboardPage = () => {
    return (
        <ProtectedRoute>
            <MainLayout>
                Dashboard
                <Row gutter={[10, 10]}>
                    <Col xs={24} md={12}>
                        <VehicleTrafficChart />
                    </Col>
                    <Col xs={24} md={12}>
                        <RevenueChart />
                    </Col>

                </Row>

            </MainLayout>
        </ProtectedRoute>
    )
}

export default DashboardPage;