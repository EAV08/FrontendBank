import { useId, type InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta: string
  error?: string
}

export function Campo({ etiqueta, error, ...resto }: Props) {
  const id = useId()
  return (
    <div className="campo">
      <label htmlFor={id}>{etiqueta}</label>
      <input id={id} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-e` : undefined} {...resto} />
      {error && (
        <span id={`${id}-e`} className="error-campo">
          {error}
        </span>
      )}
    </div>
  )
}
