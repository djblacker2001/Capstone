import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import Footer from '../components/Footer';
import { useAuth } from '../components/AuthContext';

const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.28:8080';

export default function LoginScreen() {
    const navigation = useNavigation<any>();
    const { width } = useWindowDimensions();
    const { login } = useAuth(); // Lấy hàm login từ AuthContext
    const isTablet = width >= 600;

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!username.trim() || !password) {
            Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu!');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${baseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept-language': 'vi',
                },
                body: JSON.stringify({
                    Username: username.trim(),
                    Password: password,
                }),
            });

            const resJson = await response.json();

            if (!response.ok || !resJson.success) {
                throw new Error(resJson.message || 'Đăng nhập không thành công');
            }

            const { accessToken, user: userData } = resJson.data || {};

            if (accessToken) {
                await AsyncStorage.multiSet([
                    ['accessToken', accessToken],
                    ['token', accessToken],
                ]);
                if (userData) {
                    await AsyncStorage.setItem('user', JSON.stringify(userData));
                }

                // Thêm kiểm tra optional chaining `login?.(...)` để ứng dụng không bị crash nếu context chưa kịp mount
                if (typeof login === 'function') {
                    await login(accessToken, userData || {});
                }

                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'HomeDrawer' }],
                    })
                );
            }
        } catch (error: any) {
            Alert.alert('Lỗi đăng nhập', error.message || 'Không thể kết nối đến server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Ảnh nền phủ tuyệt đối tràn 4 góc */}
            <Image
                source={require('../../assets/backgroundlogin.png')}
                style={styles.backgroundImage}
                resizeMode="cover"
            />

            {/* Lớp phủ mờ màu tối */}
            <View style={styles.overlay} />

            {/* Khung Form cuộn */}
            <KeyboardAvoidingView
                style={styles.contentContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    bounces={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={[styles.card, { maxWidth: isTablet ? 480 : '100%' }]}>
                        <Text style={styles.title}>ĐĂNG NHẬP HỆ THỐNG</Text>

                        {/* Username */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Tên đăng nhập</Text>
                            <View style={styles.inputWrapper}>
                                <FontAwesome5 name="user" size={16} color="#64748B" style={styles.icon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập tên đăng nhập"
                                    placeholderTextColor="#94A3B8"
                                    value={username}
                                    onChangeText={setUsername}
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        {/* Password */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Mật khẩu</Text>
                            <View style={styles.inputWrapper}>
                                <FontAwesome5 name="lock" size={16} color="#64748B" style={styles.icon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập mật khẩu"
                                    placeholderTextColor="#94A3B8"
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <MaterialIcons
                                        name={showPassword ? 'visibility' : 'visibility-off'}
                                        size={20}
                                        color="#64748B"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Nút Đăng nhập */}
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleLogin}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Đăng nhập</Text>}
                        </TouchableOpacity>

                        {/* Nút chuyển sang Đăng ký */}
                        <TouchableOpacity
                            style={styles.registerButton}
                            onPress={() => navigation.navigate('Register')}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.registerButtonText}>
                                Chưa có tài khoản? <Text style={styles.highlightText}>Đăng ký ngay</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Footer dính chặt dưới đáy */}
            <Footer />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    backgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
    },
    contentContainer: {
        flex: 1,
        width: '100%',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        paddingBottom: 24,
    },
    card: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    title: { fontSize: 20, fontWeight: 'bold', color: '#008744', textAlign: 'center', marginBottom: 24 },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 6 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 12, height: 48 },
    icon: { marginRight: 10 },
    input: { flex: 1, fontSize: 15, color: '#1E293B' },
    button: { height: 48, backgroundColor: '#008744', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
    buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
    registerButton: { marginTop: 16, paddingVertical: 8, alignItems: 'center' },
    registerButtonText: { fontSize: 14, color: '#64748B' },
    highlightText: { color: '#008744', fontWeight: 'bold' },
});