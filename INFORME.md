# Práctica: Construyendo un agente con OpenRouter y Stitch MCP

Fecha: 21 de octubre de 2026

## Objetivo
Construir un agente que interprete una solicitud, seleccione herramientas de Stitch mediante OpenRouter y genere una interfaz de inicio de sesión.

## Implementación
Se configuró el cliente de OpenRouter y una conexión autenticada con el servidor MCP de Stitch. El agente obtiene el catálogo de herramientas, lo transforma al formato de funciones y ejecuta un bucle: consulta al modelo, ejecuta la herramienta seleccionada y devuelve su resultado. Ante errores, devuelve el error al modelo para que ajuste la solicitud. Se limita a 15 iteraciones y se conserva la conversación como evidencia.

El archivo agente.js implementa la versión con SDK. ejecutar-directo.mjs utiliza el mismo bucle con fetch y MCP JSON-RPC, y fue utilizado en la ejecución real porque la instalación de paquetes estaba bloqueada por la configuración de red del entorno.

## Requisitos de la interfaz
Usuario, contraseña, botón azul oscuro, registro, recuperación de contraseña y recordar sesión siempre. Se solicitó una tarjeta centrada, fondo claro y diseño adaptable en español. La interfaz no incluye backend de autenticación.

## Resultado real del agente
Proyecto creado con ID: 881812348352171781.
Pantalla de inicio de sesión generada con ID: 893cca00ef0f44b588194174c06d37f8.

Enlaces:
- HTML: https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzA5NzI2NDkwMTE3ZjRmN2ZiODRkYWQwZTkyOTAwZmQ3EgsSBxCvg4LT6wkYAZIBIgoKcHJvamVjdF9pZBIUQhI4ODE4MTIzNDgzNTIxNzE3ODE&filename=&opi=96797242
- Imagen: https://lh3.googleusercontent.com/aida/AEtjO1XIbqylwA01Ewhu6aLrmjm6KIVxRTZ7vrzdN4PIKhLQHSo0-gwwsmCwOmfSArethGDxU7c04QwCr94L5Mdc1q5fQpLeXQeCy6Y5N94b2pEifuj4HQoGHT6n5pJO6JAAekUjrc7dzN0sx4a59SDOSpUAHP32bQ5u_nDENIkDyH7-P90PN4KKgvvuMzqYG-aRWb8kwis77AQsu5UgGgMAJfXwS6ZG8lZCl_2Z4RBavUEzKafwDWSzuk972w

La pantalla está en español, con diseño moderno, adaptable, fondo claro, tarjeta centrada, tipografía legible, botón azul oscuro "Iniciar sesión", opciones "Registrarse", "Olvidé mi contraseña" y casilla "Recordar sesión siempre". ¿Deseas que añada alguna otra pantalla o funcionalidad?

## Evidencias
- resultados-ejecucion.txt: registro real de la consola.
- resultados/conversacion.json: llamadas y respuestas reales de herramientas.
- resultados/respuesta.txt: respuesta final del agente.
- Los archivos pantalla descargados contienen los recursos originales devueltos por Stitch, si estuvieron disponibles.

## Revisión visual
Se abrió y revisó la imagen original devuelta por Stitch. Aparecen usuario o correo, contraseña, enlace de recuperación, casilla de recordar sesión, botón azul oscuro y enlace de registro. El texto generado de acceso biométrico y conexión encriptada es parte del diseño visual y no demuestra funciones de autenticación implementadas. La revisión visual se realizó sobre la captura móvil; no se ejecutó un backend ni se probaron cuentas reales.

## Verificación
Se comprobó la sintaxis de ambos ejecutables y pasaron tres pruebas unitarias del bucle: ejecución de herramientas y devolución del resultado; manejo de JSON inválido; límite de iteraciones. La conexión real devolvió 16 herramientas de Stitch.

## Conclusión
El agente integra la decisión del modelo con herramientas externas y conserva los resultados para revisar su ejecución. Las claves privadas se excluyen de esta entrega.
