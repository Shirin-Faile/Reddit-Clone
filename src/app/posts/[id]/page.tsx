'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

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
      alert('Please enter a comment');
      return;
    }

    const { error } = await supabase
      .from('comments')
      .insert([{ content: commentContent, post_id: id, user_id: session?.user?.id, parent_id: null }]);

    if (error) {
      console.error('Error adding comment:', error.message);
    } else {
      setCommentContent('');
      fetchComments();
    }
  };

  const addReply = async (parentCommentId: string) => {
    if (!replyContent) {
      alert('Please enter a reply');
      return;
    }

    const { error } = await supabase
      .from('comments')
      .insert([{ content: replyContent, post_id: id, user_id: session?.user?.id, parent_id: parentCommentId }]);

    if (error) {
      console.error('Error adding reply:', error.message);
    } else {
      setReplyContent('');
      setReplyingTo(null);
      fetchComments();
    }
  };

  const renderComments = (comments: Comment[]) => {
    const renderNestedComments = (parentId: string) => {
      return comments
        .filter((comment) => comment.parent_id === parentId)
        .map((nestedComment) => (
          <div key={nestedComment.id} className="ml-6 pl-4 border-l">
            <p>{nestedComment.content}</p>
            <p>Posted by user {nestedComment.user_id}</p>
            <p>{new Date(nestedComment.created_at).toLocaleString()}</p>
            <button onClick={() => setReplyingTo(nestedComment.id)} className="text-blue-500 hover:underline">Reply</button>
            {renderNestedComments(nestedComment.id)}
          </div>
        ));
    };

    return comments
      .filter((comment) => !comment.parent_id)
      .map((comment) => (
        <div key={comment.id} className="mb-4">
          <p>{comment.content}</p>
          <p>Posted by user {comment.user_id}</p>
          <p>{new Date(comment.created_at).toLocaleString()}</p>
          <button onClick={() => setReplyingTo(comment.id)} className="text-blue-500 hover:underline">Reply</button>
          {renderNestedComments(comment.id)}
        </div>
      ));
  };

  if (!post) return <p>Loading post...</p>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-6">{post.title}</h1>
      
      
      {post.image_url && (
        <img
          src={post.image_url}
          alt={post.title}
          className="mb-4 rounded-lg shadow-md"
        />
      )}

      <p className="text-gray-700 mb-4">{post.content}</p>
      <p className="text-gray-500 text-sm">Posted by: {post.user_id}</p>
      <p className="text-gray-400 text-xs">Posted on: {new Date(post.created_at).toLocaleString()}</p>

      <hr className="my-8" />

      <div>
        <h2 className="text-2xl font-bold mb-4">Comments</h2>
        {comments.length === 0 ? (
          <p className="text-gray-500">No comments yet.</p>
        ) : (
          <div className="space-y-4">{renderComments(comments)}</div>
        )}
      </div>

      {session ? (
        <div className="mt-8">
          <textarea
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add your comment..."
            rows={4}
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
          />
          <button
            onClick={addComment}
            className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 mt-4 w-full"
          >
            Submit Comment
          </button>

          {replyingTo && (
            <div className="mt-4">
              <textarea
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Add your reply..."
                rows={4}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
              />
              <button
                onClick={() => addReply(replyingTo)}
                className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 mt-4 w-full"
              >
                Submit Reply
              </button>
              <button onClick={() => setReplyingTo(null)} className="mt-2 text-red-500">
                Cancel Reply
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-500 mt-8">You must be logged in to comment.</p>
      )}
    </div>
  );
};

export default PostPage;




