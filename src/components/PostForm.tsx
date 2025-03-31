
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Post, supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type PostFormProps = {
  isEditing?: boolean;
};

const PostForm: React.FC<PostFormProps> = ({ isEditing = false }) => {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPost = async () => {
      if (!isEditing || !id || !user) return;
      
      try {
        setInitialLoading(true);
        
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        // Check if user is the author
        if (data.user_id !== user.id) {
          toast({
            title: 'Access denied',
            description: 'You can only edit your own posts',
            variant: 'destructive',
          });
          navigate('/');
          return;
        }
        
        setTitle(data.title);
        setContent(data.content);
      } catch (error: any) {
        console.error('Error fetching post:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load post',
          variant: 'destructive',
        });
        navigate('/');
      } finally {
        setInitialLoading(false);
      }
    };
    
    fetchPost();
  }, [id, isEditing, navigate, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to publish posts',
        variant: 'destructive',
      });
      return;
    }
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: 'Missing content',
        description: 'Please provide both title and content',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setLoading(true);
      
      if (isEditing && id) {
        // Update existing post
        const { error } = await supabase
          .from('posts')
          .update({
            title: title.trim(),
            content: content.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        toast({
          title: 'Post updated',
          description: 'Your post has been updated successfully',
        });
        
        navigate(`/post/${id}`);
      } else {
        // Create new post
        const { data, error } = await supabase
          .from('posts')
          .insert({
            title: title.trim(),
            content: content.trim(),
            user_id: user.id,
            created_at: new Date().toISOString(),
            likes_count: 0,
          })
          .select();
          
        if (error) throw error;
        
        toast({
          title: 'Post published',
          description: 'Your post has been published successfully',
        });
        
        navigate(`/post/${data[0].id}`);
      }
    } catch (error: any) {
      console.error('Error saving post:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save post',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="blog-container animate-fade-in">
        <div className="flex justify-center items-center h-64">
          <div className="text-blog-primary animate-pulse">Loading post...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-container animate-fade-in max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Post' : 'Create New Post'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a descriptive title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                Content
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post content here..."
                className="min-h-[300px]"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(isEditing && id ? `/post/${id}` : '/')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : isEditing ? 'Update Post' : 'Publish Post'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostForm;
