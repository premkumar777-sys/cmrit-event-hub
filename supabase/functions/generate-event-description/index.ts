import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, category, department } = await req.json();
    
    if (!title) {
      return new Response(
        JSON.stringify({ error: 'Event title is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      throw new Error('AI service not configured');
    }

    const systemPrompt = `You are an expert event copywriter for CMRIT (CMR Institute of Technology) Hyderabad. 
Generate engaging, professional event descriptions for college events.
Keep descriptions between 100-150 words, highlighting:
- What attendees will learn/experience
- Key benefits of attending
- Who should attend
- Any exciting aspects of the event

Be enthusiastic but professional. Use active voice.`;

    const userPrompt = `Generate an engaging event description for:
Title: ${title}
${category ? `Category: ${category}` : ''}
${department ? `Department: ${department}` : ''}

Write a compelling description that will attract students to register.`;

    console.log('Calling Lovable AI for event description generation');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service credits exhausted. Please try again later.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error('Failed to generate description');
    }

    const data = await response.json();
    const description = data.choices?.[0]?.message?.content;

    if (!description) {
      throw new Error('No description generated');
    }

    console.log('Successfully generated event description');

    return new Response(
      JSON.stringify({ description }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating description:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to generate description' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
