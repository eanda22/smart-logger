/**
 * CategoryFilter: Filter exercises by category type with counts
 */

interface CategoryFilterProps {
  categoryCounts: Record<string, number>
  selected: string[]
  onChange: (selected: string[]) => void
}

export default function CategoryFilter({
  categoryCounts,
  selected,
  onChange,
}: CategoryFilterProps) {
  const categories = Object.keys(categoryCounts).sort()

  const handleToggle = (category: string) => {
    if (selected.includes(category)) {
      onChange(selected.filter((c) => c !== category))
    } else {
      onChange([...selected, category])
    }
  }

  const handleSelectAll = () => {
    if (selected.length === categories.length) {
      onChange([])
    } else {
      onChange(categories)
    }
  }

  return (
    <div className="category-filter">
      <button
        className={`category-filter-btn category-filter-all ${
          selected.length === categories.length ? 'active' : ''
        }`}
        onClick={handleSelectAll}
      >
        All ({Object.values(categoryCounts).reduce((a, b) => a + b, 0)})
      </button>

      {categories.map((category) => (
        <button
          key={category}
          className={`category-filter-btn ${selected.includes(category) ? 'active' : ''}`}
          onClick={() => handleToggle(category)}
        >
          {category.charAt(0).toUpperCase() + category.slice(1)} ({categoryCounts[category]})
        </button>
      ))}
    </div>
  )
}
