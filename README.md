# Práctica: agente con OpenRouter y Stitch MCP

Proyecto que conecta el modelo de OpenRouter con las herramientas reales de Stitch mediante MCP. Incluye el system prompt de la práctica y la solicitud de pantalla con usuario, contraseña, botón azul oscuro, registro, recuperación y recordar sesión.

## Ejecutar en Windows

Instala Node.js 20 o posterior (incluye npm). Abre una terminal dentro de esta carpeta:

```powershell
npm install
Copy-Item .env.example .env
notepad .env
npm start
```

Completa `OPENROUTER_API_KEY` con tu clave de https://openrouter.ai/settings/keys y `STITCH_API_KEY` con la clave de la configuración de https://stitch.withgoogle.com/. No compartas estas claves ni las subas a GitHub. El modelo seleccionado debe admitir llamadas a herramientas y tener saldo o acceso disponible.

También puedes cambiar la petición:

```powershell
node agente.js "Crea un proyecto nuevo con una pantalla de acceso para una cafetería"
```

## Qué observar

La consola debe mostrar conexión, herramientas disponibles y las acciones decididas por el modelo. Después consulta `resultados/respuesta.txt` y los identificadores o enlaces devueltos. En Stitch verifica visualmente todos los controles solicitados. `resultados/conversacion.json` conserva la conversación y las respuestas de herramientas para revisar errores. Cada ejecución solicita un proyecto nuevo: no repitas sin revisar el resultado anterior.

## Correcciones respecto al PDF

- Se inicializan dotenv, OpenAI, mensajes y la condición de terminación que faltaban.
- Se configura la URL de OpenRouter.
- Se conecta directamente al endpoint oficial MCP de Stitch por HTTP, en vez de intentar arrancar el SDK como servidor con npx. Se conserva el SDK MCP y la conversión de herramientas a funciones de OpenRouter.
- Se añade la clave de Stitch, necesaria para autenticar sus herramientas.
- Se limita el número de pasos, se notifican errores al modelo y se cierra la conexión.
- La interfaz generada no implementa un sistema real de cuentas o contraseñas.

## Ejecución alternativa sin instalar paquetes

Con Node.js 22 o posterior puedes ejecutar `node ejecutar-directo.mjs` después de configurar `.env`. Esta variante usa fetch y el protocolo JSON-RPC de MCP directamente, conserva el mismo bucle del agente y evita depender de npm. Fue la variante utilizada para la ejecución de esta entrega.

## Validación y evidencias

`npm run check` comprueba la sintaxis. `node --test agente.test.js` prueba el bucle con respuestas simuladas (no genera pantallas ni consume API).

Consulta `INFORME.md`, `resultados-ejecucion.txt` y la carpeta `resultados` para revisar las evidencias de esta entrega. Las claves privadas se excluyen del paquete. La ejecución con SDK requiere instalar las dependencias; la alternativa directa requiere Node.js 22 o posterior.

## Fuentes técnicas

- https://github.com/google-labs-code/stitch-sdk
- https://openrouter.ai/docs/quickstart
- https://github.com/modelcontextprotocol/typescript-sdk
