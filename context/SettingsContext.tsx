// context/SettingsContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/services/api';

interface Settings {
  siteName: string;
  siteDescription: string;
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  facebook: string;
  instagram: string;
  telegram: string;
  whatsapp: string;
  deliveryFeeKabul: number;
  deliveryFeeOther: number;
  freeDeliveryThreshold: number;
  primaryColor: string;
  secondaryColor: string;
  footerText: string;
  isMaintenance: boolean;
  maintenanceMessage: string;
}

// ✅ مقدار پیش‌فرض
const defaultSettings: Settings = {
  siteName: 'فروشگاه افغانستان',
  siteDescription: 'بزرگترین فروشگاه تخصصی در افغانستان',
  phone: '۰۷۸۹ ۱۲۳ ۴۵۶۷',
  email: 'info@afghanstore.com',
  address: 'کابل، افغانستان',
  workingHours: 'شنبه تا پنجشنبه ۹:۰۰ - ۱۷:۰۰',
  facebook: '',
  instagram: '',
  telegram: '',
  whatsapp: '',
  deliveryFeeKabul: 50000,
  deliveryFeeOther: 100000,
  freeDeliveryThreshold: 0,
  primaryColor: '#e53e3e',
  secondaryColor: '#3182ce',
  footerText: '© تمامی حقوق محفوظ است',
  isMaintenance: false,
  maintenanceMessage: ''
};

const SettingsContext = createContext<Settings>(defaultSettings);

export function useSettings() {
  return useContext(SettingsContext); // ✅ دیگر خطا نمی‌دهد
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.settings.get()
      .then(res => res.json())
      .then(data => {
        if (data) {
          setSettings({ ...defaultSettings, ...data });
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}