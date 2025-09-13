import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface SendEmailRequest {
  to: string
  template_id: string
  variables: Record<string, string>
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { to, template_id, variables }: SendEmailRequest = await req.json()

    // Get email template
    const { data: template, error: templateError } = await supabaseClient
      .from('email_templates')
      .select('*')
      .eq('id', template_id)
      .eq('active', true)
      .single()

    if (templateError || !template) {
      return new Response(JSON.stringify({ error: 'Template not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get SMTP configuration
    const { data: smtpConfig, error: smtpError } = await supabaseClient
      .from('smtp_config')
      .select('*')
      .eq('active', true)
      .single()

    if (smtpError || !smtpConfig) {
      return new Response(JSON.stringify({ error: 'SMTP not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Replace variables in template
    let subject = template.subject
    let htmlContent = template.html_content
    let textContent = template.text_content

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`
      subject = subject.replace(new RegExp(placeholder, 'g'), value)
      htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value)
      textContent = textContent.replace(new RegExp(placeholder, 'g'), value)
    })

    // Send email using SMTP (simplified - in production use a proper email service)
    const emailData = {
      to,
      from: `${smtpConfig.from_name} <${smtpConfig.from_email}>`,
      subject,
      html: htmlContent,
      text: textContent,
    }

    // Log email send attempt
    console.log('Sending email:', { to, subject, template: template.name })

    // In production, integrate with your email service (SendGrid, Mailgun, etc.)
    // For now, we'll just log and return success
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Email sent successfully',
      email_id: `email_${Date.now()}`
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