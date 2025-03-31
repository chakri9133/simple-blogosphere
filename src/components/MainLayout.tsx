
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { User, LogOut, Menu, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';

type MainLayoutProps = {
  children: React.ReactNode;
};

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const NavLink = ({ to, label }: { to: string; label: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive
            ? 'bg-blog-primary text-white'
            : 'text-blog-dark hover:bg-gray-100'
        }`}
      >
        {label}
      </Link>
    );
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    ...(user ? [{ to: '/create', label: 'New Post' }] : []),
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blog-primary">Blogosphere</h1>
              </Link>

              {/* Desktop navigation */}
              <nav className="hidden md:ml-6 md:flex md:space-x-2">
                {navLinks.map((link) => (
                  <NavLink key={link.to} to={link.to} label={link.label} />
                ))}
              </nav>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {!loading && (
                <>
                  {user ? (
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-medium text-gray-700">
                        Welcome, {user.username || user.email.split('@')[0]}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSignOut}
                        className="flex items-center"
                      >
                        <LogOut className="h-4 w-4 mr-1" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => navigate('/auth')}
                      className="flex items-center"
                    >
                      <User className="h-4 w-4 mr-1" />
                      Sign In
                    </Button>
                  )}
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center border-b pb-4">
                      <h2 className="text-lg font-semibold">Menu</h2>
                      <SheetClose asChild>
                        <Button variant="ghost" size="icon">
                          <X className="h-5 w-5" />
                        </Button>
                      </SheetClose>
                    </div>

                    <nav className="flex flex-col space-y-4 py-6">
                      {navLinks.map((link) => (
                        <SheetClose key={link.to} asChild>
                          <Link
                            to={link.to}
                            className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
                          >
                            {link.label}
                          </Link>
                        </SheetClose>
                      ))}
                    </nav>

                    <div className="mt-auto border-t pt-4">
                      {!loading && (
                        <>
                          {user ? (
                            <div className="space-y-4">
                              <div className="text-sm font-medium text-gray-700">
                                Signed in as {user.username || user.email.split('@')[0]}
                              </div>
                              <SheetClose asChild>
                                <Button
                                  variant="outline"
                                  onClick={handleSignOut}
                                  className="w-full flex items-center justify-center"
                                >
                                  <LogOut className="h-4 w-4 mr-1" />
                                  Sign Out
                                </Button>
                              </SheetClose>
                            </div>
                          ) : (
                            <SheetClose asChild>
                              <Button
                                onClick={() => navigate('/auth')}
                                className="w-full flex items-center justify-center"
                              >
                                <User className="h-4 w-4 mr-1" />
                                Sign In
                              </Button>
                            </SheetClose>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-white border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} Blogosphere. All rights reserved.</p>
            <p className="mt-2">
              A simple blogging platform built with React, Supabase, and Tailwind CSS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
