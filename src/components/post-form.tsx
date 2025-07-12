'use client'

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { CalendarIcon } from "@radix-ui/react-icons";
import { User } from "@supabase/supabase-js";
import { format } from "date-fns";
import { useState } from "react";

interface PostFormProps {
  user: User;
}

export default function PostForm({ user }: PostFormProps) {
  const [postContent, setPostContent] = useState('');
  const [postAt, setPostAt] = useState<Date | undefined>(new Date());
  const supabase = createClient();

  const handlePost = async () => {
    if (!user || !postContent || !postAt) {
      alert("投稿内容と投稿日時を入力してください。");
      return;
    }

    const { error } = await supabase.from('posts').insert([
      { content: postContent, post_at: postAt.toISOString(), user_id: user.id }
    ]);

    if (error) {
      alert('投稿に失敗しました: ' + error.message);
    } else {
      alert('投稿が予約されました！');
      setPostContent('');
      setPostAt(new Date());
      // TODO: 投稿履歴をリフレッシュする
      window.location.reload(); // 簡単なリフレッシュ方法
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="grid gap-4">
        <Textarea
          placeholder="投稿内容を入力してください..."
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          rows={5}
        />
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-[240px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {postAt ? format(postAt, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={postAt}
                onSelect={setPostAt}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button onClick={handlePost}>予約投稿</Button>
        </div>
      </div>
    </div>
  )
} 