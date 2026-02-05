/**
 * Exercise autocomplete input with dropdown suggestions
 */

import { useState } from 'react'
import { Exercise } from '../api/types'

interface ExerciseAutocompleteProps {
  exercises: Exercise[]
  existingExercises: string[]
  onSelect: (name: string) => void
  placeholder?: string
}

export default function ExerciseAutocomplete({
  exercises,
  existingExercises,
  onSelect,
  placeholder = 'Add exercise...',
}: ExerciseAutocompleteProps) {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Filter exercises by input and exclude existing ones
  const suggestions = exercises.filter((ex) => {
    const matchesInput = ex.name.toLowerCase().includes(inputValue.toLowerCase())
    const notInList = !existingExercises.includes(ex.name)
    return matchesInput && notInList && inputValue.length > 0
  })

  const handleSelect = (exerciseName: string) => {
    onSelect(exerciseName)
    setInputValue('')
    setShowSuggestions(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      handleSelect(suggestions[0].name)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  return (
    <div className="autocomplete-wrapper">
      <div className="form-group">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setShowSuggestions(true)
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div id="autocomplete-suggestions">
          {suggestions.map((exercise) => (
            <div
              key={exercise.id}
              className="suggestion-item"
              onClick={() => handleSelect(exercise.name)}
            >
              {exercise.name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
