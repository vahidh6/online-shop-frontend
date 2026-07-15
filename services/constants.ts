// services/constants.ts

// ============ COLORS ============
export const COLOR_OPTIONS = [
    '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', 
    '#ef4444', '#ec4899', '#06b6d4', '#84cc16', 
    '#f97316', '#6366f1', '#14b8a6', '#d946ef'
  ];
  
  // ============ ICONS ============
  export const ICON_OPTIONS = [
    '📦', '📱', '🔧', '🔋', '🛡️', '🎧', '⌚', '💻', 
    '🎮', '📷', '🖨️', '🔌', '💾', '📀', '🎥', '📡', 
    '🔊', '🎤', '🖱️', '⌨️', '📠', '☎️', '📺'
  ];
  
  // ============ CATEGORIES ============
  export const CATEGORIES = [
    'قطعات و تعمیرات موبایل',
    'باتری و شارژ',
    'محافظ و جانبی',
    'صدا و تصویر',
    'سایر'
  ];
  
  // ============ PROVINCES ============
  export const PROVINCES = ['کابل', 'هرات', 'مزارشریف', 'قندهار', 'بلخ', 'ننگرهار', 'بامیان', 'دیگر'];
  
  // ============ ORDER STATUS ============
  export const ORDER_STATUSES = {
    pending_payment: 'در انتظار پرداخت',
    payment_uploaded: 'رسید ارسال شده',
    payment_verified: 'پرداخت تایید شده',
    processing: 'در حال پردازش',
    shipped: 'ارسال شده',
    delivered: 'تحویل داده شده',
    cancelled: 'لغو شده'
  };
  
  export const ORDER_STATUS_COLORS = {
    pending_payment: 'bg-yellow-100 text-yellow-800',
    payment_uploaded: 'bg-blue-100 text-blue-800',
    payment_verified: 'bg-green-100 text-green-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  
  // ============ USER ROLES ============
  export const USER_ROLES = {
    admin: 'مدیر',
    sales_manager: 'مدیر فروش',
    customer: 'مشتری'
  };
  
  // ============ PAYMENT METHODS ============
  export const PAYMENT_METHODS = {
    cash_on_delivery: 'پرداخت نقدی هنگام تحویل',
    card_to_card: 'حواله بانکی (کارت به کارت)',
    exchange_hawala: 'حواله صرافی'
  };