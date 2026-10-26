import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, CommonActions } from '@react-navigation/native';

export default function LoginScreen() {
    const navigation = useNavigation<any>();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!username.trim() || !password) {
            Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu!');
            return;
        }

        setLoading(true);
        try {
            const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.28:8080';

            const response = await fetch(`${baseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept-language': 'vi', // 👈 Tùy chọn ngôn ngữ phản hồi từ backend
                },
                body: JSON.stringify({
                    Username: username.trim(), // 👈 Chuẩn PascalCase theo Swagger
                    Password: password,        // 👈 Chuẩn PascalCase theo Swagger
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Đăng nhập không thành công');
            }

            // Lưu Token và Thông tin User
            const token = data.accessToken || data.token || data.access_token;
            if (token) {
                await AsyncStorage.setItem('accessToken', token);
            }

            const userData = data.user || data.data || { username };
            await AsyncStorage.setItem('user', JSON.stringify(userData));

            // Chuyển hướng tới HomeScreen (trong Drawer)
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'HomeScreen' }],
                })
            );
        } catch (error: any) {
            Alert.alert('Lỗi đăng nhập', error.message || 'Không thể kết nối đến server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>ĐĂNG NHẬP HỆ THỐNG</Text>

            <TextInput
                style={styles.input}
                placeholder="Tên đăng nhập"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />

            <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <Text style={styles.buttonText}>Đăng nhập</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        backgroundColor: '#FFFFFF',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#008744',
        textAlign: 'center',
        marginBottom: 28,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#CBD5E0',
        borderRadius: 8,
        paddingHorizontal: 14,
        marginBottom: 16,
        fontSize: 15,
    },
    button: {
        height: 50,
        backgroundColor: '#008744',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});