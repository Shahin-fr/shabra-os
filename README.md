# Shabra OS

A modern, comprehensive project management and team collaboration platform built with cutting-edge web technologies, featuring advanced security, performance optimizations, and a robust architecture.

## Table of Contents

- [About Shabra OS](#about-shabra-os)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## About Shabra OS

Shabra OS is a comprehensive project management and team collaboration platform designed for modern teams. It provides an intuitive interface for managing projects, tasks, and team workflows with advanced features including:

### Core Features

- **📋 Project Management**: Complete project lifecycle management with role-based access control
- **📝 Task Management**: Advanced task tracking with drag-and-drop functionality
- **📅 Content Calendar**: Visual content planning and scheduling system
- **🎨 Storyboard**: Interactive story planning and content creation tools
- **👥 Team Collaboration**: Real-time collaboration features with presence indicators
- **📊 Analytics Dashboard**: Comprehensive reporting and analytics
- **🔐 Security**: Enterprise-grade security with RBAC and audit logging
- **📱 Mobile-First**: Responsive design optimized for all devices

### Key Capabilities

- **Real-time Collaboration**: Live editing and presence indicators
- **Advanced Security**: Role-based access control, input sanitization, and audit logging
- **Performance Optimized**: Lazy loading, query optimization, and memory leak prevention
- **Scalable Architecture**: Service layer pattern with centralized error handling
- **Type Safety**: Full TypeScript implementation with comprehensive type definitions

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.4.6 | React framework with App Router |
| **TypeScript** | Latest | Type-safe JavaScript |
| **Tailwind CSS** | Latest | Utility-first CSS framework |
| **Zustand** | Latest | State management with domain-specific stores |
| **TanStack Query** | Latest | Server state management and caching |
| **Radix UI** | Latest | Accessible component primitives |
| **Framer Motion** | Latest | Animation library (optimized) |
| **@dnd-kit** | Latest | Drag and drop functionality |
| **Sonner** | Latest | Toast notifications |
| **date-fns** | Latest | Date manipulation |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js API Routes** | 15.4.6 | Serverless API endpoints |
| **NextAuth.js** | v5 | Authentication and session management |
| **Prisma** | Latest | Database ORM with query optimization |
| **PostgreSQL** | Latest | Primary database |
| **Prisma Accelerate** | Latest | Database connection pooling |
| **Zod** | Latest | Schema validation |
| **bcryptjs** | Latest | Password hashing |

### Development & Deployment
| Technology | Purpose |
|------------|---------|
| **Turbopack** | Fast development builds |
| **ESLint** | Code linting and quality |
| **Prettier** | Code formatting |
| **Husky** | Git hooks |
| **Vercel** | Deployment platform |

## Project Architecture

### Service Layer Pattern
The application follows a clean architecture with a dedicated service layer:

```
src/
├── services/           # Business logic layer
│   ├── story.service.ts
│   └── project.service.ts
├── lib/
│   ├── middleware/     # API middleware
│   ├── validators/     # Input validation schemas
│   └── utils/          # Utility functions
└── app/api/           # API route handlers (thin controllers)
```

### Domain-Specific State Management
State is organized into focused, domain-specific Zustand stores:

- **`app.store.ts`**: Application-wide state and settings
- **`user.store.ts`**: User authentication and profile data
- **`ui.store.ts`**: UI state and preferences
- **`cache.store.ts`**: Client-side caching
- **`error.store.ts`**: Centralized error handling

### Centralized Validation & Error Handling
- **Input Validation**: Zod schemas for all API endpoints
- **Error Handling**: Centralized error handling with user-friendly messages
- **Type Safety**: Comprehensive TypeScript types throughout

### Security Architecture
- **Authentication**: NextAuth.js with JWT strategy
- **Authorization**: Role-based access control (RBAC)
- **Input Sanitization**: XSS protection and input validation
- **Rate Limiting**: API endpoint protection
- **Audit Logging**: Comprehensive security event logging

## Getting Started

### Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **PostgreSQL** 14+ database
- **pnpm** package manager (recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/shabra-os.git
   cd shabra-os
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Configuration**
   ```bash
   # Copy the environment template
   cp .env.example .env.local
   
   # Edit .env.local with your configuration
   # See Environment Variables section below
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   pnpm prisma generate
   
   # Run database migrations
   pnpm prisma migrate dev
   
   # (Optional) Seed the database with sample data
   pnpm prisma:seed
   ```

5. **Start Development Server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Starts the development server with Turbopack |
| `pnpm build` | Builds the application for production |
| `pnpm start` | Starts the production server |
| `pnpm lint` | Runs ESLint to check code quality |
| `pnpm lint:fix` | Automatically fixes ESLint issues |
| `pnpm type-check` | Runs TypeScript type checking |
| `pnpm prisma:generate` | Generates Prisma client |
| `pnpm prisma:migrate` | Runs database migrations |
| `pnpm prisma:seed` | Seeds the database with sample data |
| `pnpm prisma:studio` | Opens Prisma Studio |

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js | `your-secret-key-here` |
| `NEXTAUTH_URL` | Base URL of your application | `http://localhost:3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/shabra` |
| `NODE_ENV` | Environment mode | `development` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PRISMA_DATABASE_URL` | Prisma Accelerate connection | Same as `DATABASE_URL` |
| `NEXTAUTH_DEBUG` | Enable NextAuth debugging | `false` |
| `ANALYZE` | Enable bundle analysis | `false` |

### Environment Setup

Create a `.env.local` file in the root directory:

```env
# Authentication
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/shabra_os
PRISMA_DATABASE_URL=postgresql://username:password@localhost:5432/shabra_os

# Environment
NODE_ENV=development
```

## Deployment

### Vercel Deployment (Recommended)

This project is optimized for Vercel deployment with the following features:

- **Serverless-ready**: Optimized for Vercel's serverless functions
- **Prisma integration**: Automatic Prisma Client generation
- **Environment validation**: Proper error handling for missing configuration
- **Performance optimized**: Webpack optimizations and chunk splitting

#### Deployment Steps

1. **Connect Repository**
   - Connect your GitHub repository to Vercel
   - Vercel will automatically detect Next.js

2. **Configure Environment Variables**
   - Set all required environment variables in Vercel dashboard
   - Ensure `NEXTAUTH_URL` is set to your production domain

3. **Deploy**
   - Vercel will automatically run the build process
   - Database migrations will run automatically

### Other Platforms

The application can also be deployed to:
- **Railway**: With PostgreSQL addon
- **Render**: With managed PostgreSQL
- **DigitalOcean App Platform**: With managed database

## Project Structure

```
shabra-os/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (main)/            # Main application pages
│   │   └── api/               # API routes
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Base UI components
│   │   ├── dashboard/        # Dashboard components
│   │   ├── storyboard/       # Storyboard components
│   │   └── layout/           # Layout components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions and configurations
│   │   ├── middleware/       # API middleware
│   │   ├── validators/       # Input validation schemas
│   │   └── utils/            # Utility functions
│   ├── services/             # Business logic layer
│   ├── stores/               # Zustand state management
│   └── types/                # TypeScript type definitions
├── prisma/                   # Database schema and migrations
├── public/                   # Static assets
├── content/                  # Documentation and content files
└── scripts/                  # Build and utility scripts
```

## Security Features

- **🔐 Authentication**: NextAuth.js with secure session management
- **🛡️ Authorization**: Role-based access control (ADMIN, MANAGER, EMPLOYEE)
- **🔒 Input Validation**: Comprehensive input sanitization and validation
- **⚡ Rate Limiting**: API endpoint protection against abuse
- **📝 Audit Logging**: Comprehensive security event logging
- **🔑 Secure Credentials**: Environment-based configuration management

## Performance Features

- **⚡ Lazy Loading**: Dynamic imports for optimal bundle size
- **🚀 Query Optimization**: N+1 query prevention and eager loading
- **💾 Caching**: Intelligent client-side and server-side caching
- **🎨 Animation Optimization**: GPU-accelerated animations with performance monitoring
- **📱 Mobile Optimization**: Responsive design with mobile-first approach

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** following our coding standards
4. **Run tests** (`pnpm lint` and `pnpm type-check`)
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests for new features
- Update documentation for API changes
- Follow the established code style (ESLint + Prettier)
- Ensure all security best practices are followed

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:

- **📚 Documentation**: Check the `content/docs/` directory for detailed guides
- **🐛 Issues**: Create a new issue with detailed information
- **💬 Discussions**: Use GitHub Discussions for questions and ideas

---

**Built with ❤️ by the Shahin Farahmand**

*Shabra OS - Transforming project management through innovation and collaboration.*