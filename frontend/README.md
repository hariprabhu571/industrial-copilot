# Industrial AI Copilot - Frontend

A modern Next.js frontend for the Industrial AI Copilot application, built with enterprise-grade design components.

## Features

- **Modern UI**: Built with Next.js 16, React 19, and Tailwind CSS
- **Enterprise Design**: Professional design system with shadcn/ui components
- **Authentication**: Role-based access control (Admin, Editor, Viewer)
- **Document Management**: Upload, browse, and manage PDF documents
- **AI Chat**: Interactive chat interface for document queries
- **Responsive**: Mobile-first responsive design
- **Dark/Light Mode**: Theme switching support
- **State Management**: Zustand for client-side state
- **TypeScript**: Full type safety

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Demo Credentials

- **Admin**: admin / admin123
- **Editor**: editor / editor123  
- **Viewer**: viewer / viewer123

## Project Structure

```
frontend-new/
├── app/                    # Next.js app router
│   ├── dashboard/         # Dashboard pages
│   ├── chat/             # Chat interface
│   ├── documents/        # Document management
│   ├── upload/           # File upload
│   ├── users/            # User management
│   ├── audit/            # Audit logs
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Login page
│   └── globals.css       # Global styles
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── app-header.tsx    # Application header
│   ├── app-sidebar.tsx   # Navigation sidebar
│   ├── login-form.tsx    # Login form
│   └── ...
├── lib/                  # Utilities and stores
│   ├── auth.ts           # Authentication logic
│   ├── store.ts          # Zustand stores
│   └── utils.ts          # Utility functions
└── ...
```

## Backend Integration

The frontend is configured to proxy API requests to the backend server:

- Development: `http://localhost:3001/api/*`
- API endpoints: `/api/chat`, `/api/upload`, `/api/auth`

## Technologies

- **Next.js 16** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Headless components
- **Zustand** - State management
- **Lucide React** - Icons
- **next-themes** - Theme switching

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint