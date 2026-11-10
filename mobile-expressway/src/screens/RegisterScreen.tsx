import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions, } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import Footer from '../components/Footer';

const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.28:8080';

export default function RegisterScreen() {
    const navigation = useNavigation<any>();
    const { width, height } = useWindowDimensions();
    const isTablet = width >= 768;

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleRegister = async () => {
        if (!username.trim() || !email.trim() || !password || !confirmPassword) {
            Alert.alert('Thông báo', 'Vui lòng điền đầy đủ tất cả các trường!');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Thông báo', 'Mật khẩu xác nhận không khớp!');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${baseUrl}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    Username: username.trim(),
                    Email: email.trim(),
                    Password: password,
                    RoleId: 2,
                }),
            });

            const resJson = await response.json();

            if (!response.ok) {
                throw new Error(resJson.message || 'Đăng ký không thành công');
            }

            Alert.alert(
                'Thành công',
                'Đăng ký tài khoản thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.',
                [{ text: 'Đăng nhập ngay', onPress: () => navigation.navigate('Login') }]
            );
        } catch (error: any) {
            Alert.alert('Lỗi đăng ký', error.message || 'Không thể kết nối đến máy chủ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Lớp 1: Ảnh nền tràn toàn bộ màn hình */}
            <Image
                source={require('../../assets/backgroundlogin.png')}
                style={styles.backgroundImage}
                resizeMode="cover"
            />

            {/* Lớp 2: Lớp phủ đen/xám tràn toàn bộ màn hình */}
            <View style={styles.overlay} />

            {/* Lớp 3: Nội dung Form có thể cuộn và đẩy bàn phím */}
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
                        <Text style={styles.title}>ĐĂNG KÝ TÀI KHOẢN</Text>

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

                        {/* Email */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialIcons name="email" size={18} color="#64748B" style={styles.icon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="example@gmail.com"
                                    placeholderTextColor="#94A3B8"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
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

                        {/* Confirm Password */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Xác nhận mật khẩu</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="shield-checkmark-outline" size={18} color="#64748B" style={styles.icon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Xác nhận mật khẩu"
                                    placeholderTextColor="#94A3B8"
                                    secureTextEntry={!showConfirmPassword}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                />
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <MaterialIcons
                                        name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                                        size={20}
                                        color="#64748B"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Nút Đăng ký */}
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleRegister}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Đăng ký</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={() => navigation.navigate('Login')}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.loginButtonText}>
                                Đã có tài khoản? <Text style={styles.highlightText}>Đăng nhập</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
        ...StyleSheet.absoluteFill,
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFill,
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
    title: { fontSize: 20, fontWeight: 'bold', color: '#008744', textAlign: 'center', marginBottom: 20 },
    inputGroup: { marginBottom: 14 },
    label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 6 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 12, height: 46 },
    icon: { marginRight: 10 },
    input: { flex: 1, fontSize: 15, color: '#1E293B' },
    button: { height: 48, backgroundColor: '#008744', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
    buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
    loginButton: { marginTop: 16, paddingVertical: 8, alignItems: 'center' },
    loginButtonText: { fontSize: 14, color: '#64748B' },
    highlightText: { color: '#008744', fontWeight: 'bold' },
});