import { Button } from "@/components/ui/button";
import PostForm from "@/components/post-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const signOut = async () => {
    'use server';
    const supabase = createClient();
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
        {/* TODO: Add posts list component here */}
      </main>
    </div>
  );
}
