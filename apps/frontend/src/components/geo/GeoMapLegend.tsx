export function GeoMapLegend({ hasMissingPoints = false }: { hasMissingPoints?: boolean }) {
  return (
    <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-4">
      <div className="flex items-center gap-2"><span className="h-4 w-4 rounded-full bg-cyan-600 ring-2 ring-white" />Parada con coordenadas</div>
      <div className="flex items-center gap-2"><span className="h-5 w-5 rounded-full bg-slate-950 ring-2 ring-cyan-300" />Parada seleccionada</div>
      <div className="flex items-center gap-2"><span className="h-1 w-10 rounded bg-cyan-500" />Segmento lineal</div>
      {hasMissingPoints ? <div className="flex items-center gap-2"><span className="h-4 w-4 rounded-full bg-amber-400" />Punto sin coordenadas</div> : null}
    </div>
  )
}
