---
name: angular16-rediseno-visual-branding
description: Redisenar visualmente un frontend existente en Angular 16 con enfoque UX/UI profesional, priorizando claridad, jerarquia, fluidez y branding (especialmente desde frontend/src/assets/branding/header.png) sin alterar logica, servicios, rutas, contratos API ni comportamiento funcional. Usar cuando se pida modernizar la interfaz, mejorar legibilidad o rehacer composicion visual manteniendo intacto el funcionamiento actual.
---

# Angular 16 Rediseno Visual Branding

## Mision
Pensar primero como disenador profesional de interfaces y experiencia de usuario, y recien despues como implementador tecnico.
Priorizar simplicidad, claridad, legibilidad y fluidez visual por encima de la cantidad de codigo.

## Restricciones Innegociables
- No cambiar logica de negocio.
- No cambiar servicios, llamadas HTTP, endpoints ni contratos API.
- No cambiar guards, rutas ni flujos funcionales.
- No cambiar el comportamiento funcional de formularios.
- Minimizar cambios en TypeScript; tocar TS solo para soporte visual estrictamente necesario.
- Si se toca TS, justificar explicitamente por que fue imprescindible y confirmar que no altero comportamiento.

## Referencias de Branding Obligatorias
- Usar `frontend/src/assets/branding/header.png` como referencia primaria de identidad visual.
- Revisar tambien cualquier otro asset disponible en `frontend/src/assets/branding/`.
- Extraer de los assets: paleta, tono, contraste, atmosfera y estilo compositivo.
- Disenar a partir del branding; no insertar imagenes decorativas sin proposito visual claro.

## Direccion Visual Objetivo
- Construir una interfaz moderna, limpia, suave, profesional, intuitiva y facil de leer.
- Mantener una atmosfera luminosa con identidad basada en azules, celestes y tonos claros.
- Evitar UI fragmentada en modulos rigidos.
- Lograr continuidad visual entre header, zona principal e instrucciones.

## Anti-Patrones Prohibidos (Efecto "Tetris")
- No apilar muchas cards como estructura principal.
- No crear secciones duras separadas como dashboard rigido.
- No usar cajas dentro de cajas para organizar contenido.
- No encajonar texto en rectangulos multiples.
- No resolver instrucciones como tres bloques pesados.

## Composicion Obligatoria
1. Header superior breve y liviano.
- Incluir nombre de la aplicacion.
- Incluir una breve descripcion de seguridad, privacidad o confianza.
- Incluir un mensaje corto y directo sobre tratamiento seguro/privado de datos.
- Permitir apoyo visual de branding usando `frontend/src/assets/branding/header.png` sin convertir el header en hero gigante.

2. Zona principal centrada con maxima prioridad visual.
- Colocar en el centro el area para soltar o seleccionar archivo.
- Hacer de esta zona el foco principal de toda la pantalla.
- Integrarla de forma natural al layout sin rodearla de cajas innecesarias.

3. Instrucciones debajo, ligeras y claras.
- Mostrar exactamente estas tres instrucciones:
- `1. Subir PDF`
- `2. Controlar y comparar con el PDF original`
- `3. Descargar`
- Presentarlas como secuencia simple e integrada, no como tres tarjetas rigidas.

## Criterios de Implementacion
- Priorizar cambios en HTML.
- Priorizar cambios en CSS/SCSS.
- Priorizar ajustes en assets y copy visual.
- Priorizar estructura y ritmo del layout.
- Evitar cambios de logica.
- Mantener los bindings existentes, eventos y contratos de componentes.

## Flujo de Trabajo Obligatorio
1. Auditar visual actual antes de editar.
- Detectar problemas de jerarquia visual, espaciado, legibilidad, claridad y fluidez.

2. Definir sistema visual base.
- Definir tipografia, escala de espaciado, estilos de foco y jerarquia.
- Definir variables de color y superficie alineadas al branding.

3. Ejecutar rediseno visual.
- Reorganizar composicion para continuidad visual.
- Reducir ruido, bordes duros y bloques pesados.
- Dar protagonismo al dropzone central.

4. Verificar integridad funcional.
- Confirmar que rutas, flujos, formularios, servicios y llamadas permanecen intactos.
- Confirmar que cualquier cambio TS fue minimo y solo visual.

5. Revisar claridad y usabilidad final.
- Validar lectura rapida, escaneo simple y comprension inmediata.
- Validar version desktop y mobile.

## Guia de Copy
- Usar titulos claros y cortos.
- Usar frases breves y directas.
- Evitar parrafos largos.
- Evitar exceso de marketing.
- Evitar subtitulos redundantes.
- Escribir para comprension inmediata.

## Definition of Done
- La pagina se percibe claramente redisenada.
- El resultado se ve mas moderno y profesional.
- La experiencia es mas simple de entender y usar.
- El diseno se siente continuo, no fragmentado.
- No aparece efecto "tetris" ni abuso de cards/cajas.
- El dropzone central es el foco visual principal.
- El header comunica branding y seguridad en forma breve.
- Las instrucciones debajo se entienden de inmediato.
- La funcionalidad original permanece intacta.

## Reporte Final Obligatorio
Al finalizar, informar siempre:
1. Que archivos visuales se modificaron.
2. Que decisiones de diseno se tomaron.
3. Como mejoro la claridad y la usabilidad.
4. Como se evito el efecto "tetris".
5. Como se mantuvo intacta la funcionalidad.
