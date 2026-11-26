import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Speech from 'expo-speech';

export const LOCATION_TASK_NAME = 'BACKGROUND_GPS_TASK';
let currentSpeedLimit = 80;

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
            const speedKmH = speed ? Math.round(speed * 3.6) : 0;
            checkAndSpeakSpeedWarning(speedKmH, currentSpeedLimit);
        }
    }
});

let lastWarningTime = 0;
const checkAndSpeakSpeedWarning = (currentSpeed: number, limit: number) => {
    const now = Date.now();
    if (currentSpeed > limit && now - lastWarningTime > 8000) {
        lastWarningTime = now;
        const message = `Cảnh báo! Tốc độ hiện tại ${currentSpeed} km/h, vượt quá giới hạn ${limit} km/h!`;
        Speech.stop();
        Speech.speak(message, {
            language: 'vi-VN',
            pitch: 1.0,
            rate: 1.0,
        });
    }
};

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