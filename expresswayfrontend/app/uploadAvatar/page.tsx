'use client'; // BẮT BUỘC phải có dòng này

import React, { useState } from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation'; // Để lấy userId từ URL

const AvatarUpload = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Lấy userId từ URL
  const userId = searchParams.get('userId');

  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning("Vui lòng chọn ảnh trước!");
      return;
    }

    if (!userId) {
      message.error("Không tìm thấy thông tin người dùng!");
      return;
    }

    const formData = new FormData();
    // LƯU Ý: Ant Design lưu file thật trong thuộc tính 'originFileObj'
    formData.append('file', fileList[0].originFileObj);

    setUploading(true);
    try {
      const response = await fetch(`http://localhost:8080/users/${userId}/avatar`, {
        method: 'PATCH',
        body: formData,
        // Không để Content-Type trong Header
      });

      if (response.ok) {
        message.success('Upload ảnh đại diện thành công!');
        router.push('/dashboard'); // Chuyển trang mượt mà
      } else {
        const errorData = await response.json();
        message.error(errorData.message || 'Upload thất bại.');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi kết nối server.');
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
          // Chỉ nhận file ảnh
          const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
          if (!isJpgOrPng) {
            message.error('Bạn chỉ có thể tải lên định dạng JPG/PNG!');
            return Upload.LIST_IGNORE;
          }
          setFileList([{ originFileObj: file }]); // Lưu file vào state
          return false; // Chặn tự động upload của Antd
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