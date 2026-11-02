import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import Footer from '../components/Footer';

const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.28:8080';

export default function LoginScreen() {
    const navigation = useNavigation<any>();
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

            // 🟢 Bóc tách chính xác từ resJson.data theo đúng response Swagger
            const { accessToken, user: userData } = resJson.data || {};

            if (accessToken) {
                await AsyncStorage.multiSet([
                    ['accessToken', accessToken],
                    ['token', accessToken],
                ]);
            }

            if (userData) {
                await AsyncStorage.setItem('user', JSON.stringify(userData));
            }

            // Điều hướng tới màn hình chính (Đảm bảo tên route 'HomeScreen' đã đăng ký trong App.tsx)
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'HomeDrawer' }],
                })
            );
        } catch (error: any) {
            Alert.alert('Lỗi đăng nhập', error.message || 'Không thể kết nối đến server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
                <ImageBackground
                    source={require('../../assets/backgroundlogin.png')}
                    style={styles.backgroundImage}
                    resizeMode="cover"
                >
                    <View style={styles.overlay}>
                        <View style={styles.card}>
                            <Text style={styles.title}>ĐĂNG NHẬP HỆ THỐNG</Text>

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

                            <TouchableOpacity
                                style={styles.button}
                                onPress={handleLogin}
                                disabled={loading}
                                activeOpacity={0.8}
                            >
                                {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Đăng nhập</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </ImageBackground>
            </ScrollView>
            <Footer />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    backgroundImage: { flex: 1, width: '100%', height: '100%' },
    overlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.45)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    card: { width: '100%', maxWidth: 400, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, elevation: 5 },
    title: { fontSize: 20, fontWeight: 'bold', color: '#008744', textAlign: 'center', marginBottom: 24 },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 6 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 12, height: 48 },
    icon: { marginRight: 10 },
    input: { flex: 1, fontSize: 15, color: '#1E293B' },
    button: { height: 48, backgroundColor: '#008744', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
    buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});