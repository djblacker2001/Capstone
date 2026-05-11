// uploadAvatar
'use client';

import { useEffect, useState } from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';

const AvatarUpload = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Lấy userId từ URL
  const userIdRaw = searchParams.get('userId');
  const userId = userIdRaw ? parseInt(userIdRaw) : null;

  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    console.log("UserId hiện tại từ URL:", userId);
  }, [userId]);

  const handleUpload = async () => {
    if (!userId || isNaN(userId)) {
      message.error("Không tìm thấy ID người dùng hợp lệ.");
      return;
    }

    if (fileList.length === 0) {
      message.warning("Vui lòng chọn ảnh trước!");
      return;
    }

    const formData = new FormData();
    formData.append('file', fileList[0].originFileObj);

    setUploading(true);

    try {
      // upload avatar
      const response = await fetch(
        `http://localhost:8080/users/${userId}/avatar`,
        {
          method: 'PATCH',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Upload thất bại");
      }

      // lấy user mới nhất
      const userResponse = await fetch(
        `http://localhost:8080/users/${userId}`
      );

      if (!userResponse.ok) {
        throw new Error("Không lấy được thông tin user");
      }

      const updatedUser = await userResponse.json();
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("userUpdate"));
      message.success("Upload ảnh thành công!");
      router.push("/");

    } catch (error) {
      console.error(error);
      message.error("Có lỗi xảy ra.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: 50, textAlign: 'center', maxWidth: 400, margin: '0 auto' }}>
      <h2>Tải lên ảnh đại diện</h2>
      <Upload
        listType="picture-circle"
        fileList={fileList}
        maxCount={1}
        beforeUpload={(file) => {
          const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
          if (!isJpgOrPng) {
            message.error('Bạn chỉ có thể tải lên định dạng JPG/PNG!');
            return Upload.LIST_IGNORE;
          }
          setFileList([{ originFileObj: file }]);
          return false; 
        }}
        onRemove={() => setFileList([])}
      >
        {fileList.length < 1 && (
          <div>
            <UploadOutlined />
            <div style={{ marginTop: 8 }}>Chọn ảnh</div>
          </div>
        )}
      </Upload>

      <div style={{ marginTop: 24 }}>
        <Button
          type="primary"
          onClick={handleUpload}
          loading={uploading}
          style={{ width: '100%', marginBottom: 10 }}
        >
          Lưu ảnh
        </Button>

        <Button type="link" onClick={() => router.push('/')}>
          Bỏ qua bước này
        </Button>
      </div>
    </div>
  );
};

export default AvatarUpload;