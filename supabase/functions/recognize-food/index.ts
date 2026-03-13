import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MEAL_NAMES = [
  "Fufu with Light Soup", "Waakye", "Jollof Rice", "Banku with Tilapia",
  "Kenkey with Fried Fish", "Kontomire Stew", "Omo Tuo", "Groundnut Soup",
  "Palm Nut Soup", "Kelewele", "Ampesi with Kontomire", "Hausa Koko",
  "Koose", "Tuo Zaafi", "Aboboi", "Fried Rice", "Chicken Light Soup",
  "Gari Fortor", "Red Red", "Bofrot", "Nkatie Cake", "Tom Brown",
  "Sobolo", "Milo/Cocoa Drink", "Roasted Plantain", "Tatale",
  "Garden Egg Stew", "Okra Soup", "Fante Fante", "Yam with Palava Sauce",
  "Akple with Fetri Detsi", "Rice Water", "Koko with Bread",
  "Tubani", "Shito"
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { image } = await req.json();
    if (!image) throw new Error("No image provided");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a Ghanaian food recognition expert. Analyze the image and identify the Ghanaian dish shown. 
You MUST respond with ONLY a JSON object in this exact format, nothing else:
{"meal_name": "<exact name from list>", "confidence": <0.0-1.0>, "description": "<brief description>"}

The meal_name MUST be one of these exact names: ${MEAL_NAMES.join(", ")}

If you cannot identify the food or it's not a Ghanaian dish, respond with:
{"meal_name": "unknown", "confidence": 0, "description": "Could not identify this as a Ghanaian dish"}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Identify this Ghanaian dish:" },
              { type: "image_url", image_url: { url: image } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response format");
    
    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("recognize-food error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
