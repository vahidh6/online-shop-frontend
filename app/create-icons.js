const fs = require('fs');
const path = require('path');

// ایجاد پوشه icons اگر وجود نداشت
const iconsDir = path.join(process.cwd(), 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// تابع ایجاد SVG به عنوان جایگزین PNG
function createSvgIcon(size, color = '#e53e3e') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="${color}"/>
    <text x="${size/2}" y="${size/2}" font-size="${size * 0.6}" text-anchor="middle" dominant-baseline="middle" fill="white">🛍️</text>
  </svg>`;
}

// آیکون‌های مختلف
const icons = [
  { size: 72, filename: 'icon-72x72.png' },
  { size: 96, filename: 'icon-96x96.png' },
  { size: 128, filename: 'icon-128x128.png' },
  { size: 144, filename: 'icon-144x144.png' },
  { size: 152, filename: 'icon-152x152.png' },
  { size: 192, filename: 'icon-192x192.png' },
  { size: 384, filename: 'icon-384x384.png' },
  { size: 512, filename: 'icon-512x512.png' },
];

// ذخیره فایل‌ها (به صورت SVG موقت)
icons.forEach(icon => {
  const svgContent = createSvgIcon(icon.size);
  const svgPath = path.join(iconsDir, icon.filename.replace('.png', '.svg'));
  fs.writeFileSync(svgPath, svgContent);
  console.log(`✅ Created: ${icon.filename.replace('.png', '.svg')}`);
});

console.log('\n📝 توجه: فایل‌های SVG ایجاد شدند.');
console.log('برای تبدیل به PNG می‌توانید از https://convertio.co/fa/svg-png/ استفاده کنید.');