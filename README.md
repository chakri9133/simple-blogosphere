
# Blogosphere - A Simple Blogging Platform

Blogosphere is a modern blogging platform built with React, TypeScript, and Supabase for backend services. It provides a streamlined experience for creating, reading, and interacting with blog posts.

## Features

- **User Authentication**: Sign up and sign in functionality using Supabase authentication
- **Blog Management**: Create, edit, and delete blog posts
- **Interactive Elements**: Like posts and add comments
- **Responsive Design**: Fully responsive UI that works across devices
- **Real-time Updates**: Dynamic content updates for a seamless user experience

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (authentication, database, and storage)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router
- **UI Components**: shadcn/ui component library
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js (v16 or above)
- npm or yarn or bun (package manager)
- Supabase account (for backend services)

### Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
bun install
```

3. Create a `.env` file in the root directory based on `.env.example`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
bun dev
```

5. Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal).

## Project Structure

- `src/components/`: UI components
- `src/context/`: React context providers
- `src/hooks/`: Custom React hooks
- `src/integrations/`: External service integrations (Supabase)
- `src/lib/`: Utility functions and types
- `src/pages/`: Page components for routing

## Available Scripts

- `dev`: Start the development server
- `build`: Build the project for production
- `preview`: Preview the production build locally

## Database Schema

The application uses the following tables in Supabase:

- **posts**: Store blog post details
- **comments**: Store comments on posts
- **likes**: Track user likes on posts
- **profiles**: User profile information

## Deployment

This project can be deployed to any hosting service that supports static site hosting (Vercel, Netlify, GitHub Pages, etc.). Make sure to set up the environment variables for Supabase connection.

## Contributing

Feel free to submit issues or pull requests for any bugs or feature requests.

## License

[MIT License](LICENSE)

## Acknowledgments

- [React](https://reactjs.org/)
- [Supabase](https://supabase.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query/latest)
