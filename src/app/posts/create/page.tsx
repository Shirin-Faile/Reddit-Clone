import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/router";

const CreatePost = () => {
    const [session, setSession] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const session = supabase.auth.session();
        if (!session) {
            router.push('/login');
        } else {
            setSession(session);
        }
    }, []);

    if (!session) return <p>Loading...</p>;

    return (
        <div>
            <h1>Create a New Post</h1>
        </div>
    );
};

export default CreatePost;