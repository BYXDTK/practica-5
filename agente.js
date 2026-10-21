import { mkdir, writeFile } from 'node:fs/promises';

const SYSTEM_PROMPT = `Eres un Ingeniero Frontend y Experto en UX/UI.
Tu objetivo es traducir los requerimientos del usuario en interfaces funcionales usando las herramientas de Stitch.
Reglas:
1. Analiza el requerimiento y decide qué herramientas usar.
2. Si una herramienta falla, lee el error, ajusta los parámetros y vuelve a intentarlo.
3. Informa al usuario de tus acciones de forma concisa.
4. Crea el proyecto y la pantalla mediante herramientas reales. No afirmes éxito si fallan.
5. Al terminar, indica el identificador del proyecto, la pantalla y los enlaces que devuelvan las herramientas.
6. El alcance es una interfaz de acceso, no un backend de autenticación. No agregues credenciales reales.`;

const USER_PROMPT = `Crea un proyecto nuevo llamado Acceso - Practica OpenRouter y genera una pantalla de inicio de sesión en español.
Debe recibir usuario y contraseña, tener un botón azul oscuro de Iniciar sesión, las opciones Registrarse y Olvidé mi contraseña, y una casilla Recordar sesión siempre.
Usa un diseño moderno, accesible y adaptable a móvil y escritorio, fondo claro, tarjeta centrada, etiquetas visibles y estados de foco. Incluye mostrar u ocultar contraseña.
Obtén los datos de la pantalla generada y devuelve los enlaces de vista previa y HTML si están disponibles.`;

export async function ejecutarBucle({ openai, mcp, tools, messages, maxSteps, onAction = console.log }) {
  for (let step = 1; step <= maxSteps; step++) {
    const response = await openai.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || 'openai/gpt-4.1-mini',
      messages, tools, max_tokens: 4096, tool_choice: 'auto', parallel_tool_calls: false
    });
    const message = response.choices?.[0]?.message;
    if (!message) throw new Error('OpenRouter no devolvió un mensaje.');
    messages.push(message);
    if (!message.tool_calls?.length) {
      if (!message.content) throw new Error('El modelo terminó sin respuesta.');
      return message.content;
    }
    for (const call of message.tool_calls) {
      if (call.type !== 'function') throw new Error('Tipo de llamada no compatible.');
      onAction(`Paso ${step}: ${call.function.name}`);
      let result;
      try {
        if (!tools.some(t => t.function.name === call.function.name)) throw new Error('Herramienta desconocida.');
        const args = JSON.parse(call.function.arguments || '{}');
        result = await mcp.callTool({ name: call.function.name, arguments: args }, undefined, { timeout: 300000 });
        onAction(result.isError ? 'Stitch devolvió un error; el agente intentará corregirlo.' : 'Herramienta ejecutada.');
      } catch (error) {
        result = { isError: true, content: [{ type: 'text', text: error.message }] };
        onAction('Error comunicado al agente para que ajuste la solicitud.');
      }
      messages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(result) });
    }
  }
  throw new Error(`Se alcanzó el límite de ${maxSteps} pasos. Revisa los resultados antes de repetir para evitar duplicados.`);
}

async function iniciarAgente() {
  await import('dotenv/config');
  const { default: OpenAI } = await import('openai');
  const { Client } = await import('@modelcontextprotocol/sdk/client/index.js');
  const { StreamableHTTPClientTransport } = await import('@modelcontextprotocol/sdk/client/streamableHttp.js');
  for (const key of ['OPENROUTER_API_KEY', 'STITCH_API_KEY']) {
    if (!process.env[key]?.trim()) throw new Error(`Falta ${key}. Copia .env.example a .env y configura la clave localmente.`);
  }
  const maxSteps = Number(process.env.MAX_STEPS || 15);
  if (!Number.isInteger(maxSteps) || maxSteps < 1 || maxSteps > 100) throw new Error('MAX_STEPS debe ser un entero de 1 a 100.');
  const openai = new OpenAI({ baseURL: 'https://openrouter.ai/api/v1', apiKey: process.env.OPENROUTER_API_KEY, timeout: 120000, maxRetries: 1 });
  const mcp = new Client({ name: 'agente-stitch', version: '1.0.0' }, { capabilities: {} });
  const messages = [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: process.argv.slice(2).join(' ') || USER_PROMPT }];
  try {
    console.log('Conectando con Stitch MCP...');
    await mcp.connect(new StreamableHTTPClientTransport(new URL('https://stitch.googleapis.com/mcp'), {
      requestInit: { headers: { 'X-Goog-Api-Key': process.env.STITCH_API_KEY } }
    }));
    const available = [];
    let cursor;
    do {
      const page = await mcp.listTools(cursor ? { cursor } : {});
      available.push(...page.tools);
      cursor = page.nextCursor;
    } while (cursor);
    if (!available.length) throw new Error('Stitch no ofreció herramientas.');
    const tools = available.map(t => ({ type: 'function', function: { name: t.name, description: t.description, parameters: t.inputSchema } }));
    console.log(`Conexión exitosa: ${tools.length} herramientas disponibles.`);
    const result = await ejecutarBucle({ openai, mcp, tools, messages, maxSteps });
    await writeFile('resultados/respuesta.txt', result, 'utf8');
    console.log(`\nAgente: ${result}\n\nConsulta resultados/respuesta.txt`);
  } finally {
    await mkdir('resultados', { recursive: true });
    await writeFile('resultados/conversacion.json', JSON.stringify(messages, null, 2), 'utf8');
    await mcp.close().catch(() => {});
  }
}

if (process.argv[1] && import.meta.url === (await import('node:url')).pathToFileURL(process.argv[1]).href) {
  await mkdir('resultados', { recursive: true });
  iniciarAgente().catch(error => { console.error(`Error: ${error.message}`); process.exitCode = 1; });
}
