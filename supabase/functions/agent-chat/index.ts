import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { messages, fileTree } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Processing agent request with', messages.length, 'messages');

    // System prompt for the AI agent
    const systemPrompt = `You are an expert AI coding agent similar to Replit Agent. You help users build software by:

1. UNDERSTANDING intent from natural language
2. PLANNING the implementation steps
3. WRITING code in the appropriate files
4. DEBUGGING issues when they arise
5. ARCHITECTING solutions with best practices

Current project context:
${fileTree}

When you need to perform actions:
- To create a new file, describe it clearly with the path and initial content
- To update existing files, specify the file path and the new content
- Keep code clean, well-commented, and following best practices
- Explain your reasoning before making changes

You can work with JavaScript, TypeScript, Python, HTML, CSS, and more.

Be conversational, helpful, and proactive. Ask clarifying questions when needed.`;

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
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    console.log('Agent response generated successfully');

    // Parse actions from the response (future enhancement for structured outputs)
    const actions: any[] = [];

    return new Response(
      JSON.stringify({
        message: assistantMessage,
        actions: actions,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in agent-chat:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
