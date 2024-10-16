import React, { useState } from "react"
import "./filters.css"

const Filters = ({
  category,
  setCategory,
  categories,
  setCategories,
  modality,
  setModality,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  location,
  setLocation,
  setLoading,
}) => {
  const [isCategoryVisible, setCategoryVisible] = useState(false)
  const [isModalityVisible, setModalityVisible] = useState(false)
  const [isDateVisible, setDateVisible] = useState(false)
  const [isLocationVisible, setLocationVisible] = useState(false)

  const handleToggle = (section) => {
    switch (section) {
      case "category":
        setCategoryVisible(!isCategoryVisible)
        break
      case "modality":
        setModalityVisible(!isModalityVisible)
        break
      case "date":
        setDateVisible(!isDateVisible)
        break
      case "location":
        setLocationVisible(!isLocationVisible)
        break
      default:
        break
    }
  }

  const handleCategoryChange = (key, id) => {
    setCategories((prevCategories) => ({
      ...prevCategories,
      [key]: {
        ...prevCategories[key], // Mantener el resto de los datos de la categoría
        isChecked: !prevCategories[key].isChecked, // Invertir el valor de isChecked
      },
    }))
    setCategory(id)
  }

  const handleModalityChange = (newModality) => {
    setModality(newModality)
  }

  const handleFilter = () => {
    setLoading(true)
  }

  const handleClearFilters = () => {
    Object.keys(categories).forEach((key) => {
      setCategories((prevCategories) => ({
        ...prevCategories,
        [key]: {
          ...prevCategories[key],
          isChecked: false,
        },
      }))
    })
    setCategory("")
    setModality("")
    setStartDate("")
    setEndDate("")
    setLocation("")
    handleFilter()
  }

  return (
    <aside className="filter-section">
      <h2 className="text-2xl font-bold">Filtros</h2>
      {/* Categoría */}
      <div className="filter-box">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Categoría</h3>
          <button onClick={() => handleToggle("category")}>{isCategoryVisible ? "▼" : "◀"}</button>
        </div>
        {isCategoryVisible && (
          <ul>
            {Object.entries(categories).map(([key, category]) => (
              <li key={category.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={category.isChecked}
                    onChange={() => handleCategoryChange(key, category.id)}
                  />
                  {category.name}
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modalidad */}
      <div className="filter-box">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Modalidad</h3>
          <button onClick={() => handleToggle("modality")}>{isModalityVisible ? "▼" : "◀"}</button>
        </div>
        {isModalityVisible && (
          <ul>
            <li>
              <label>
                <input
                  type="radio"
                  name="modalidad"
                  value="In-Person"
                  checked={modality === "In-Person"}
                  onChange={() => handleModalityChange("In-Person")}
                />{" "}
                Presencial
              </label>
            </li>
            <li>
              <label>
                <input
                  type="radio"
                  name="modalidad"
                  value="Virtual"
                  checked={modality === "Virtual"}
                  onChange={() => handleModalityChange("Virtual")}
                />{" "}
                Virtual
              </label>
            </li>
            <li>
              <label>
                <input
                  type="radio"
                  name="modalidad"
                  value="Hybrid"
                  checked={modality === "Hybrid"}
                  onChange={() => handleModalityChange("Hybrid")}
                />{" "}
                Híbrido
              </label>
            </li>
          </ul>
        )}
      </div>

      {/* Fecha */}
      {/* <div className="filter-box">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Fecha</h3>
          <button onClick={() => handleToggle("date")}>{isDateVisible ? "▼" : "◀"}</button>
        </div>
        {isDateVisible && (
          <div className="date-filters">
            <label className="block">
              <span>Inicio:</span>
              <input
                className="rounded-md"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>
            <label className="block mt-2">
              <span>Fin:</span>
              <input className="rounded-md" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </label>
          </div>
        )}
      </div> */}

      {/* Ubicación */}
      <div className="filter-box">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Ubicación</h3>
          <button onClick={() => handleToggle("location")}>{isLocationVisible ? "▼" : "◀"}</button>
        </div>
        {isLocationVisible && (
          <input
            type="text"
            placeholder="Ubicación"
            className="rounded-md"
            onChange={(e) => setLocation(e.target.value)}
          />
        )}
      </div>

      <button className="apply-filters rounded-md" onClick={() => handleFilter()}>
        Aplicar Filtros
      </button>
      <button className="clear-filters rounded-md" onClick={() => handleClearFilters()}>
        Limpiar Filtros
      </button>
    </aside>
  )
}

export default Filters
