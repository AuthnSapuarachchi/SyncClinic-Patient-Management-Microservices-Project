export default function StatusToast({ message, isError, onClose }) {
  if (!message) {
    return null
  }

  return (
    <div className="fixed right-4 top-4 z-60 w-[calc(100%-2rem)] max-w-sm">
      <div
        className={`rounded-lg border px-4 py-3 text-sm shadow-2xl backdrop-blur ${
          isError
            ? 'border-rose-400/50 bg-rose-950/95 text-rose-100'
            : 'border-emerald-400/50 bg-emerald-950/95 text-emerald-100'
        }`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-bold">{isError ? 'Action failed' : 'Success'}</p>
            <p className="mt-1">{message}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-white/10 px-2 py-1 text-xs font-semibold text-white/80 transition hover:bg-white/10"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
