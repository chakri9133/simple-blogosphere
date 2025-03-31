
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/MainLayout';
import PostList from '@/components/PostList';

const Index = () => {
  const { user, loading } = useAuth();

  return (
    <MainLayout>
      <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blog-primary mb-2">Welcome to Blogosphere</h1>
          <p className="text-xl text-gray-600">
            Read, write, and connect with others through engaging blog posts
          </p>
        </div>
        <PostList />
      </div>
    </MainLayout>
  );
};

export default Index;
