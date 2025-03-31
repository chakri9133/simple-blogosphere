
import React from 'react';
import MainLayout from '@/components/MainLayout';
import PostDetail from '@/components/PostDetail';

const PostDetailPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="py-8">
        <PostDetail />
      </div>
    </MainLayout>
  );
};

export default PostDetailPage;
