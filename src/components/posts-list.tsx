'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/types/supabase";
import { format } from "date-fns";
import { deletePost } from "@/app/actions";
import { useState } from "react";

interface PostsListProps {
  posts: Tables<'posts'>[];
}

export default function PostsList({ posts }: PostsListProps) {
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const handleDelete = async (postId: number) => {
    if (!confirm('本当にこの投稿を削除しますか？')) {
      return;
    }
    setIsDeleting(postId);
    await deletePost(postId);
    setIsDeleting(null);
  };

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-8">
        まだ投稿はありません。
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-8">
      <h2 className="text-xl font-semibold">投稿履歴</h2>
      {posts.map((post) => (
        <Card key={post.id}>
          <CardHeader>
            <CardTitle className="text-lg">予約日時: {format(new Date(post.post_at), 'yyyy/MM/dd HH:mm')}</CardTitle>
            <CardDescription>作成日: {format(new Date(post.created_at), 'yyyy/MM/dd')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{post.content}</p>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline">編集</Button>
            <Button 
              variant="destructive"
              onClick={() => handleDelete(post.id)}
              disabled={isDeleting === post.id}
            >
              {isDeleting === post.id ? '削除中...' : '削除'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 