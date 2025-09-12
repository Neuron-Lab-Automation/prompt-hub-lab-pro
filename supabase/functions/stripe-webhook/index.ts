import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
})

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()
  
  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
    )

    console.log('Webhook event:', event.type)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id
        
        if (!userId) {
          console.error('No user_id in session metadata')
          break
        }

        if (session.metadata?.plan_id) {
          // Individual plan subscription
          await supabaseClient
            .from('users')
            .update({ 
              plan_id: session.metadata.plan_id,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId)

          // Send welcome email
          await supabaseClient.functions.invoke('send-email', {
            body: {
              to: session.customer_details?.email,
              template_id: 'welcome_template_id',
              variables: {
                user_name: session.customer_details?.name || 'Usuario',
                plan_name: session.metadata.plan_id,
                user_email: session.customer_details?.email,
              }
            }
          })

        } else if (session.metadata?.organization_plan_id) {
          // Organization subscription
          const teamSize = parseInt(session.metadata.team_size || '2')
          
          // Create organization
          const { data: organization } = await supabaseClient
            .from('organizations')
            .insert({
              name: `Organización de ${session.customer_details?.name}`,
              owner_id: userId,
              plan_id: session.metadata.organization_plan_id,
              team_size: teamSize,
              monthly_cost: (session.amount_total || 0) / 100,
              tokens_included: teamSize * 2000000, // 2M tokens per user
              stripe_subscription_id: session.subscription as string,
            })
            .select()
            .single()

          if (organization) {
            // Add owner as organization member
            await supabaseClient
              .from('organization_members')
              .insert({
                organization_id: organization.id,
                user_id: userId,
                role: 'owner',
              })
          }

        } else if (session.metadata?.tokens) {
          // Token purchase
          const tokens = parseInt(session.metadata.tokens)
          
          // Add tokens to user account
          await supabaseClient.rpc('add_user_tokens', {
            p_user_id: userId,
            p_tokens: tokens
          })

          // Send payment confirmation email
          await supabaseClient.functions.invoke('send-email', {
            body: {
              to: session.customer_details?.email,
              template_id: 'payment_confirmation_template_id',
              variables: {
                user_name: session.customer_details?.name || 'Usuario',
                amount: `€${(session.amount_total || 0) / 100}`,
                tokens_purchased: tokens.toLocaleString(),
                transaction_id: session.payment_intent as string,
              }
            }
          })
        }

        // Log audit event
        await supabaseClient
          .from('audit_logs')
          .insert({
            user_id: userId,
            action: 'PAYMENT_COMPLETED',
            resource_type: 'payment',
            resource_id: session.id,
            details: {
              amount: session.amount_total,
              currency: session.currency,
              payment_method: session.payment_method_types?.[0],
              metadata: session.metadata,
            }
          })

        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Update organization or user subscription status
        if (subscription.metadata?.organization_id) {
          await supabaseClient
            .from('organizations')
            .update({ 
              active: subscription.status === 'active',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', subscription.id)
        }
        
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        
        // Handle failed payment - could send notification email
        console.log('Payment failed for customer:', invoice.customer)
        
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: 'Webhook error' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})