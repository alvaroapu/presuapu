import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Normalize text for matching: remove accents, lowercase, trim
function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// Find matching product using fuzzy search
async function findProduct(query: string) {
  const normalized = normalize(query);
  const words = normalized.split(/\s+/).filter(Boolean);

  // Get all stock products with their ubicacion
  const { data: productos, error } = await supabase
    .from("stock_productos")
    .select("*, stock_ubicaciones(nombre)")
    .order("nombre");

  if (error || !productos?.length) return null;

  // Score each product based on word matches in nombre + codigo
  let bestMatch = null;
  let bestScore = 0;

  for (const p of productos) {
    const haystack = normalize(`${p.nombre} ${p.codigo || ""}`);
    let score = 0;

    for (const word of words) {
      if (haystack.includes(word)) {
        score += word.length; // longer matches score more
      }
    }

    // Bonus for exact match
    if (haystack === normalized) score += 100;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = p;
    }
  }

  // Require at least some match
  return bestScore >= 3 ? bestMatch : null;
}

// Add product to shopping list if low stock
async function checkAndAddToListaCompra(product: any) {
  if (product.cantidad > product.cantidad_minima && product.cantidad > 0) return;

  // Check if already in active lista
  const { data: existing } = await supabase
    .from("lista_compra")
    .select("id")
    .eq("stock_producto_id", product.id)
    .eq("comprado", false)
    .maybeSingle();

  if (existing) {
    // Update quantity info
    await supabase
      .from("lista_compra")
      .update({ cantidad_actual: product.cantidad })
      .eq("id", existing.id);
    return;
  }

  // Add new entry
  await supabase.from("lista_compra").insert({
    stock_producto_id: product.id,
    producto_nombre: product.nombre,
    cantidad_actual: product.cantidad,
    cantidad_minima: product.cantidad_minima,
    unidad: product.unidad,
    ubicacion_nombre: product.stock_ubicaciones?.nombre || null,
  });
}

// Send message via Telegram
async function sendTelegram(chatId: string, botToken: string, text: string) {
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    }),
  });
}

// Get bot config from DB
async function getBotConfig() {
  const { data } = await supabase
    .from("telegram_config")
    .select("*")
    .eq("activo", true)
    .limit(1)
    .maybeSingle();
  return data;
}

// Handle /stock command - show low stock items
async function handleStockCommand() {
  const { data: low } = await supabase
    .from("stock_productos")
    .select("nombre, codigo, cantidad, cantidad_minima, unidad, stock_ubicaciones(nombre)")
    .lte("cantidad", "cantidad_minima");

  if (!low?.length) return "Todo el stock esta OK. No hay productos bajo minimo.";

  let msg = "<b>Productos bajo minimo:</b>\n\n";
  for (const p of low) {
    const loc = (p as any).stock_ubicaciones?.nombre || "Sin ubicacion";
    msg += `- <b>${p.nombre}</b>${p.codigo ? ` (${p.codigo})` : ""}\n`;
    msg += `  ${p.cantidad} ${p.unidad} (min: ${p.cantidad_minima}) - ${loc}\n\n`;
  }
  return msg;
}

// Handle /lista command - show shopping list
async function handleListaCommand() {
  const { data: items } = await supabase
    .from("lista_compra")
    .select("*")
    .eq("comprado", false)
    .order("created_at");

  if (!items?.length) return "La lista de compra esta vacia.";

  let msg = "<b>Lista de Compra:</b>\n\n";
  for (const item of items) {
    msg += `- <b>${item.producto_nombre}</b>\n`;
    msg += `  Quedan: ${item.cantidad_actual} ${item.unidad} (min: ${item.cantidad_minima})`;
    if (item.ubicacion_nombre) msg += ` - ${item.ubicacion_nombre}`;
    msg += "\n\n";
  }
  return msg;
}

// Handle /help command
function handleHelpCommand() {
  return (
    "<b>Comandos disponibles:</b>\n\n" +
    "<b>Gastar producto:</b>\n" +
    "Escribe el nombre del producto directamente.\n" +
    "Ej: <code>tinta blanca dti</code>\n\n" +
    "Tambien puedes especificar cantidad:\n" +
    "<code>3 tinta blanca dti</code>\n\n" +
    "<b>/stock</b> - Ver productos bajo minimo\n" +
    "<b>/lista</b> - Ver lista de compra\n" +
    "<b>/limpiar</b> - Marcar toda la lista como comprada\n" +
    "<b>/help</b> - Ver esta ayuda"
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // Telegram sends updates with message object
    const message = body.message;
    if (!message?.text || !message?.chat?.id) {
      return new Response("ok", { headers: corsHeaders });
    }

    const chatId = String(message.chat.id);
    const text = message.text.trim();

    // Get bot config
    const config = await getBotConfig();
    if (!config) {
      return new Response("Bot not configured", { status: 200, headers: corsHeaders });
    }

    // Validate chat_id matches configured one
    if (config.chat_id !== chatId) {
      await sendTelegram(chatId, config.bot_token, "No tienes permiso para usar este bot.");
      return new Response("ok", { headers: corsHeaders });
    }

    let reply = "";

    // Handle commands
    if (text.startsWith("/")) {
      const cmd = text.split(" ")[0].toLowerCase().replace(/@.*$/, "");
      switch (cmd) {
        case "/start":
        case "/help":
          reply = handleHelpCommand();
          break;
        case "/stock":
          reply = await handleStockCommand();
          break;
        case "/lista":
          reply = await handleListaCommand();
          break;
        case "/limpiar":
          await supabase
            .from("lista_compra")
            .update({ comprado: true, fecha_compra: new Date().toISOString() })
            .eq("comprado", false);
          reply = "Lista de compra limpiada. Todos los items marcados como comprados.";
          break;
        default:
          reply = "Comando no reconocido. Usa /help para ver los comandos disponibles.";
      }
    } else {
      // Parse product usage: optional quantity + product name
      // e.g. "tinta blanca dti" (qty=1) or "3 tinta blanca dti"
      let qty = 1;
      let productQuery = text;

      const match = text.match(/^(\d+(?:[.,]\d+)?)\s+(.+)/);
      if (match) {
        qty = parseFloat(match[1].replace(",", "."));
        productQuery = match[2];
      }

      const product = await findProduct(productQuery);

      if (!product) {
        reply = `No encontre ningun producto que coincida con "<b>${text}</b>".\n\nRevisa el nombre o usa /stock para ver los productos.`;
      } else {
        // Decrement stock
        const newQty = Math.max(0, product.cantidad - qty);
        await supabase
          .from("stock_productos")
          .update({ cantidad: newQty, updated_at: new Date().toISOString() })
          .eq("id", product.id);

        product.cantidad = newQty;

        // Check if we need to add to shopping list
        await checkAndAddToListaCompra(product);

        const loc = product.stock_ubicaciones?.nombre || "";
        reply = `<b>${product.nombre}</b>${product.codigo ? ` (${product.codigo})` : ""}`;
        if (loc) reply += ` - ${loc}`;
        reply += `\n\nGastado: -${qty} ${product.unidad}`;
        reply += `\nStock actual: <b>${newQty} ${product.unidad}</b>`;

        if (newQty <= product.cantidad_minima) {
          reply += `\n\n⚠️ <b>STOCK BAJO</b> (minimo: ${product.cantidad_minima})`;
          reply += "\nAnadido a la lista de compra.";
        }
        if (newQty === 0) {
          reply += "\n\n🔴 <b>AGOTADO</b>";
        }
      }
    }

    await sendTelegram(chatId, config.bot_token, reply);
    return new Response("ok", { headers: corsHeaders });
  } catch (err) {
    console.error("Error:", err);
    return new Response("error", { status: 200, headers: corsHeaders });
  }
});
