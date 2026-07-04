interface ResourceDisplayProps {
  amount: number
}

/** Muestra el recurso en crudo. El formato K/M/B llega en MVP-10 (core/numbers.ts). */
export function ResourceDisplay({ amount }: ResourceDisplayProps) {
  return <p>{amount}</p>
}
