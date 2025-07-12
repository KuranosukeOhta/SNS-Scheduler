// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { TwitterApi } from 'npm:twitter-api-v2'

serve(async (req) => {
  // More robust security check
  const CRON_SECRET = Deno.env.get('CRON_SECRET')
  if (!CRON_SECRET) {
    console.error('CRON_SECRET environment variable is not set.')
    return new Response('Internal Server Error: Service is not configured.', {
      status: 500,
    })
  }

  const authHeader = req.headers.get('Authorization')
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    console.warn(`Unauthorized access attempt with header: ${authHeader}`)
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    // Use the service_role key to bypass RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const now = new Date().toISOString()

    // 1. Get posts to be published
    console.log(`Searching for posts with post_at < ${now}`)
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .lt('post_at', now)
      .eq('is_posted', false)

    if (postsError) {
      console.error('Error fetching posts:', postsError)
      return new Response(`Error fetching posts: ${postsError.message}`, {
        status: 500,
      })
    }

    console.log(`Found ${posts ? posts.length : 0} posts to publish.`)
    if (!posts || posts.length === 0) {
      return new Response('No posts to publish', { status: 200 })
    }

    // 2. Process each post
    for (const post of posts) {
      const appKey = Deno.env.get('TWITTER_API_KEY')!
      const appSecret = Deno.env.get('TWITTER_API_SECRET')!
      const accessToken = Deno.env.get('TWITTER_ACCESS_TOKEN')!
      const accessSecret = Deno.env.get('TWITTER_ACCESS_TOKEN_SECRET')!

      const userTwitterClient = new TwitterApi({
        appKey,
        appSecret,
        accessToken,
        accessSecret,
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
