# Classic Carrry Admin Panel

Admin dashboard for managing the Classic Carrry e-commerce platform.

## 🎯 Features

- 📊 Dashboard with analytics and statistics
- 🛍️ Product Management (CRUD operations)
- 📦 Order Management & tracking
- 👥 User Management
- 🎨 Hero Image Carousel management
- 🏷️ Category Management
- 🎫 Coupon Management
- ⚙️ Settings (Contact info, FAQs, Appearance)
- 📧 Contact Form submissions
- 🔐 JWT Authentication
- 🔒 Role-based access control (Admin only)

## 🛠️ Tech Stack

- **React 19** - UI library
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Vercel** - Hosting platform

## 💻 Local Development

### Prerequisites
- Node.js 18+
- Backend API running

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment:**
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

Access at: `http://localhost:5173`

## 🏗️ Build for Production

```bash
npm run build
```

Output in `dist/` folder.

## 📁 Project Structure

```
classic-carrry-admin/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   │   ├── AdminLayout.jsx
│   │   ├── BackendErrorPage.jsx
│   │   └── Notification.jsx
│   ├── contexts/        # React contexts
│   │   ├── AuthContext.jsx
│   │   ├── BackendHealthContext.jsx
│   │   └── NotificationContext.jsx
│   ├── pages/           # Page components
│   │   ├── Dashboard.jsx
│   │   ├── Products.jsx
│   │   ├── Orders.jsx
│   │   ├── Users.jsx
│   │   ├── Categories.jsx
│   │   ├── HeroImages.jsx
│   │   ├── Coupons.jsx
│   │   ├── Settings.jsx
│   │   └── Contacts.jsx
│   ├── services/        # API services
│   │   ├── api.js
│   │   └── heroImageAPI.js
│   ├── config/          # Configuration
│   │   └── api.js
│   ├── App.jsx          # Main app component
│   ├── index.css        # Global styles
│   └── main.jsx         # Entry point
├── .env                 # Environment variables (not in git)
├── .env.example         # Environment template
├── .gitignore           # Git ignore rules
├── index.html           # HTML template
├── package.json         # Dependencies
├── vercel.json          # Vercel configuration
└── vite.config.js       # Vite configuration
```

## 🔐 Authentication

### Default Admin Credentials

Create admin user via backend or register first user and manually set role to 'admin' in MongoDB.

## 🎨 Customization

### Brand Colors

Edit `src/index.css`:
```css
/* Primary brand color */
#D2C1B6

/* Secondary brand color */
#8B7355
```

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://api.example.com/api` |

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions to Vercel.

## 📞 Support

For issues or questions: classiccarrry@gmail.com

## 📄 License

MIT
