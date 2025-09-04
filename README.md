# Shabra OS

A modern, comprehensive project management and team collaboration platform built with cutting-edge web technologies. Shabra OS provides an intuitive interface for managing projects, tasks, and team workflows with features like storyboarding, content calendar management, and real-time collaboration tools.

## 🚀 Tech Stack

| Category             | Technology                  |
| -------------------- | --------------------------- |
| **Framework**        | Next.js 15.4.6 (App Router) |
| **Language**         | TypeScript                  |
| **Database**         | PostgreSQL with Prisma ORM  |
| **Authentication**   | NextAuth.js v5              |
| **Styling**          | Tailwind CSS                |
| **State Management** | Zustand                     |
| **Data Fetching**    | TanStack Query              |
| **UI Components**    | Radix UI                    |
| **Animations**       | Framer Motion               |
| **Drag & Drop**      | @dnd-kit                    |
| **Date Handling**    | date-fns                    |
| **Icons**            | Lucide React                |

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn package manager

### Local Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/shabra-os.git
   cd shabra-os
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   ```bash
   # Copy the environment template
   cp .env.example .env.local

   # Edit .env.local with your configuration
   # Required variables:
   # - NEXTAUTH_SECRET (generate a strong secret)
   # - NEXTAUTH_URL (http://localhost:3000 for local dev)
   # - PRISMA_DATABASE_URL (your PostgreSQL connection string)
   # - POSTGRES_URL (direct database connection)
   ```

4. **Database Setup**

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run database migrations
   npx prisma migrate dev

   # (Optional) Seed the database with sample data
   npm run prisma:seed
   ```

5. **Start Development Server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📜 Available Scripts

| Script                 | Description                                  |
| ---------------------- | -------------------------------------------- |
| `npm run dev`          | Starts the development server with Turbopack |
| `npm run build`        | Builds the application for production        |
| `npm run start`        | Starts the production server                 |
| `npm run lint`         | Runs ESLint to check code quality            |
| `npm run lint:fix`     | Automatically fixes ESLint issues            |
| `npm run prepare-docs` | Prepares documentation files                 |

## 🏗️ Project Structure

```
shabra-os/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utility functions and configurations
│   ├── stores/              # Zustand state management
│   └── types/               # TypeScript type definitions
├── prisma/                  # Database schema and migrations
├── public/                  # Static assets
├── content/                 # Documentation and content files
└── scripts/                 # Build and utility scripts
```

## 🔐 Environment Variables

| Variable              | Description                          | Required |
| --------------------- | ------------------------------------ | -------- |
| `NEXTAUTH_SECRET`     | Secret key for NextAuth.js           | ✅       |
| `NEXTAUTH_URL`        | Base URL of your application         | ✅       |
| `PRISMA_DATABASE_URL` | PostgreSQL connection string         | ✅       |
| `POSTGRES_URL`        | Direct database connection           | ✅       |
| `NODE_ENV`            | Environment (development/production) | ✅       |

## 🚀 Deployment

This project is optimized for deployment on Vercel with the following features:

- **Serverless-ready**: Optimized for Vercel's serverless functions
- **Prisma integration**: Automatic Prisma Client generation on deployment
- **Environment validation**: Proper error handling for missing configuration
- **Performance optimized**: Webpack optimizations and chunk splitting

### Vercel Deployment Steps

1. Connect your GitHub repository to Vercel
2. Set all required environment variables in Vercel dashboard
3. Deploy - Vercel will automatically run the build process

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

- Check the [Issues](https://github.com/your-username/shabra-os/issues) page
- Review the documentation in the `content/` directory
- Create a new issue with detailed information about your problem

---

**Built with ❤️ by the Shabra Team**
