const fs = require('fs');
const path = require('path');

// Create simple placeholder images as base64 encoded data URLs
const createPlaceholderImage = (width, height, text, bgColor = '#1a1a1a', textColor = '#f5f5f5') => {
  // This is a simple SVG that can be used as a placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${bgColor}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">
        ${text}
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
};

// Create placeholder images for each view
const images = [
  {
    filename: 'dashboard-admin-desktop.png',
    width: 1200,
    height: 800,
    text: 'مدیر (دسکتاپ)',
    bgColor: '#1a1a1a',
    textColor: '#E000A0'
  },
  {
    filename: 'dashboard-admin-mobile.png',
    width: 400,
    height: 800,
    text: 'مدیر (موبایل)',
    bgColor: '#1a1a1a',
    textColor: '#E000A0'
  },
  {
    filename: 'dashboard-employee-desktop.png',
    width: 1200,
    height: 800,
    text: 'کارمند (دسکتاپ)',
    bgColor: '#1a1a1a',
    textColor: '#10B981'
  },
  {
    filename: 'dashboard-employee-mobile.png',
    width: 400,
    height: 800,
    text: 'کارمند (موبایل)',
    bgColor: '#1a1a1a',
    textColor: '#10B981'
  }
];

// Ensure images directory exists
const imagesDir = path.join(__dirname, '..', 'public', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Create a simple HTML file that can be used to generate screenshots
const htmlContent = `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>شبرا OS - Placeholder Images</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
            color: #f5f5f5;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 0;
            border-bottom: 1px solid #333;
            margin-bottom: 30px;
        }
        
        .logo {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .logo-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #E000A0, #B8008A);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 18px;
        }
        
        .nav {
            display: flex;
            gap: 20px;
        }
        
        .nav a {
            color: #a1a1a1;
            text-decoration: none;
            padding: 8px 16px;
            border-radius: 6px;
            transition: all 0.3s;
        }
        
        .nav a:hover, .nav a.active {
            background: #E000A0;
            color: white;
        }
        
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .card {
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 12px;
            padding: 20px;
            transition: all 0.3s;
        }
        
        .card:hover {
            border-color: #E000A0;
            transform: translateY(-2px);
        }
        
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .card-title {
            font-size: 18px;
            font-weight: 600;
            color: #f5f5f5;
        }
        
        .card-value {
            font-size: 24px;
            font-weight: bold;
            color: #E000A0;
        }
        
        .stats-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        
        .stat-label {
            color: #a1a1a1;
            font-size: 14px;
        }
        
        .stat-value {
            color: #f5f5f5;
            font-weight: 500;
        }
        
        .chart-placeholder {
            height: 120px;
            background: linear-gradient(45deg, #E000A0/20, #B8008A/20);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #E000A0;
            font-size: 14px;
            margin-top: 15px;
        }
        
        .mobile-view {
            display: none;
        }
        
        @media (max-width: 768px) {
            .desktop-view {
                display: none;
            }
            
            .mobile-view {
                display: block;
            }
            
            .dashboard-grid {
                grid-template-columns: 1fr;
            }
            
            .nav {
                flex-direction: column;
                gap: 10px;
            }
        }
        
        .admin-badge {
            background: linear-gradient(135deg, #E000A0, #B8008A);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .employee-badge {
            background: linear-gradient(135deg, #10B981, #059669);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Desktop Admin View -->
        <div class="desktop-view">
            <div class="header">
                <div class="logo">
                    <div class="logo-icon">S</div>
                    <span>شبرا OS</span>
                    <span class="admin-badge">مدیر</span>
                </div>
                <nav class="nav">
                    <a href="#" class="active">داشبورد</a>
                    <a href="#">پروژه‌ها</a>
                    <a href="#">تیم</a>
                    <a href="#">گزارش‌ها</a>
                    <a href="#">تنظیمات</a>
                </nav>
            </div>
            
            <div class="dashboard-grid">
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">کل پروژه‌ها</div>
                        <div class="card-value">24</div>
                    </div>
                    <div class="stats-row">
                        <span class="stat-label">فعال</span>
                        <span class="stat-value">18</span>
                    </div>
                    <div class="stats-row">
                        <span class="stat-label">تکمیل شده</span>
                        <span class="stat-value">6</span>
                    </div>
                    <div class="chart-placeholder">📊 نمودار پیشرفت</div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">اعضای تیم</div>
                        <div class="card-value">156</div>
                    </div>
                    <div class="stats-row">
                        <span class="stat-label">آنلاین</span>
                        <span class="stat-value">89</span>
                    </div>
                    <div class="stats-row">
                        <span class="stat-label">آفلاین</span>
                        <span class="stat-value">67</span>
                    </div>
                    <div class="chart-placeholder">👥 وضعیت تیم</div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">درآمد ماهانه</div>
                        <div class="card-value">2.4M</div>
                    </div>
                    <div class="stats-row">
                        <span class="stat-label">رشد</span>
                        <span class="stat-value">+12%</span>
                    </div>
                    <div class="stats-row">
                        <span class="stat-label">هدف</span>
                        <span class="stat-value">2.8M</span>
                    </div>
                    <div class="chart-placeholder">💰 گزارش مالی</div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">تسک‌های امروز</div>
                        <div class="card-value">47</div>
                    </div>
                    <div class="stats-row">
                        <span class="stat-label">انجام شده</span>
                        <span class="stat-value">23</span>
                    </div>
                    <div class="stats-row">
                        <span class="stat-label">در انتظار</span>
                        <span class="stat-value">24</span>
                    </div>
                    <div class="chart-placeholder">✅ وضعیت تسک‌ها</div>
                </div>
            </div>
        </div>
        
        <!-- Mobile Admin View -->
        <div class="mobile-view">
            <div class="header">
                <div class="logo">
                    <div class="logo-icon">S</div>
                    <span>شبرا OS</span>
                    <span class="admin-badge">مدیر</span>
                </div>
            </div>
            
            <div class="dashboard-grid">
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">پروژه‌ها</div>
                        <div class="card-value">24</div>
                    </div>
                    <div class="chart-placeholder">📊</div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">تیم</div>
                        <div class="card-value">156</div>
                    </div>
                    <div class="chart-placeholder">👥</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
`;

// Write the HTML file
fs.writeFileSync(path.join(imagesDir, 'placeholder-generator.html'), htmlContent);

console.log('Placeholder image generator created successfully!');
console.log('Open public/images/placeholder-generator.html in your browser to generate screenshots.');
console.log('You can then take screenshots and save them as:');
images.forEach(img => {
  console.log(`- ${img.filename} (${img.width}x${img.height})`);
});
