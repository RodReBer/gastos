import { SWRConfig } from 'swr'
import { fetcher } from '@/lib/utils/fetcher'

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 5000,
        refreshInterval: 30000,
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        shouldRetryOnError: true,
        keepPreviousData: true,
      }}
    >
      {children}
    </SWRConfig>
  )
}
