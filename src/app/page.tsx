import { Button } from "@/components/ui/button";
import PostForm from "@/components/post-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import PostsList from "@/components/posts-list";

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  const signOut = async () => {
    'use server';
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    await supabase.auth.signOut();
    return redirect('/login');
  }

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">SNS Scheduler</h1>
        <div className="flex items-center gap-4">
          <span>{user.email}</span>
          <form action={signOut}>
            <Button variant="ghost">Logout</Button>
          </form>
        </div>
      </header>

      <main>
        <PostForm user={user} />
        <PostsList posts={posts ?? []} />
      </main>
    </div>
  );
}
