import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

serve(async (req) => {

  const { pin } = await req.json()

  const REAL_PIN = Deno.env.get("EVENT_PIN")

  if (pin === REAL_PIN) {
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { "Content-Type": "application/json" } }
    )
  }

  return new Response(
    JSON.stringify({ success: false }),
    { headers: { "Content-Type": "application/json" }, status: 401 }
  )

})