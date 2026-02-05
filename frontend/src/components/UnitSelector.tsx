/**
 * Unit selector component: renders pill buttons for metric units
 */

interface UnitSelectorProps {
  units: string[]
  selected: string
  onSelect: (unit: string) => void
}

export default function UnitSelector({ units, selected, onSelect }: UnitSelectorProps) {
  return (
    <div className="unit-selector">
      {units.map((unit) => (
        <button
          key={unit}
          className={`unit-button ${selected === unit ? 'active' : ''}`}
          onClick={() => onSelect(unit)}
        >
          {unit}
        </button>
      ))}
    </div>
  )
}
