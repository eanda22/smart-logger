/**
 * ExerciseSearchInput: Search input for filtering exercises
 */

interface ExerciseSearchInputProps {
  value: string
  onChange: (value: string) => void
}

export default function ExerciseSearchInput({ value, onChange }: ExerciseSearchInputProps) {
  return (
    <div className="exercise-search-wrapper">
      <input
        type="text"
        className="exercise-search-input"
        placeholder="Search exercises..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus
      />
      {value && (
        <button
          className="exercise-search-clear"
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  )
}
