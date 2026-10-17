import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ImageBackground, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8080';

export default function LoginScreen() {
    const navigation = useNavigation<any>();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            setError('Vui lòng nhập đầy đủ tài khoản và mật khẩu');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    Username: username,
                    Password: password,
                }),
            });

            const result = await res.json();

            if (!res.ok || !result.success) {
                setError(result.message || 'Sai tên đăng nhập hoặc mật khẩu');
                return;
            }

            const { accessToken, user } = result.data || {};

            if (!user) {
                setError('Sai tên đăng nhập hoặc mật khẩu');
                return;
            }

            if (user.IsLocked) {
                setError('Tài khoản hiện đang bị khóa.');
                return;
            }

            if (!user.IsActive) {
                setError('Tài khoản chưa được kích hoạt qua email.');
                return;
            }

            // Lưu Token & User info vào Storage trên Mobile
            await AsyncStorage.setItem('accessToken', accessToken);
            await AsyncStorage.setItem('token', accessToken);
            await AsyncStorage.setItem('user', JSON.stringify(user));

            Alert.alert('Thành công', 'Đăng nhập thành công!');

            // Điều hướng vào ứng dụng (Chuyển sang Drawer Navigator)
            navigation.reset({
                index: 0,
                routes: [{ name: 'HomeDrawer' }],
            });
        } catch (err) {
            console.error(err);
            setError('Không thể kết nối đến máy chủ!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ImageBackground
            source={require('../../assets/backgroundlogin.png')} // Hoặc uri ảnh online nếu chưa có file local
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <View style={styles.overlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1, justifyContent: 'center' }}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Form Card */}
                        <View style={styles.card}>
                            {/* Logo */}
                            <View style={styles.logoContainer}>
                                <Image
                                    source={require('../../assets/expresswayicon3.png')} // Đặt ảnh logo vào thư mục assets của Mobile
                                    style={styles.logo}
                                    resizeMode="contain"
                                />
                            </View>

                            <Text style={styles.title}>ĐĂNG NHẬP</Text>

                            {/* Username Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Tài khoản</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập tên đăng nhập"
                                    placeholderTextColor="#999"
                                    value={username}
                                    onChangeText={setUsername}
                                    autoCapitalize="none"
                                />
                            </View>

                            {/* Password Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Mật khẩu</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập mật khẩu"
                                    placeholderTextColor="#999"
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                />
                            </View>

                            {/* Error Message */}
                            {!!error && <Text style={styles.errorText}>{error}</Text>}

                            {/* Buttons */}
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={[styles.button, styles.buttonLogin]}
                                    onPress={handleLogin}
                                    disabled={loading}
                                    activeOpacity={0.8}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.buttonLoginText}>Đăng nhập</Text>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.button, styles.buttonRegister]}
                                    onPress={() => navigation.navigate('Register')}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.buttonRegisterText}>Đăng ký</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Forgot Password Link */}
                            <TouchableOpacity
                                style={styles.forgotPassContainer}
                                onPress={() => navigation.navigate('ForgotPassword')}
                            >
                                <Text style={styles.forgotPassText}>Quên mật khẩu?</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.4)', // Phủ lớp mờ giống class .expr
        paddingHorizontal: 20,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        width: '100%',
        maxWidth: 400,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8, // Hiệu ứng đổ bóng Android
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    logo: {
        width: 180,
        height: 60,
    },
    title: {
        textAlign: 'center',
        color: '#0A9646',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 24,
        letterSpacing: 1,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#D9D9D9',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        color: '#333333',
        backgroundColor: '#FFFFFF',
    },
    errorText: {
        color: '#FF4D4F',
        fontSize: 13,
        marginBottom: 12,
    },
    buttonContainer: {
        gap: 12,
        marginTop: 8,
    },
    button: {
        height: 44,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonLogin: {
        backgroundColor: '#0A9646',
    },
    buttonLoginText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonRegister: {
        borderWidth: 1,
        borderColor: '#0A9646',
        backgroundColor: '#FFFFFF',
    },
    buttonRegisterText: {
        color: '#0A9646',
        fontSize: 16,
        fontWeight: '600',
    },
    forgotPassContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    forgotPassText: {
        color: '#1890FF',
        fontSize: 14,
    },
});