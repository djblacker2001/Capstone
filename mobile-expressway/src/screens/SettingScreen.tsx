import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { Header } from '../components/Header';
import Footer from '../components/Footer';

const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.28:8080';

export default function SettingsScreen() {
    const navigation = useNavigation<any>();
    const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');
    const [user, setUser] = useState<any>(null);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOldPass, setShowOldPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [loadingInfo, setLoadingInfo] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const savedUserStr = await AsyncStorage.getItem('user');
            if (savedUserStr) {
                const parsedUser = JSON.parse(savedUserStr);
                setUser(parsedUser);
                setUsername(parsedUser.Username || parsedUser.username || '');
                setEmail(parsedUser.Email || parsedUser.email || '');
            }
        } catch (error) {
            console.error('Lỗi đọc dữ liệu người dùng:', error);
        }
    };

    // 📸 Chọn ảnh từ thư viện thiết bị
    const handlePickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('Thông báo', 'Cần cấp quyền truy cập ảnh để chọn ảnh đại diện!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setSelectedImage(result.assets[0]);
        }
    };

    // 🟢 1. Cập nhật thông tin cá nhân & Avatar (PUT /users/profile)
    const handleUpdateInfo = async () => {
        if (!username.trim()) {
            Alert.alert('Thông báo', 'Tên đăng nhập không được để trống!');
            return;
        }
        if (!email.trim() || !email.includes('@')) {
            Alert.alert('Thông báo', 'Email không hợp lệ!');
            return;
        }

        setLoadingInfo(true);
        try {
            const token =
                (await AsyncStorage.getItem('accessToken')) ||
                (await AsyncStorage.getItem('access_token')) ||
                (await AsyncStorage.getItem('token'));

            if (!token) {
                Alert.alert('Thông báo', 'Phiên làm việc hết hạn. Vui lòng đăng nhập lại!');
                return;
            }

            const formData = new FormData();
            formData.append('username', username.trim());
            formData.append('email', email.trim());

            if (selectedImage) {
                const filename = selectedImage.uri.split('/').pop() || 'avatar.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';

                formData.append('avatar', {
                    uri: Platform.OS === 'ios' ? selectedImage.uri.replace('file://', '') : selectedImage.uri,
                    name: filename,
                    type: type,
                } as any);
            }

            const res = await fetch(`${baseUrl}/users/profile`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
                body: formData,
            });

            const responseJson = await res.json();

            if (res.ok && (responseJson.success || responseJson.statusCode === 200)) {
                const updatedData = responseJson.data || responseJson;

                // Cập nhật Token nếu có mới
                const newToken = responseJson.accessToken || updatedData.accessToken;
                if (newToken) {
                    await AsyncStorage.multiSet([
                        ['accessToken', newToken],
                        ['token', newToken],
                    ]);
                }

                // Cập nhật Storage
                const mergedUser = {
                    ...user,
                    ...updatedData,
                    Username: updatedData.Username || updatedData.username || username,
                    Email: updatedData.Email || updatedData.email || email,
                    Avatar: updatedData.Avatar || updatedData.avatar || user?.Avatar,
                };

                await AsyncStorage.setItem('user', JSON.stringify(mergedUser));
                setUser(mergedUser);
                setSelectedImage(null);

                Alert.alert('Thành công', 'Cập nhật thông tin cá nhân thành công!', [
                    { text: 'OK', onPress: () => navigation.navigate('ProfileScreen') },
                ]);
            } else {
                Alert.alert('Thất bại', responseJson.message || 'Cập nhật thông tin thất bại!');
            }
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Lỗi kết nối đến máy chủ.');
        } finally {
            setLoadingInfo(false);
        }
    };

    // 🔒 2. Đổi mật khẩu (PUT /auth/change-password hoặc /users/change-password)
    const handleChangePassword = async () => {
        if (!oldPassword) {
            Alert.alert('Thông báo', 'Vui lòng nhập mật khẩu hiện tại!');
            return;
        }
        if (!newPassword || newPassword.length < 6) {
            Alert.alert('Thông báo', 'Mật khẩu mới phải có ít nhất 6 ký tự!');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Thông báo', 'Mật khẩu xác nhận không khớp!');
            return;
        }

        setLoadingPassword(true);
        try {
            const token =
                (await AsyncStorage.getItem('accessToken')) ||
                (await AsyncStorage.getItem('access_token')) ||
                (await AsyncStorage.getItem('token'));

            const res = await fetch(`${baseUrl}/auth/change-password`, {
                method: 'POST', // hoặc 'PUT' tùy API route backend của bạn
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    oldPassword,
                    newPassword,
                }),
            });

            const resJson = await res.json();

            if (res.ok && (resJson.success || resJson.statusCode === 200)) {
                Alert.alert('Thành công', 'Đổi mật khẩu thành công!', [
                    {
                        text: 'OK',
                        onPress: () => {
                            setOldPassword('');
                            setNewPassword('');
                            setConfirmPassword('');
                            navigation.navigate('HomeDrawer');
                        },
                    },
                ]);
            } else {
                Alert.alert('Lỗi', resJson.message || 'Mật khẩu hiện tại không chính xác!');
            }
        } catch (error: any) {
            Alert.alert('Lỗi', 'Lỗi kết nối khi đổi mật khẩu.');
        } finally {
            setLoadingPassword(false);
        }
    };

    // Xử lý link avatar hiển thị
    const avatarPath = user?.Avatar || user?.avatar;
    const avatarSrc = selectedImage
        ? selectedImage.uri
        : avatarPath
            ? avatarPath.startsWith('http')
                ? avatarPath
                : avatarPath.includes('uploads/avatars')
                    ? `${baseUrl}/${avatarPath.replace(/^\/+/, '')}`
                    : `${baseUrl}/uploads/avatars/${avatarPath}`
            : null;

    return (
        <View style={styles.screenWrapper}>
            <Header />

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                    <View style={styles.card}>
                        <Text style={styles.pageTitle}>Cấu hình tài khoản</Text>

                        {/* Segmented Tab Controls */}
                        <View style={styles.tabHeader}>
                            <TouchableOpacity
                                style={[styles.tabButton, activeTab === 'info' && styles.activeTabButton]}
                                onPress={() => setActiveTab('info')}
                            >
                                <Text style={[styles.tabButtonText, activeTab === 'info' && styles.activeTabButtonText]}>
                                    Thông tin cá nhân
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.tabButton, activeTab === 'password' && styles.activeTabButton]}
                                onPress={() => setActiveTab('password')}
                            >
                                <Text style={[styles.tabButtonText, activeTab === 'password' && styles.activeTabButtonText]}>
                                    Đổi mật khẩu
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* TAB 1: THÔNG TIN CÁ NHÂN */}
                        {activeTab === 'info' ? (
                            <View style={styles.formSection}>
                                {/* Avatar Uploader */}
                                <View style={styles.avatarContainer}>
                                    <TouchableOpacity style={styles.avatarWrapper} onPress={handlePickImage} activeOpacity={0.8}>
                                        {avatarSrc ? (
                                            <Image source={{ uri: avatarSrc }} style={styles.avatarImage} />
                                        ) : (
                                            <View style={styles.avatarPlaceholder}>
                                                <FontAwesome5 name="user" size={40} color="#94A3B8" />
                                            </View>
                                        )}
                                        <View style={styles.cameraIconBadge}>
                                            <MaterialIcons name="photo-camera" size={16} color="#FFFFFF" />
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.uploadBtn} onPress={handlePickImage}>
                                        <MaterialIcons name="file-upload" size={18} color="#008744" />
                                        <Text style={styles.uploadBtnText}>Chọn ảnh mới</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Username Input */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Tên đăng nhập</Text>
                                    <View style={styles.inputWrapper}>
                                        <FontAwesome5 name="user" size={16} color="#64748B" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.textInput}
                                            value={username}
                                            onChangeText={setUsername}
                                            autoCapitalize="none"
                                            placeholder="Nhập tên đăng nhập"
                                        />
                                    </View>
                                </View>

                                {/* Email Input */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Email</Text>
                                    <View style={styles.inputWrapper}>
                                        <MaterialIcons name="email" size={18} color="#64748B" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.textInput}
                                            value={email}
                                            onChangeText={setEmail}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            placeholder="Nhập địa chỉ email"
                                        />
                                    </View>
                                </View>

                                {/* Submit Info Button */}
                                <TouchableOpacity
                                    style={styles.submitBtn}
                                    onPress={handleUpdateInfo}
                                    disabled={loadingInfo}
                                    activeOpacity={0.8}
                                >
                                    {loadingInfo ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <>
                                            <FontAwesome5 name="save" size={16} color="#FFFFFF" />
                                            <Text style={styles.submitBtnText}>Lưu thay đổi</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        ) : (
                            /* TAB 2: ĐỔI MẬT KHẨU */
                            <View style={styles.formSection}>
                                {/* Old Password */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Mật khẩu hiện tại</Text>
                                    <View style={styles.inputWrapper}>
                                        <FontAwesome5 name="lock" size={15} color="#64748B" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.textInput}
                                            secureTextEntry={!showOldPass}
                                            value={oldPassword}
                                            onChangeText={setOldPassword}
                                            placeholder="Nhập mật khẩu hiện tại"
                                        />
                                        <TouchableOpacity onPress={() => setShowOldPass(!showOldPass)}>
                                            <MaterialIcons
                                                name={showOldPass ? 'visibility' : 'visibility-off'}
                                                size={20}
                                                color="#64748B"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* New Password */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Mật khẩu mới</Text>
                                    <View style={styles.inputWrapper}>
                                        <FontAwesome5 name="key" size={15} color="#64748B" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.textInput}
                                            secureTextEntry={!showNewPass}
                                            value={newPassword}
                                            onChangeText={setNewPassword}
                                            placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                                        />
                                        <TouchableOpacity onPress={() => setShowNewPass(!showNewPass)}>
                                            <MaterialIcons
                                                name={showNewPass ? 'visibility' : 'visibility-off'}
                                                size={20}
                                                color="#64748B"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Confirm New Password */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
                                    <View style={styles.inputWrapper}>
                                        <MaterialIcons name="check-circle-outline" size={18} color="#64748B" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.textInput}
                                            secureTextEntry={!showConfirmPass}
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            placeholder="Nhập lại mật khẩu mới"
                                        />
                                        <TouchableOpacity onPress={() => setShowConfirmPass(!showConfirmPass)}>
                                            <MaterialIcons
                                                name={showConfirmPass ? 'visibility' : 'visibility-off'}
                                                size={20}
                                                color="#64748B"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Submit Password Button */}
                                <TouchableOpacity
                                    style={styles.submitBtn}
                                    onPress={handleChangePassword}
                                    disabled={loadingPassword}
                                    activeOpacity={0.8}
                                >
                                    {loadingPassword ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <>
                                            <Ionicons name="key-outline" size={18} color="#FFFFFF" />
                                            <Text style={styles.submitBtnText}>Đổi mật khẩu</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <Footer />
        </View>
    );
}

const styles = StyleSheet.create({
    screenWrapper: {
        flex: 1,
        backgroundColor: '#F1F5F9',
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 24,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    pageTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
        textAlign: 'center',
        marginBottom: 16,
    },
    tabHeader: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 10,
        padding: 4,
        marginBottom: 20,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeTabButton: {
        backgroundColor: '#FFFFFF',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    tabButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    activeTabButtonText: {
        color: '#008744',
        fontWeight: 'bold',
    },
    formSection: {
        width: '100%',
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 10,
    },
    avatarImage: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 2,
        borderColor: '#E2E8F0',
    },
    avatarPlaceholder: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraIconBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#008744',
        padding: 6,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    uploadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#008744',
        backgroundColor: '#F0FDF4',
    },
    uploadBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#008744',
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 6,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 48,
    },
    inputIcon: {
        marginRight: 10,
    },
    textInput: {
        flex: 1,
        fontSize: 15,
        color: '#0F172A',
    },
    submitBtn: {
        height: 48,
        backgroundColor: '#008744',
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginTop: 10,
    },
    submitBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});