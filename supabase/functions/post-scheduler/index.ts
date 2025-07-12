// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { TwitterApi } from 'npm:twitter-api-v2'

const CRON_SECRET = Deno.env.get('CRON_SECRET')

serve(async (req) => {
  const authHeader = req.headers.get('Authorization')
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    )

    const now = new Date().toISOString()

    // 1. Get posts to be published
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .lt('post_at', now)
      .eq('is_posted', false)

    if (postsError) throw postsError

    if (!posts || posts.length === 0) {
      return new Response('No posts to publish', { status: 200 })
    }

    // 2. Process each post
    for (const post of posts) {
      // TODO: Get user's Twitter tokens from a secure table based on post.user_id
      // For now, we'll use environment variables as placeholders
      const userTwitterClient = new TwitterApi({
        appKey: Deno.env.get('TWITTER_API_KEY')!,
        appSecret: Deno.env.get('TWITTER_API_SECRET')!,
        accessToken: Deno.env.get('TWITTER_ACCESS_TOKEN')!,
        accessSecret: Deno.env.get('TWITTER_ACCESS_TOKEN_SECRET')!,
      });

      // 3. Post tweet
      try {
        await userTwitterClient.v2.tweet(post.content);

        // 4. Mark post as published
        const { error: updateError } = await supabase
          .from('posts')
          .update({ is_posted: true })
          .eq('id', post.id)

        if (updateError) {
          console.error(`Failed to update post ${post.id}:`, updateError)
        } else {
          console.log(`Successfully posted and updated post ${post.id}`)
        }

      } catch (tweetError) {
        console.error(`Failed to tweet for post ${post.id}:`, tweetError)
        // Optionally, handle failed tweets, e.g., by marking them as 'failed'
      }
    }

    return new Response('Processed posts successfully', { status: 200 })

  } catch (error) {
    console.error('An unexpected error occurred:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/post-scheduler' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
