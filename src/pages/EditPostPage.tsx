
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/MainLayout';
import PostForm from '@/components/PostForm';

const EditPostPage: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-blog-primary animate-pulse">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <MainLayout>
      <div className="py-8">
        <PostForm isEditing />
      </div>
    </MainLayout>
  );
};

export default EditPostPage;
