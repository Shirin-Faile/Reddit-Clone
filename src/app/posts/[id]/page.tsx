'use client';
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Session } from "@supabase/supabase-js";

interface Params {
  id: string;
}

type Comment = {
  id: string;
  content: string;
  post_id: string;
  user_id: string;
  created_at: string;
};

type Post = {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
};

const PostPage = ({ params }: { params: Params }) => {
  const { id } = params;
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentContent, setCommentContent] = useState('');
  const [session, setSession] = useState<Session | null>(null);

  
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [updatedContent, setUpdatedContent] = useState<string>('');

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
      .insert([{ content: commentContent, post_id: id, user_id: session?.user?.id }]);

    if (error) {
      console.error('Error adding comment:', error.message);
    } else {
      setCommentContent('');
      fetchComments();
    }
  };

  
  const updateComment = async (commentId: string) => {
    if (!updatedContent) {
      alert('Please enter updated content');
      return;
    }

    const { error } = await supabase
      .from('comments')
      .update({ content: updatedContent })
      .eq('id', commentId)
      .eq('user_id', session?.user?.id);

    if (error) {
      console.error('Error updating comment:', error.message);
    } else {
      setEditingCommentId(null);
      setUpdatedContent('');
      fetchComments();
    }
  };

  
  const deleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', session?.user?.id);

    if (error) {
      console.error('Error deleting comment:', error.message);
    } else {
      fetchComments();
    }
  };

  if (!post) return <p>Loading post...</p>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-6">{post.title}</h1>
      <p className="text-gray-700 mb-4">{post.content}</p>
      <p className="text-gray-500 text-sm">Posted by: {post.user_id}</p>
      <p className="text-gray-400 text-xs">Posted on: {new Date(post.created_at).toLocaleString()}</p>

      <hr className="my-8" />

      <div>
        <h2 className="text-2xl font-bold mb-4">Comments</h2>
        {comments.length === 0 ? (
          <p className="text-gray-500">No comments yet.</p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-white p-4 rounded shadow">
                {editingCommentId === comment.id ? (
  
                  <div>
                    <textarea
                      className="w-full p-2 border rounded mb-2"
                      value={updatedContent}
                      onChange={(e) => setUpdatedContent(e.target.value)}
                    />
                    <button
                      onClick={() => updateComment(comment.id)}
                      className="bg-green-500 text-white p-2 rounded hover:bg-green-600 mr-2"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditingCommentId(null)}
                      className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-700">{comment.content}</p>
                    <p className="text-gray-500 text-sm">Posted by user {comment.user_id}</p>
                    <p className="text-gray-400 text-xs">Posted on: {new Date(comment.created_at).toLocaleString()}</p>

                    {session?.user?.id === comment.user_id && (
                      <div className="mt-2">
                        <button
                          onClick={() => {
                            setEditingCommentId(comment.id);
                            setUpdatedContent(comment.content);
                          }}
                          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteComment(comment.id)}
                          className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
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
        </div>
      ) : (
        <p className="text-gray-500 mt-8">You must be logged in to comment.</p>
      )}
    </div>
  );
};

export default PostPage;

