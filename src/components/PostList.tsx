
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Post, supabase } from '@/lib/supabase';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageSquare } from 'lucide-react';

const PostList = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles(username, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setPosts(data || []);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Error fetching posts',
        description: error.message || 'Failed to load posts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    
    // Set up real-time subscription for posts
    const postsSubscription = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, (payload) => {
        console.log('Change received!', payload);
        fetchPosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(postsSubscription);
    };
  }, []);

  const toggleLike = async (postId: string) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to like posts',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Check if user already liked this post
      const { data: existingLike } = await supabase
        .from('likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Unlike: delete the like
        await supabase
          .from('likes')
          .delete()
          .eq('id', existingLike.id);

        // Decrement the likes_count in posts
        await supabase
          .from('posts')
          .update({ likes_count: posts.find(p => p.id === postId)?.likes_count - 1 || 0 })
          .eq('id', postId);
      } else {
        // Like: insert a new like
        await supabase
          .from('likes')
          .insert({
            post_id: postId,
            user_id: user.id,
            created_at: new Date().toISOString(),
          });

        // Increment the likes_count in posts
        await supabase
          .from('posts')
          .update({ likes_count: posts.find(p => p.id === postId)?.likes_count + 1 || 1 })
          .eq('id', postId);
      }

      // Refresh posts after like/unlike
      fetchPosts();
    } catch (error: any) {
      console.error('Error toggling like:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to like/unlike post',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="blog-container animate-fade-in">
        <div className="flex justify-center items-center h-64">
          <div className="text-blog-primary animate-pulse">Loading posts...</div>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="blog-container animate-fade-in">
        <Card className="text-center p-8">
          <CardContent>
            <p className="text-lg text-gray-600 mb-4">No posts yet</p>
            {user && (
              <Button asChild>
                <Link to="/create">Create Your First Post</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="blog-container animate-fade-in">
      <div className="grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <Card key={post.id} className="blog-card h-full flex flex-col">
            <CardHeader>
              <CardTitle className="line-clamp-2 hover:text-blog-accent">
                <Link to={`/post/${post.id}`}>{post.title}</Link>
              </CardTitle>
              <div className="flex items-center text-sm text-gray-500 mt-2">
                <span className="font-medium">
                  {post.author?.username || 'Anonymous'}
                </span>
                <span className="mx-2">•</span>
                <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="line-clamp-3 text-gray-600">
                {post.content.replace(/<[^>]*>/g, '').substring(0, 200)}
                {post.content.length > 200 ? '...' : ''}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between pt-2 border-t">
              <div className="flex space-x-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-1 text-gray-500 hover:text-blog-accent"
                  onClick={() => toggleLike(post.id)}
                >
                  <Heart className="h-4 w-4" />
                  <span>{post.likes_count || 0}</span>
                </Button>
                <Link to={`/post/${post.id}`} className="flex items-center gap-1 text-gray-500 hover:text-blog-accent">
                  <MessageSquare className="h-4 w-4" />
                  <span>Comments</span>
                </Link>
              </div>
              <Link to={`/post/${post.id}`} className="text-sm text-blog-accent hover:underline">
                Read more
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PostList;
