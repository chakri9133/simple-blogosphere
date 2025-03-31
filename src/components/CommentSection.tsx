
import React, { useState } from 'react';
import { Comment, supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Trash, Edit } from 'lucide-react';

type CommentSectionProps = {
  comments: Comment[];
  postId: string;
};

const CommentSection: React.FC<CommentSectionProps> = ({ comments, postId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditText(comment.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const saveEdit = async (commentId: string) => {
    if (!editText.trim()) return;
    
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('comments')
        .update({ content: editText })
        .eq('id', commentId);
        
      if (error) throw error;
      
      toast({
        title: 'Comment updated',
        description: 'Your comment has been updated successfully',
      });
      
      cancelEdit();
    } catch (error: any) {
      console.error('Error updating comment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update comment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);
        
      if (error) throw error;
      
      toast({
        title: 'Comment deleted',
        description: 'Your comment has been deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete comment',
        variant: 'destructive',
      });
    }
  };

  if (comments.length === 0) {
    return <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>;
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <Card key={comment.id} className="overflow-hidden">
          <CardContent className="p-4">
            {editingId === comment.id ? (
              <Textarea 
                value={editText} 
                onChange={(e) => setEditText(e.target.value)}
                className="mb-2"
              />
            ) : (
              <p className="text-gray-800">{comment.content}</p>
            )}
          </CardContent>
          
          <CardFooter className="px-4 py-2 bg-gray-50 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              <span className="font-medium">{comment.author?.username || 'Anonymous'}</span>
              <span className="mx-1">•</span>
              <span>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
            </div>
            
            {user && user.id === comment.user_id && (
              <div className="flex space-x-2">
                {editingId === comment.id ? (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={cancelEdit}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => saveEdit(comment.id)}
                      disabled={isSubmitting || !editText.trim()}
                    >
                      Save
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit(comment)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteComment(comment.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </>
                )}
              </div>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default CommentSection;
