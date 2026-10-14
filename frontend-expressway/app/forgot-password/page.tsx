'use client';
import { useState } from 'react';
import { message, Input, Button } from 'antd';
import "./forgotPassword.css"
import Header from '../components/Header/Header';
import { useTranslation } from "react-i18next";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const { t } = useTranslation();

  const handleSendRequest = async () => {
    const res = await fetch(`${baseUrl}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (data.success) {
      message.success(data.message);
    } else {
      message.error(data.message);
    }
  };

  return (
    <>
      <Header/>
      <div style={{ maxWidth: 400, margin: '100px auto', textAlign: 'center' }}>
        <h2>{t("user.forgotPass")}</h2>
        <p>{t("user.forgotText")}</p>
        <Input placeholder={t("user.enterEmail")} onChange={(e) => setEmail(e.target.value)} />
        <Button type="primary" onClick={handleSendRequest} style={{ marginTop: 20 }}>
          {t("user.forgotSubmit")}
        </Button>
      </div>
    </>
  );
}