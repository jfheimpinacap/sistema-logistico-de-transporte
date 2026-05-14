import { useCallback, useEffect, useMemo, useState } from 'react'
import { MasterDataForm } from '../../components/masters/MasterDataForm'
import { MasterDataTable } from '../../components/masters/MasterDataTable'
import { MasterDataToolbar } from '../../components/masters/MasterDataToolbar'
import { useAuth } from '../../hooks/useAuth'
import { useAppRouter } from '../../routes/AppRoutes'
import {
  createMasterData,
  deleteMasterData,
  getReadableApiError,
  listMasterData,
  updateMasterData,
} from '../../services/masterDataService'
import type {
  ActiveFilter,
  BaseMasterRecord,
  MasterEndpoint,
  MasterEntityMap,
  MasterFormField,
  MasterPayload,
  MasterId,
  MasterTableColumn,
  SelectOption,
} from '../../types/masterData'

type OptionLoader = {
  endpoint: MasterEndpoint
  field: string
  getLabel: (record: MasterEntityMap[MasterEndpoint]) => string
}

type MasterCrudPageProps<T extends MasterEndpoint> = {
  endpoint: T
  title: string
  subtitle: string
  formTitle: string
  columns: MasterTableColumn<MasterEntityMap[T]>[]
  fields: MasterFormField<Record<string, unknown>>[]
  optionLoaders?: OptionLoader[]
}

type FormValues = Record<string, unknown>

function toSelectOptions(records: MasterEntityMap[MasterEndpoint][], getLabel: OptionLoader['getLabel']): SelectOption[] {
  return records.map((record) => ({
    value: record.id,
    label: getLabel(record),
  }))
}

function normalizePayload(values: FormValues) {
  return Object.entries(values).reduce<FormValues>((payload, [key, value]) => {
    if (typeof value === 'string') {
      const trimmed = value.trim()
      payload[key] = trimmed === '' ? null : trimmed
      return payload
    }

    payload[key] = value
    return payload
  }, {})
}

export function MasterCrudPage<T extends MasterEndpoint>({
  endpoint,
  title,
  subtitle,
  formTitle,
  columns,
  fields,
  optionLoaders = [],
}: MasterCrudPageProps<T>) {
  const { accessToken, logout } = useAuth()
  const { navigate } = useAppRouter()
  const [records, setRecords] = useState<MasterEntityMap[T][]>([])
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('active')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [editingRecord, setEditingRecord] = useState<MasterEntityMap[T] | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [optionsByField, setOptionsByField] = useState<Record<string, SelectOption[]>>({})

  const handleAuthError = useCallback((message: string) => {
    if (message.includes('sesión expiró')) {
      logout()
      navigate('/login', true)
    }
  }, [logout, navigate])

  const loadRecords = useCallback(async () => {
    if (!accessToken) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await listMasterData(endpoint, { token: accessToken, search, activeFilter })
      setRecords(data)
    } catch (err) {
      const message = getReadableApiError(err)
      setError(message)
      handleAuthError(message)
    } finally {
      setIsLoading(false)
    }
  }, [accessToken, activeFilter, endpoint, handleAuthError, search])

  const loadOptions = useCallback(async () => {
    if (!accessToken || optionLoaders.length === 0) {
      return
    }

    try {
      const entries = await Promise.all(
        optionLoaders.map(async (loader) => {
          const data = await listMasterData(loader.endpoint, { token: accessToken, activeFilter: 'active' })
          return [loader.field, toSelectOptions(data, loader.getLabel)] as const
        }),
      )
      setOptionsByField(Object.fromEntries(entries))
    } catch (err) {
      const message = getReadableApiError(err)
      setError(message)
      handleAuthError(message)
    }
  }, [accessToken, handleAuthError, optionLoaders])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadRecords()
    }, 250)

    return () => window.clearTimeout(timeout)
  }, [loadRecords])

  useEffect(() => {
    void loadOptions()
  }, [loadOptions])

  const resolvedFields = useMemo(
    () => fields.map((field) => ({ ...field, options: optionsByField[field.name] ?? field.options })),
    [fields, optionsByField],
  )

  const optionWarnings = optionLoaders
    .filter((loader) => (optionsByField[loader.field]?.length ?? 0) === 0)
    .map((loader) => loader.field)

  function openCreateForm() {
    setEditingRecord(null)
    setFormError(null)
    setIsFormOpen(true)
  }

  function openEditForm(record: MasterEntityMap[T]) {
    setEditingRecord(record)
    setFormError(null)
    setIsFormOpen(true)
  }

  async function handleSubmit(values: FormValues) {
    if (!accessToken) {
      setFormError('No hay sesión activa. Vuelve al login para continuar.')
      return
    }

    setIsSaving(true)
    setFormError(null)

    try {
      const payload = normalizePayload(values) as MasterPayload<T>
      if (editingRecord) {
        await updateMasterData({ endpoint, id: editingRecord.id as MasterId, payload, token: accessToken })
      } else {
        await createMasterData({ endpoint, payload, token: accessToken })
      }
      setIsFormOpen(false)
      setEditingRecord(null)
      await loadRecords()
      await loadOptions()
    } catch (err) {
      const message = getReadableApiError(err)
      setFormError(message)
      handleAuthError(message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(record: MasterEntityMap[T]) {
    if (!accessToken) {
      setError('No hay sesión activa. Vuelve al login para continuar.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await deleteMasterData({ endpoint, id: record.id, token: accessToken })
      await loadRecords()
    } catch (err) {
      const message = getReadableApiError(err)
      setError(message)
      handleAuthError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <MasterDataToolbar
        title={title}
        subtitle={subtitle}
        search={search}
        activeFilter={activeFilter}
        onSearchChange={setSearch}
        onActiveFilterChange={setActiveFilter}
        onCreate={openCreateForm}
      />

      {optionWarnings.length > 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          No hay opciones activas cargadas para: {optionWarnings.join(', ')}. Puedes completar los campos opcionales o crear primero los maestros relacionados.
        </div>
      ) : null}

      <MasterDataTable
        columns={columns as MasterTableColumn<BaseMasterRecord>[]}
        data={records as BaseMasterRecord[]}
        isLoading={isLoading}
        error={error}
        onEdit={(record) => openEditForm(record as MasterEntityMap[T])}
        onDelete={(record) => void handleDelete(record as MasterEntityMap[T])}
      />

      {isFormOpen ? (
        <MasterDataForm
          title={editingRecord ? `Editar ${formTitle}` : `Nuevo ${formTitle}`}
          fields={resolvedFields}
          initialValues={editingRecord}
          isSaving={isSaving}
          error={formError}
          onSubmit={handleSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      ) : null}
    </div>
  )
}
