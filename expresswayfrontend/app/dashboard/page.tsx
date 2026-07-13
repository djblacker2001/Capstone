import { Col, Row } from "antd";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import MainLayout from "../layout/Layout";
import RevenueChart from "./RevenueChart";
import VehicleTrafficChart from "./VehicleTrafficChart";
import ExpresswayStatusChart from "./ExpresswayStatusChart";
import ViolationChart from "./ViolationChart";

const DashboardPage = () => {
    return (
        <ProtectedRoute>
            <MainLayout>
                <Row gutter={[10, 10]} style={{padding:"30px"}}>

                    <Col xs={24} md={12}>
                        <ExpresswayStatusChart />
                    </Col>
                    <Col xs={24} md={12}>
                        <VehicleTrafficChart />
                    </Col>
                    <Col xs={24} md={12}>
                        <RevenueChart />
                    </Col>
                    <Col xs={24} md={12}>
                        <ViolationChart />
                    </Col>
                </Row>

            </MainLayout>
        </ProtectedRoute>
    )
}

export default DashboardPage;