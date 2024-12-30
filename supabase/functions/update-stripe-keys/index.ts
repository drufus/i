import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface RequestBody {
  keys: {
    publicKey: string
    secretKey: string
    webhookSecret: string
  }
  environment: 'development' | 'production'
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables')
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    const { keys, environment } = await req.json() as RequestBody

    if (!keys || !environment) {
      throw new Error('Missing required parameters')
    }

    const { error } = await supabaseClient.rpc('update_api_keys', {
      p_environment: environment,
      p_public_key: keys.publicKey,
      p_secret_key: keys.secretKey,
      p_webhook_secret: keys.webhookSecret
    })

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error updating API keys:', error)

    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.details || 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})