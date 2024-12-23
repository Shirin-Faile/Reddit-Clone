'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Params {
  id: string;
}

type Comment = {
  id: string;
  content: string;
  post_id: string;
  user_id: string;
  created_at: string;
  parent_id: string | null;
};

type Post = {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  user_id: string;
  created_at: string;
};

const PostPage = ({ params }: { params: Params }) => {
  const { id } = params;
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentContent, setCommentContent] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchPost();
    fetchComments();
    getSession();
  }, [id]);

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching post:', error.message);
      toast.error('Failed to load post. Please try again.');
    } else {
      setPost(data);
    }
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error.message);
      toast.error('Failed to load comments. Please try again.');
    } else {
      setComments(data || []);
    }
  };

  const getSession = async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
  };

  const addComment = async () => {
    if (!commentContent) {
      toast.error('Please enter a comment.');
      return;
    }

    const { error } = await supabase
      .from('comments')
      .insert([{ content: commentContent, post_id: id, user_id: session?.user?.id, parent_id: null }]);

    if (error) {
      console.error('Error adding comment:', error.message);
      toast.error('Failed to add comment. Please try again.');
    } else {
      toast.success('Comment added successfully!');
      setCommentContent('');
      fetchComments();
    }
  };

  const addReply = async (parentCommentId: string) => {
    if (!replyContent) {
      toast.error('Please enter a reply.');
      return;
    }

    const { error } = await supabase
      .from('comments')
      .insert([{ content: replyContent, post_id: id, user_id: session?.user?.id, parent_id: parentCommentId }]);

    if (error) {
      console.error('Error adding reply:', error.message);
      toast.error('Failed to add reply. Please try again.');
    } else {
      toast.success('Reply added successfully!');
      setReplyContent('');
      setReplyingTo(null);
      fetchComments();
    }
  };

  const deleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Error deleting comment:', error.message);
      toast.error('Failed to delete comment. Please try again.');
    } else {
      toast.success('Comment deleted successfully!');
      setComments(comments.filter((comment) => comment.id !== commentId));
    }
  };

  const renderComments = (comments: Comment[]) => {
    const renderNestedComments = (parentId: string) => {
      return comments
        .filter((comment) => comment.parent_id === parentId)
        .map((nestedComment) => (
          <div key={nestedComment.id} className="ml-6 mt-2">
            <div className="bg-gray-800 p-3 rounded-lg">
              <p className="text-gray-300">{nestedComment.content}</p>
              <p className="text-gray-500 text-sm">Posted by user {nestedComment.user_id}</p>
              <p className="text-gray-600 text-xs">{new Date(nestedComment.created_at).toLocaleString()}</p>
              <button
                onClick={() => setReplyingTo(nestedComment.id)}
                className="text-pink-400 hover:underline mt-2"
              >
                Reply
              </button>
              {session?.user?.id === nestedComment.user_id || session?.user?.id === post?.user_id ? (
                <button
                  onClick={() => deleteComment(nestedComment.id)}
                  className="ml-2 text-red-400 hover:underline"
                >
                  Delete
                </button>
              ) : null}
            </div>
            {replyingTo === nestedComment.id && (
              <div className="mt-2 ml-6">
                <textarea
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-700 text-white"
                  placeholder="Add your reply..."
                  rows={2}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                />
                <button
                  onClick={() => addReply(nestedComment.id)}
                  className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 mt-2"
                >
                  Submit Reply
                </button>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="ml-2 text-red-400 hover:underline"
                >
                  Cancel
                </button>
              </div>
            )}
            {renderNestedComments(nestedComment.id)}
          </div>
        ));
    };

    return comments
      .filter((comment) => !comment.parent_id)
      .map((comment) => (
        <div key={comment.id} className="mb-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-300">{comment.content}</p>
            <p className="text-gray-500 text-sm">Posted by user {comment.user_id}</p>
            <p className="text-gray-600 text-xs">{new Date(comment.created_at).toLocaleString()}</p>
            <button
              onClick={() => setReplyingTo(comment.id)}
              className="text-pink-400 hover:underline mt-2"
            >
              Reply
            </button>
            {session?.user?.id === comment.user_id || session?.user?.id === post?.user_id ? (
              <button
                onClick={() => deleteComment(comment.id)}
                className="ml-2 text-red-400 hover:underline"
              >
                Delete
              </button>
            ) : null}
          </div>
          {replyingTo === comment.id && (
            <div className="mt-2 ml-6">
              <textarea
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-700 text-white"
                placeholder="Add your reply..."
                rows={2}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
              />
              <button
                onClick={() => addReply(comment.id)}
                className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 mt-2"
              >
                Submit Reply
              </button>
              <button
                onClick={() => setReplyingTo(null)}
                className="ml-2 text-red-400 hover:underline"
              >
                Cancel
              </button>
            </div>
          )}
          {renderNestedComments(comment.id)}
        </div>
      ));
  };

  if (!post) return <p>Loading post...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-8 text-white">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push('/')}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg mb-6"
        >
          ← Back to Homepage
        </button>
        <h1 className="text-4xl font-bold mb-6 text-pink-400">{post.title}</h1>
        {post.image_url && (
          <img
            src={post.image_url}
            alt={post.title}
            className="mb-4 rounded-lg shadow-md"
          />
        )}
        <p className="text-gray-300 mb-4">{post.content}</p>
        <p className="text-gray-500 text-sm">Posted by: {post.user_id}</p>
        <p className="text-gray-600 text-xs">Posted on: {new Date(post.created_at).toLocaleString()}</p>
        <hr className="my-8 border-gray-700" />
        <div>
          <h2 className="text-2xl font-bold mb-4 text-pink-400">Comments</h2>
          {comments.length === 0 ? (
            <p className="text-gray-500">No comments yet.</p>
          ) : (
            <div className="space-y-4">{renderComments(comments)}</div>
          )}
        </div>
        {session ? (
          <div className="mt-8">
            <textarea
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-gray-800 text-white mb-4"
              placeholder="Add your comment..."
              rows={4}
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
            />
            <button
              onClick={addComment}
              className="bg-pink-500 text-white p-3 rounded-lg hover:bg-pink-600 mt-4 w-full"
            >
              Submit Comment
            </button>
          </div>
        ) : (
          <p className="text-gray-500 mt-8">You must be logged in to comment.</p>
        )}
      </div>
    </div>
  );
};

export default PostPage;
