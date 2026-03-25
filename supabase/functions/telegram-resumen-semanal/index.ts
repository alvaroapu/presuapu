import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendTelegram(chatId: string, botToken: string, text: string) {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    }),
  });
  return res.ok;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get active bot config
    const { data: config } = await supabase
      .from("telegram_config")
      .select("*")
      .eq("activo", true)
      .limit(1)
      .maybeSingle();

    if (!config) {
      return new Response(JSON.stringify({ error: "Bot not configured" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get pending shopping list items
    const { data: items } = await supabase
      .from("lista_compra")
      .select("*")
      .eq("comprado", false)
      .order("ubicacion_nombre")
      .order("producto_nombre");

    // Get all low-stock products (even if not yet in lista_compra)
    const { data: lowStock } = await supabase
      .from("stock_productos")
      .select("*, stock_ubicaciones(nombre)")
      .lte("cantidad", "cantidad_minima");

    // Ensure all low-stock are in the lista
    if (lowStock?.length) {
      for (const p of lowStock) {
        const { data: existing } = await supabase
          .from("lista_compra")
          .select("id")
          .eq("stock_producto_id", p.id)
          .eq("comprado", false)
          .maybeSingle();

        if (!existing) {
          await supabase.from("lista_compra").insert({
            stock_producto_id: p.id,
            producto_nombre: p.nombre,
            cantidad_actual: p.cantidad,
            cantidad_minima: p.cantidad_minima,
            unidad: p.unidad,
            ubicacion_nombre: (p as any).stock_ubicaciones?.nombre || null,
          });
        }
      }
    }

    // Refetch after sync
    const { data: finalItems } = await supabase
      .from("lista_compra")
      .select("*")
      .eq("comprado", false)
      .order("ubicacion_nombre")
      .order("producto_nombre");

    if (!finalItems?.length) {
      await sendTelegram(
        config.chat_id,
        config.bot_token,
        "📋 <b>Resumen semanal de stock</b>\n\n✅ No hay productos pendientes de compra. ¡Todo OK!"
      );
      return new Response(JSON.stringify({ sent: true, items: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build message grouped by ubicacion
    let msg = "📋 <b>LISTA DE COMPRA SEMANAL</b>\n";
    msg += `📅 ${new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}\n\n`;

    let currentUbicacion = "";
    let count = 0;
    for (const item of finalItems) {
      const ub = item.ubicacion_nombre || "Sin ubicacion";
      if (ub !== currentUbicacion) {
        currentUbicacion = ub;
        msg += `\n📍 <b>${ub}</b>\n`;
      }
      count++;
      const urgent = item.cantidad_actual === 0 ? "🔴 " : "⚠️ ";
      msg += `${urgent}${item.producto_nombre} — ${item.cantidad_actual}/${item.cantidad_minima} ${item.unidad}\n`;
    }

    msg += `\n──────────────\n`;
    msg += `Total: <b>${count} productos</b> pendientes de compra\n\n`;
    msg += `Usa /limpiar despues de comprar para resetear la lista.`;

    await sendTelegram(config.chat_id, config.bot_token, msg);

    return new Response(
      JSON.stringify({ sent: true, items: count }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
