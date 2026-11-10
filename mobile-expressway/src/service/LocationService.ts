import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Speech from 'expo-speech';

export const LOCATION_TASK_NAME = 'BACKGROUND_GPS_TASK';

// Biến lưu trữ tạm tốc độ giới hạn hiện tại của phân đoạn
let currentSpeedLimit = 80; // Default: 80 km/h

// 1. Định nghĩa Task chạy ngầm dưới nền
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: any) => {
    if (error) {
        console.error('Lỗi Background Location Task:', error);
        return;
    }
    if (data) {
        const { locations } = data;
        const currentLocation = locations[0];

        if (currentLocation) {
            const { latitude, longitude, speed } = currentLocation.coords;

            // m/s sang km/h (nếu speed null thì bằng 0)
            const speedKmH = speed ? Math.round(speed * 3.6) : 0;

            // Kiểm tra và phát cảnh báo
            checkAndSpeakSpeedWarning(speedKmH, currentSpeedLimit);
        }
    }
});

// 2. Hàm kiểm tra và phát cảnh báo bằng giọng nói (TTS)
let lastWarningTime = 0;
const checkAndSpeakSpeedWarning = (currentSpeed: number, limit: number) => {
    const now = Date.now();

    // Tránh phát lặp lại liên tục, chỉ cảnh báo mỗi 8 giây một lần
    if (currentSpeed > limit && now - lastWarningTime > 8000) {
        lastWarningTime = now;
        const message = `Cảnh báo! Tốc độ hiện tại ${currentSpeed} km/h, vượt quá giới hạn ${limit} km/h!`;

        // Stop các câu nói cũ và phát câu mới
        Speech.stop();
        Speech.speak(message, {
            language: 'vi-VN',
            pitch: 1.0,
            rate: 1.0,
        });
    }
};

// 3. Hàm kích hoạt/tắt theo dõi vị trí Background
export const startBackgroundLocation = async () => {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
        alert('Ứng dụng cần quyền vị trí để hoạt động!');
        return false;
    }

    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
        alert('Vui lòng cấp quyền "Luôn cho phép" (Always) để ứng dụng cảnh báo khi tắt màn hình.');
        return false;
    }

    const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
    if (!isRegistered) {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 2000,
            distanceInterval: 5,
            showsBackgroundLocationIndicator: true,
            foregroundService: {
                notificationTitle: 'Hệ thống bản đồ Cao Tốc GIS',
                notificationBody: 'Đang theo dõi vị trí và tốc độ xe real-time.',
                notificationColor: '#00A859',
            },
        });
    }
    return true;
};

export const stopBackgroundLocation = async () => {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
    if (isRegistered) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    }
};