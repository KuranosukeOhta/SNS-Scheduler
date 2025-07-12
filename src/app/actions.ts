'use server';

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function deletePost(postId: number) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('posts')
    .delete()
    .match({ id: postId });

  if (error) {
    console.error('Error deleting post:', error);
    return { error: '投稿の削除に失敗しました。' };
  }

  revalidatePath('/'); // ホームページのキャッシュをクリアして再生成
  return { success: '投稿を削除しました。' };
} 