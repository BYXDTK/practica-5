// Alternativa sin instalar dependencias: Node.js 22 o posterior.
import { loadEnvFile } from 'node:process';
import { mkdir, writeFile } from 'node:fs/promises';
import { ejecutarBucle } from './agente.js';
loadEnvFile('.env');
for (const key of ['STITCH_API_KEY', 'OPENROUTER_API_KEY']) if (!process.env[key]) throw new Error(`Falta ${key}`);
let id = 0;
async function rpc(method, params = {}) {
  const response = await fetch('https://stitch.googleapis.com/mcp', {
    method:'POST', headers:{'Content-Type':'application/json',Accept:'application/json, text/event-stream','X-Goog-Api-Key':process.env.STITCH_API_KEY},
    body:JSON.stringify({jsonrpc:'2.0',id:++id,method,params}),signal:AbortSignal.timeout(300000)
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Stitch HTTP ${response.status}: ${text}`);
  const result = response.headers.get('content-type')?.includes('text/event-stream')
    ? text.split('\n').filter(l=>l.startsWith('data:')).map(l=>JSON.parse(l.slice(5))).findLast(r=>r.id===id)
    : JSON.parse(text);
  if (result?.error) throw new Error(JSON.stringify(result.error));
  if (!result?.result) throw new Error('Respuesta MCP vacía');
  return result.result;
}
const messages=[{role:'system',content:'Eres un Ingeniero Frontend y Experto en UX/UI. Analiza el requerimiento y decide qué herramientas de Stitch usar. Si una herramienta falla, lee el error, ajusta los parámetros y vuelve a intentarlo. Informa tus acciones de forma concisa. Crea el proyecto y genera realmente la pantalla. Al terminar devuelve el ID del proyecto, de la pantalla y enlaces HTML e imagen disponibles. No afirmes éxito ante errores.'},{role:'user',content:'Crea un proyecto nuevo llamado Practica OpenRouter - Inicio de sesion y genera una pantalla de inicio de sesión en español, moderna y adaptable. Debe recibir un usuario y password, tener botón azul oscuro Iniciar sesión, las opciones Registrarse, Olvidé mi contraseña y una casilla Recordar sesión siempre. Usa fondo claro, tarjeta centrada, tipografía legible y etiquetas visibles. Obtén los detalles de la pantalla para devolver enlaces al HTML y captura.'}];
const openai={chat:{completions:{create:async body=>{
  const r=await fetch('https://openrouter.ai/api/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.OPENROUTER_API_KEY}`},body:JSON.stringify(body),signal:AbortSignal.timeout(120000)});
  const data=await r.json();if(!r.ok||data.error) throw new Error(`OpenRouter HTTP ${r.status}: ${JSON.stringify(data.error)}`);return data;
}}}};
await mkdir('resultados',{recursive:true});
try {
  console.log('Conectando con Stitch MCP...');
  await rpc('initialize',{protocolVersion:'2025-03-26',capabilities:{},clientInfo:{name:'agente-stitch',version:'1.0.0'}});
  const all=[];let cursor;do {const p=await rpc('tools/list',cursor?{cursor}:{});all.push(...p.tools);cursor=p.nextCursor;}while(cursor);
  console.log(`Conexión exitosa: ${all.length} herramientas.`);
  const tools=all.map(t=>({type:'function',function:{name:t.name,description:t.description,parameters:t.inputSchema}}));
  const result=await ejecutarBucle({openai,mcp:{callTool:args=>rpc('tools/call',args)},tools,messages,maxSteps:15});
  await writeFile('resultados/respuesta.txt',result);console.log(result);
} catch(e) {console.error(e.message);process.exitCode=1;}
finally {await writeFile('resultados/conversacion.json',JSON.stringify(messages,null,2));}
