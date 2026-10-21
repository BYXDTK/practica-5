import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ejecutarBucle } from './agente.js';

const tools = [{type:'function',function:{name:'create_project'}}];
const call = args => ({role:'assistant',content:null,tool_calls:[{id:'t1',type:'function',function:{name:'create_project',arguments:args}}]});
test('ejecuta herramientas y devuelve su resultado al modelo', async () => {
  const messages = [];
  let n=0;
  const openai={chat:{completions:{create:async()=>({choices:[{message:n++ === 0 ? call('{"title":"Acceso"}') : {role:'assistant',content:'Proyecto creado'}}]})}}};
  const mcp={callTool:async args=>{assert.equal(args.arguments.title,'Acceso');return {content:[{type:'text',text:'id: 123'}]};}};
  assert.equal(await ejecutarBucle({openai,mcp,tools,messages,maxSteps:3,onAction:()=>{}}),'Proyecto creado');
  assert.match(messages[1].content,/123/);
  assert.equal(messages[1].tool_call_id,'t1');
});
test('envía errores de argumentos al modelo y permite corregirlos', async()=>{
  const messages=[]; let n=0;
  const openai={chat:{completions:{create:async()=>({choices:[{message:n++===0?call('invalido'):{role:'assistant',content:'Error identificado'}}]})}}};
  await ejecutarBucle({openai,mcp:{},tools,messages,maxSteps:2,onAction:()=>{}});
  assert.equal(JSON.parse(messages[1].content).isError,true);
});
test('detiene un bucle que no termina',async()=>{
  const openai={chat:{completions:{create:async()=>({choices:[{message:call('{}')}]})}}};
  await assert.rejects(ejecutarBucle({openai,mcp:{callTool:async()=>({isError:true})},tools,messages:[],maxSteps:1,onAction:()=>{}}),/límite/);
});
