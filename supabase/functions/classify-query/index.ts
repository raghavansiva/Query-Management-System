import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClassificationResult {
  category: string;
  priority: string;
  sentiment: string;
  keyPhrases: string[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { queryText } = await req.json();

    if (!queryText || typeof queryText !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Query text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are an expert query classification system. Analyze the user's query and provide:
1. Category: One of [Complaint, Feature Request, Technical Issue, General Inquiry, Billing]
2. Priority: One of [High, Medium, Low]
3. Sentiment: One of [Positive, Neutral, Negative]
4. Key Phrases: Extract 1-3 most relevant keywords or phrases

Rules for classification:
- Complaint: User is expressing dissatisfaction or reporting a problem
- Feature Request: User is requesting new functionality
- Technical Issue: User is experiencing bugs, errors, or technical problems
- General Inquiry: Questions about usage, features, or general information
- Billing: Anything related to payments, subscriptions, or invoicing

- High Priority: Urgent issues, system outages, security concerns, billing problems
- Medium Priority: Feature requests, non-urgent bugs, general complaints
- Low Priority: General inquiries, feature suggestions, positive feedback

- Positive: User is satisfied, praising, or expressing gratitude
- Neutral: Factual inquiries or neutral tone
- Negative: User is dissatisfied, frustrated, or complaining

Return ONLY a JSON object with this exact structure:
{
  "category": "...",
  "priority": "...",
  "sentiment": "...",
  "keyPhrases": ["phrase1", "phrase2", "phrase3"]
}`;

    console.log('Calling Lovable AI for classification...');
    
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
          { role: 'user', content: `Analyze this query: "${queryText}"` }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service payment required. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'AI classification failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;
    
    if (!aiResponse) {
      console.error('No content in AI response:', data);
      return new Response(
        JSON.stringify({ error: 'Invalid AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('AI Response:', aiResponse);

    // Parse the JSON response from AI
    let classification: ClassificationResult;
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
      classification = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse, parseError);
      return new Response(
        JSON.stringify({ error: 'Failed to parse classification result' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(classification),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in classify-query function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});