import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface CheckoutRequest {
  plan_id?: string
  organization_plan_id?: string
  team_size?: number
  tokens?: number
  success_url: string
  cancel_url: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    })

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from JWT
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { plan_id, organization_plan_id, team_size, tokens, success_url, cancel_url }: CheckoutRequest = await req.json()

    // Get or create Stripe customer
    const { data: userData } = await supabaseClient
      .from('users')
      .select('stripe_customer_id, email, name')
      .eq('id', user.id)
      .single()

    let customerId = userData?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userData?.email || user.email,
        name: userData?.name || user.user_metadata?.name,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      
      customerId = customer.id
      
      // Update user with Stripe customer ID
      await supabaseClient
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    let sessionConfig: any = {
      customer: customerId,
      success_url,
      cancel_url,
      mode: 'subscription',
      metadata: {
        user_id: user.id,
      },
    }

    if (plan_id) {
      // Individual plan subscription
      const { data: plan } = await supabaseClient
        .from('plans')
        .select('stripe_price_id, name')
        .eq('id', plan_id)
        .single()

      if (!plan?.stripe_price_id) {
        return new Response(JSON.stringify({ error: 'Plan not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      sessionConfig.line_items = [{
        price: plan.stripe_price_id,
        quantity: 1,
      }]
      sessionConfig.metadata.plan_id = plan_id
      
    } else if (organization_plan_id && team_size) {
      // Organization plan subscription
      const { data: orgPlan } = await supabaseClient
        .from('organization_plans')
        .select('stripe_price_id, name')
        .eq('id', organization_plan_id)
        .single()

      if (!orgPlan?.stripe_price_id) {
        return new Response(JSON.stringify({ error: 'Organization plan not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      sessionConfig.line_items = [{
        price: orgPlan.stripe_price_id,
        quantity: team_size,
      }]
      sessionConfig.metadata.organization_plan_id = organization_plan_id
      sessionConfig.metadata.team_size = team_size.toString()
      
    } else if (tokens) {
      // One-time token purchase
      const tokenPrice = tokens * 0.000012 // €12 per million tokens
      
      sessionConfig.mode = 'payment'
      sessionConfig.line_items = [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `${tokens.toLocaleString()} Tokens PromptHub`,
            description: `Tokens adicionales para tu cuenta PromptHub`,
          },
          unit_amount: Math.round(tokenPrice * 100), // Convert to cents
        },
        quantity: 1,
      }]
      sessionConfig.metadata.tokens = tokens.toString()
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    return new Response(JSON.stringify({
      checkout_url: session.url,
      session_id: session.id,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Function Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})