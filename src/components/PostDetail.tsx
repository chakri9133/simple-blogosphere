
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Comment, Post, supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageSquare, Edit, Trash } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import CommentSection from './CommentSection';

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchPostAndComments = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      // Fetch post with author info
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles(username, email)
        `)
        .eq('id', id)
        .single();

      if (postError) throw postError;
      
      setPost(postData);
      
      // Fetch comments for this post
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select(`
          *,
          author:profiles(username, email)
        `)
        .eq('post_id', id)
        .order('created_at', { ascending: true });
        
      if (commentsError) throw commentsError;
      
      setComments(commentsData || []);
      
      // Check if current user liked this post
      if (user) {
        const { data: likeData } = await supabase
          .from('likes')
          .select('*')
          .eq('post_id', id)
          .eq('user_id', user.id)
          .single();
          
        setIsLiked(!!likeData);
      }
    } catch (error: any) {
      console.error('Error fetching post:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load post',
        variant: 'destructive',
      });
      
      // Redirect to home if post not found
      if (error.code === 'PGRST116') {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostAndComments();
    
    // Set up real-time subscriptions
    if (!id) return;
    
    const commentsSubscription = supabase
      .channel('public:comments')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'comments', filter: `post_id=eq.${id}` }, 
        () => {
          fetchPostAndComments();
        }
      )
      .subscribe();
      
    const postSubscription = supabase
      .channel('public:posts')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'posts', filter: `id=eq.${id}` }, 
        () => {
          fetchPostAndComments();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(commentsSubscription);
      supabase.removeChannel(postSubscription);
    };
  }, [id, user?.id]);

  const handleLike = async () => {
    if (!user || !post) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to like posts',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (isLiked) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
          
        // Update likes count in post
        await supabase
          .from('posts')
          .update({ likes_count: post.likes_count - 1 })
          .eq('id', post.id);
          
        setIsLiked(false);
        setPost({ ...post, likes_count: post.likes_count - 1 });
      } else {
        // Like
        await supabase
          .from('likes')
          .insert({
            post_id: post.id,
            user_id: user.id,
            created_at: new Date().toISOString(),
          });
          
        // Update likes count in post
        await supabase
          .from('posts')
          .update({ likes_count: post.likes_count + 1 })
          .eq('id', post.id);
          
        setIsLiked(true);
        setPost({ ...post, likes_count: post.likes_count + 1 });
      }
    } catch (error: any) {
      console.error('Error liking post:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to like post',
        variant: 'destructive',
      });
    }
  };

  const handleComment = async () => {
    if (!user || !post || !newComment.trim()) return;
    
    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('comments')
        .insert({
          content: newComment,
          post_id: post.id,
          user_id: user.id,
          created_at: new Date().toISOString(),
        });
        
      if (error) throw error;
      
      setNewComment('');
      toast({
        title: 'Comment added',
        description: 'Your comment has been posted successfully',
      });
      
      // Fetch updated comments
      fetchPostAndComments();
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add comment',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!post || !user || user.id !== post.user_id) return;
    
    try {
      // Delete all comments for this post
      await supabase
        .from('comments')
        .delete()
        .eq('post_id', post.id);
        
      // Delete all likes for this post
      await supabase
        .from('likes')
        .delete()
        .eq('post_id', post.id);
        
      // Delete the post
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);
        
      if (error) throw error;
      
      toast({
        title: 'Post deleted',
        description: 'Your post has been deleted successfully',
      });
      
      navigate('/');
    } catch (error: any) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete post',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="blog-container animate-fade-in">
        <div className="flex justify-center items-center h-64">
          <div className="text-blog-primary animate-pulse">Loading post...</div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="blog-container animate-fade-in">
        <Card className="text-center p-8">
          <CardContent>
            <p className="text-lg text-gray-600 mb-4">Post not found</p>
            <Button asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="blog-container animate-fade-in max-w-3xl">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold text-blog-primary mb-4">{post.title}</h1>
          
          {user && user.id === post.user_id && (
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/edit/${post.id}`}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Link>
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your post
                      and remove all associated comments and likes.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
        
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <span className="font-medium">{post.author?.username || 'Anonymous'}</span>
          <span className="mx-2">•</span>
          <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
        </div>
        
        <div className="prose prose-lg max-w-none">
          {/* Render the post content, safely parsing HTML */}
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
        
        <div className="flex items-center mt-8 space-x-4">
          <Button 
            variant={isLiked ? "secondary" : "outline"}
            size="sm" 
            className="flex items-center gap-1"
            onClick={handleLike}
            disabled={!user}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-blog-accent text-blog-accent' : ''}`} />
            <span>{post.likes_count || 0} Likes</span>
          </Button>
          
          <div className="flex items-center gap-1 text-gray-500">
            <MessageSquare className="h-4 w-4" />
            <span>{comments.length} Comments</span>
          </div>
        </div>
      </div>
      
      <Separator className="my-8" />
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Comments</h2>
        
        {user ? (
          <div className="mb-6">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="mb-2"
            />
            <Button 
              onClick={handleComment} 
              disabled={!newComment.trim() || submitting}
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        ) : (
          <Card className="bg-muted mb-6 p-4">
            <CardContent className="p-0 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                You need to sign in to comment
              </p>
              <Button asChild variant="outline" size="sm">
                <Link to="/auth">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        )}
        
        <CommentSection comments={comments} postId={post.id} />
      </div>
    </div>
  );
};

export default PostDetail;
