# Checklist QA Rápida

Ejecutar esta lista después de preparar el entorno con `py start.py prepare` y levantarlo con `py start.py dev`.

- [ ] Login demo con `demo` / `demo1234`.
- [ ] Dashboard carga correctamente.
- [ ] Sidebar muestra módulos principales.
- [ ] HealthPage responde.
- [ ] Maestros: listar, crear, editar y desactivar un registro de prueba.
- [ ] Encomiendas: listar, crear/editar y cambiar estado.
- [ ] Bultos: crear bulto asociado a una encomienda.
- [ ] Tracking: ver eventos de una encomienda.
- [ ] Rutas: crear ruta, agregar parada y asignar encomienda.
- [ ] Rutas: cambiar estado, recalcular resumen y reordenar paradas.
- [ ] Modo conductor: abrir `/driver`, seleccionar ruta y operar parada.
- [ ] Evidencias: crear, aceptar y rechazar evidencia.
- [ ] Incidencias: crear, resolver y cancelar incidencia.
- [ ] Documentos: crear documento interno/provisorio y agregar línea.
- [ ] Documentos: generar desde ruta o encomienda.
- [ ] Documentos: emitir, anular o archivar según caso.
- [ ] Vista imprimible de documentos abre y permite imprimir desde navegador.
- [ ] Advertencia SII visible en documentos internos/provisorios.
- [ ] Reportes: `/reports` carga resumen.
- [ ] Reportes específicos cargan métricas y filtros.
- [ ] CSV reportes descarga archivos compatibles con Excel.
- [ ] CSV listados operativos descarga en encomiendas, rutas, incidencias y documentos.
- [ ] Logout funciona.
- [ ] Sin errores críticos visibles en consola del navegador.
- [ ] Límites del MVP claros: no SII real, no facturación, no GPS en tiempo real, no mapas, no optimización, no offline, no PDF real, no XLSX real.
