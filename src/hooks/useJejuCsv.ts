import { useEffect, useState } from 'react'
import type { JejuFieldCropSlim } from '../jeju/jejuFieldCropModel'
import { loadJejuFieldCropSample } from '../jeju/loadJejuSampleCsv'

export function useJejuCsv() {
  const [rows, setRows] = useState<JejuFieldCropSlim[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    loadJejuFieldCropSample()
      .then((data) => {
        if (!cancelled) setRows(data)
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : String(e))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { rows, loading, error }
}
