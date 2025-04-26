// Script para la página de resultados

// Variables para el estado actual
let allRunners = []
let currentTab = "results"
let currentCategoryFilter = "general"
let currentGenderFilter = "all"
let searchTerm = ""
let raceResults = []

// Configuración de paginación para resultados
const resultsPerPage = 10
let currentResultsPage = 1

// Configuración de paginación para participantes
const participantsPerPage = 12
let currentParticipantsPage = 1

// Función para inicializar la página
document.addEventListener("DOMContentLoaded", () => {
  // Cargar datos de corredores desde el archivo JSON
  loadRunnersData()

  // Inicializar pestañas
  initTabs()

  // Inicializar filtros
  initFilters()

  // Inicializar búsqueda
  initSearch()

  // Inicializar paginación
  initPagination()

  // Inicializar exportación
  initExport()

  // Inicializar modal
  initModal()

  // Inicializar dropdown de categorías
  initCategoryDropdown()
})

// Función para cargar los datos de corredores desde el archivo JSON
function loadRunnersData() {
  fetch("../data/runners.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al cargar los datos de corredores")
      }
      return response.json()
    })
    .then((data) => {
      allRunners = data
      raceResults = [...allRunners]

      // Actualizar la interfaz
      updateCategoryLabels()
      filterResults()
    })
    .catch((error) => {
      console.error("Error:", error)
      showError("No se pudieron cargar los datos de corredores. " + error.message)
    })
}

// Función para inicializar las pestañas
function initTabs() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault()
      const tabId = tab.getAttribute("data-tab")
      switchTab(tabId)
    })
  })
}

// Función para inicializar el dropdown de categorías
function initCategoryDropdown() {
  // Manejar clics en los elementos del dropdown
  document.querySelectorAll(".dropdown-content a[data-category]").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault()
      const category = item.getAttribute("data-category")

      // Actualizar el filtro de categoría
      currentCategoryFilter = category

      // Actualizar el texto mostrado
      const dropdownBtn = item.closest(".dropdown").querySelector(".dropdown-btn h2 span")
      if (dropdownBtn) {
        dropdownBtn.textContent = getCategoryDisplayName(category)
      }

      // Aplicar filtros
      filterResults()
    })
  })
}

// Función para obtener el nombre de visualización de la categoría
function getCategoryDisplayName(category) {
  switch (category) {
    case "juvenil":
      return "JUVENIL"
    case "abierta":
      return "ABIERTA"
    case "master":
      return "MÁSTER"
    default:
      return "GENERAL"
    
  }
}

// Función para cambiar entre pestañas
function switchTab(tabId) {
  // Ocultar todas las pestañas
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("active")
  })

  // Mostrar la pestaña seleccionada
  document.getElementById(`${tabId}-section`).classList.add("active")

  // Actualizar clases activas en los botones de navegación
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.remove("active")
  })
  document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add("active")

  // Actualizar la variable de estado
  currentTab = tabId

  // Cargar el contenido correspondiente
  if (tabId === "results") {
    displayResults(currentResultsPage)
  } else if (tabId === "participants") {
    displayParticipants(currentParticipantsPage)
  } else if (tabId === "gallery") {
    // La galería se maneja en gallery.js
  }
}

// Función para inicializar los filtros
function initFilters() {
  // Filtros de género
  document.querySelectorAll(".filter-btn[data-gender]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn[data-gender]").forEach((b) => {
        b.classList.remove("active")
      })
      btn.classList.add("active")
      currentGenderFilter = btn.getAttribute("data-gender")
      filterResults()
    })
  })
}

// Función para inicializar la búsqueda
function initSearch() {
  const searchInput = document.getElementById("search-input")
  searchInput.addEventListener("input", () => {
    searchTerm = searchInput.value.trim()
    filterResults()
  })

  document.querySelector(".search-btn").addEventListener("click", () => {
    searchTerm = searchInput.value.trim()
    filterResults()
  })
}

// Función para inicializar la paginación
function initPagination() {
  // Paginación de resultados
  document.getElementById("prev-page").addEventListener("click", () => {
    if (currentResultsPage > 1) {
      currentResultsPage--
      displayResults(currentResultsPage)
    }
  })

  document.getElementById("next-page").addEventListener("click", () => {
    const totalPages = Math.ceil(raceResults.length / resultsPerPage)
    if (currentResultsPage < totalPages) {
      currentResultsPage++
      displayResults(currentResultsPage)
    }
  })

  // Paginación de participantes
  document.getElementById("participants-prev-page").addEventListener("click", () => {
    if (currentParticipantsPage > 1) {
      currentParticipantsPage--
      displayParticipants(currentParticipantsPage)
    }
  })

  document.getElementById("participants-next-page").addEventListener("click", () => {
    const totalPages = Math.ceil(raceResults.length / participantsPerPage)
    if (currentParticipantsPage < totalPages) {
      currentParticipantsPage++
      displayParticipants(currentParticipantsPage)
    }
  })
}

// Función para inicializar la exportación
function initExport() {
  document.querySelectorAll(".export-btn[data-format]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const format = btn.getAttribute("data-format")
      exportResults(format)
    })
  })
}

// Función para exportar resultados
function exportResults(format) {
  if (raceResults.length === 0) {
    alert("No hay datos para exportar.")
    return
  }

  let content, filename, mimeType

  switch (format) {
    case "json":
      content = JSON.stringify(raceResults, null, 2)
      filename = "resultados.json"
      mimeType = "application/json"
      break
    case "csv":
      content = convertToCSV(raceResults)
      filename = "resultados.csv"
      mimeType = "text/csv"
      break
    case "xls":
      // En una implementación real, se usaría una biblioteca para generar Excel
      // Aquí simulamos con CSV
      content = convertToCSV(raceResults)
      filename = "resultados.csv" // Usamos CSV como alternativa
      mimeType = "text/csv"
      break
    default:
      alert("Formato no soportado.")
      return
  }

  // Crear un blob y descargar
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()

  // Limpiar
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 0)
}

// Función para convertir a CSV
function convertToCSV(data) {
  if (data.length === 0) return ""

  // Obtener encabezados
  const headers = Object.keys(data[0])

  // Crear fila de encabezados
  let csv = headers.join(",") + "\n"

  // Agregar filas de datos
  data.forEach((item) => {
    const row = headers.map((header) => {
      // Escapar comas y comillas
      const cell = String(item[header] || "")
      return cell.includes(",") ? `"${cell}"` : cell
    })
    csv += row.join(",") + "\n"
  })

  return csv
}

// Función para inicializar el modal
function initModal() {
  // Cerrar modal
  document.querySelector(".close-modal").addEventListener("click", closeModal)

  // Cerrar modal al hacer clic fuera
  window.addEventListener("click", (e) => {
    const modal = document.getElementById("competitor-modal")
    if (e.target === modal) {
      closeModal()
    }
  })

  // Botón de descarga de certificado
  document.getElementById("download-certificate").addEventListener("click", () => {
    const name = document.getElementById("modal-name").textContent
    const dorsal = document.getElementById("modal-dorsal").textContent
    alert(`Descargando certificado para ${name} (Dorsal: ${dorsal})`)
  })
}

// Función para filtrar resultados
function filterResults() {
  // Filtrar por categoría
  let filteredResults = [...allRunners]

  if (currentCategoryFilter !== "general") {
    filteredResults = filteredResults.filter(
      (runner) => runner.category.toLowerCase() === currentCategoryFilter.toLowerCase(),
    )
  }

  // Filtrar por género
  if (currentGenderFilter !== "all") {
    const genderText = currentGenderFilter === "F" ? "Mujer" : "Hombre"
    filteredResults = filteredResults.filter((runner) => runner.gender === genderText)
  }

  // Filtrar por término de búsqueda
  if (searchTerm) {
    filteredResults = filteredResults.filter(
      (runner) =>
        runner.name.toLowerCase().includes(searchTerm.toLowerCase()) || runner.dorsal.toString().includes(searchTerm),
    )
  }

  // Ordenar por tiempo
  filteredResults.sort((a, b) => {
    // Convertir tiempo a segundos para comparar
    const timeA = convertTimeToSeconds(a.time)
    const timeB = convertTimeToSeconds(b.time)
    return timeA - timeB
  })

  // Actualizar posiciones después del filtrado
  filteredResults = filteredResults.map((runner, index) => ({
    ...runner,
    position: index + 1,
    gap: index === 0 ? "+00:00" : calculateGap(filteredResults[0].time, runner.time),
  }))

  raceResults = filteredResults

  // Actualizar contador
  document.getElementById("classified-count").textContent = filteredResults.length
  document.getElementById("total-count").textContent = allRunners.length

  // Actualizar etiqueta de categoría
  updateCategoryLabels()

  // Actualizar visualización
  if (currentTab === "results") {
    currentResultsPage = 1 // Volver a la primera página al filtrar
    displayResults(currentResultsPage)
  } else if (currentTab === "participants") {
    currentParticipantsPage = 1
    displayParticipants(currentParticipantsPage)
  }
}

// Función para actualizar las etiquetas de categoría
function updateCategoryLabels() {
  const categoryLabel = document.querySelector(".category-label")
  const currentCategorySpan = document.getElementById("current-category")
  const participantsCategorySpan = document.getElementById("participants-current-category")

  let categoryText = "GENERAL"

  if (currentCategoryFilter === "juvenil") {
    categoryText = "JUVENIL"
  } else if (currentCategoryFilter === "abierta") {
    categoryText = "ABIERTA"
  } else if (currentCategoryFilter === "master") {
    categoryText = "MÁSTER"
  }

  if (currentGenderFilter !== "all") {
    categoryText += " " + (currentGenderFilter === "F" ? "FEMENINO" : "MASCULINO")
  }

  if (categoryLabel) categoryLabel.textContent = categoryText
  if (currentCategorySpan) currentCategorySpan.textContent = categoryText
  if (participantsCategorySpan) participantsCategorySpan.textContent = categoryText
}

// Función para convertir tiempo a segundos
function convertTimeToSeconds(timeString) {
  const parts = timeString.split(":")
  let seconds = 0

  if (parts.length === 3) {
    // Formato HH:MM:SS
    seconds = Number.parseInt(parts[0]) * 3600 + Number.parseInt(parts[1]) * 60 + Number.parseInt(parts[2])
  } else if (parts.length === 2) {
    // Formato MM:SS
    seconds = Number.parseInt(parts[0]) * 60 + Number.parseInt(parts[1])
  }

  return seconds
}

// Función para calcular la diferencia de tiempo
function calculateGap(firstTime, currentTime) {
  const firstSeconds = convertTimeToSeconds(firstTime)
  const currentSeconds = convertTimeToSeconds(currentTime)
  const diffSeconds = currentSeconds - firstSeconds

  // Convertir la diferencia a formato MM:SS
  const minutes = Math.floor(diffSeconds / 60)
  const seconds = diffSeconds % 60

  return `+${minutes}:${seconds.toString().padStart(2, "0")}`
}

// Función para mostrar los resultados en la tabla
function displayResults(page) {
  const resultsBody = document.getElementById("results-body")
  resultsBody.innerHTML = ""

  const totalPages = Math.ceil(raceResults.length / resultsPerPage)
  const startIndex = (page - 1) * resultsPerPage
  const endIndex = Math.min(startIndex + resultsPerPage, raceResults.length)

  if (raceResults.length === 0) {
    const row = document.createElement("tr")
    const cell = document.createElement("td")
    cell.colSpan = 8
    cell.className = "no-data-message"

    const noDataContainer = document.createElement("div")
    noDataContainer.className = "no-data-container"
    noDataContainer.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <p>No se encontraron resultados con los filtros aplicados</p>
        `

    cell.appendChild(noDataContainer)
    row.appendChild(cell)
    resultsBody.appendChild(row)
  } else {
    for (let i = startIndex; i < endIndex; i++) {
      const result = raceResults[i]

      const row = document.createElement("tr")

      // Posición
      const positionCell = document.createElement("td")
      positionCell.className = "position-col"
      positionCell.textContent = result.position + "."
      row.appendChild(positionCell)

      // Dorsal
      const dorsalCell = document.createElement("td")
      dorsalCell.className = "dorsal-col"
      dorsalCell.textContent = result.dorsal
      row.appendChild(dorsalCell)

      // Nombre
      const nameCell = document.createElement("td")
      nameCell.className = "name-col"
      nameCell.textContent = result.name
      nameCell.addEventListener("click", () => openCompetitorModal(result))
      row.appendChild(nameCell)

      // Categoría
      const categoryCell = document.createElement("td")
      categoryCell.className = "category-col"
      categoryCell.textContent = result.category
      row.appendChild(categoryCell)

      // Club
      const clubCell = document.createElement("td")
      clubCell.className = "club-col"
      clubCell.textContent = result.club
      row.appendChild(clubCell)

      // Género
      const genderCell = document.createElement("td")
      genderCell.className = "gender-col"
      genderCell.textContent = result.gender
      row.appendChild(genderCell)

      // Tiempo
      const timeCell = document.createElement("td")
      timeCell.className = "time-col"
      const timeSpan = document.createElement("span")
      timeSpan.className = "time-value"
      timeSpan.textContent = result.time
      timeCell.appendChild(timeSpan)
      row.appendChild(timeCell)

      // Gap
      const gapCell = document.createElement("td")
      gapCell.className = "gap-col"
      if (result.position > 1) {
        const gapSpan = document.createElement("span")
        gapSpan.className = "gap-value"
        gapSpan.textContent = result.gap
        gapCell.appendChild(gapSpan)
      } else {
        gapCell.textContent = "-"
      }
      row.appendChild(gapCell)

      resultsBody.appendChild(row)
    }
  }

  // Actualizar indicadores de paginación
  document.getElementById("current-page").textContent = page
  document.getElementById("total-pages").textContent = totalPages || 1

  // Habilitar/deshabilitar botones de paginación
  document.getElementById("prev-page").disabled = page === 1 || raceResults.length === 0
  document.getElementById("next-page").disabled = page === totalPages || raceResults.length === 0
}

// Función para mostrar los participantes en la vista de tarjetas
function displayParticipants(page) {
  const participantsGrid = document.getElementById("participants-grid")
  participantsGrid.innerHTML = ""

  const totalPages = Math.ceil(raceResults.length / participantsPerPage)
  const startIndex = (page - 1) * participantsPerPage
  const endIndex = Math.min(startIndex + participantsPerPage, raceResults.length)

  if (raceResults.length === 0) {
    const noResults = document.createElement("div")
    noResults.className = "no-data-message"

    const noDataContainer = document.createElement("div")
    noDataContainer.className = "no-data-container"
    noDataContainer.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <p>No se encontraron participantes con los filtros aplicados</p>
        `

    noResults.appendChild(noDataContainer)
    participantsGrid.appendChild(noResults)
  } else {
    for (let i = startIndex; i < endIndex; i++) {
      const participant = raceResults[i]

      const card = document.createElement("div")
      card.className = "participant-card"
      card.addEventListener("click", () => openCompetitorModal(participant))

      const header = document.createElement("div")
      header.className = "participant-header"

      const avatar = document.createElement("div")
      avatar.className = "participant-avatar"
      avatar.innerHTML =
        participant.gender === "Mujer" ? '<i class="fas fa-female"></i>' : '<i class="fas fa-male"></i>'

      const name = document.createElement("div")
      name.className = "participant-name"
      name.textContent = participant.name

      const dorsal = document.createElement("div")
      dorsal.className = "participant-dorsal"
      dorsal.textContent = participant.dorsal

      header.appendChild(avatar)
      header.appendChild(name)
      header.appendChild(dorsal)

      const body = document.createElement("div")
      body.className = "participant-body"

      // Detalles del participante
      const details = [
        { label: "Posición", value: participant.position },
        { label: "Tiempo", value: participant.time },
        { label: "Categoría", value: participant.category },
        { label: "Club", value: participant.club || "No especificado" },
      ]

      details.forEach((detail) => {
        const detailRow = document.createElement("div")
        detailRow.className = "participant-detail"

        const label = document.createElement("div")
        label.className = "detail-label"
        label.textContent = detail.label + ":"

        const value = document.createElement("div")
        value.className = "detail-value"
        value.textContent = detail.value

        detailRow.appendChild(label)
        detailRow.appendChild(value)
        body.appendChild(detailRow)
      })

      const footer = document.createElement("div")
      footer.className = "participant-footer"

      const viewDetailsBtn = document.createElement("button")
      viewDetailsBtn.className = "view-details-btn"
      viewDetailsBtn.textContent = "Ver detalles"
      viewDetailsBtn.addEventListener("click", (e) => {
        e.stopPropagation() // Evitar que se propague al card
        openCompetitorModal(participant)
      })

      footer.appendChild(viewDetailsBtn)

      card.appendChild(header)
      card.appendChild(body)
      card.appendChild(footer)

      participantsGrid.appendChild(card)
    }
  }

  // Actualizar indicadores de paginación
  document.getElementById("participants-current-page").textContent = page
  document.getElementById("participants-total-pages").textContent = totalPages || 1

  // Habilitar/deshabilitar botones de paginación
  document.getElementById("participants-prev-page").disabled = page === 1 || raceResults.length === 0
  document.getElementById("participants-next-page").disabled = page === totalPages || raceResults.length === 0
}

// Función para abrir el modal de competidor
function openCompetitorModal(competitor) {
  const modal = document.getElementById("competitor-modal")

  // Llenar datos del competidor
  document.getElementById("modal-name").textContent = competitor.name
  document.getElementById("modal-dorsal").textContent = competitor.dorsal
  document.getElementById("modal-time").textContent = competitor.time
  document.getElementById("modal-position").textContent = competitor.position
  document.getElementById("modal-club").textContent = competitor.club || "No especificado"
  document.getElementById("modal-category").textContent = competitor.category
  document.getElementById("modal-age").textContent = competitor.age || "No especificado"
  document.getElementById("modal-city").textContent = competitor.city || "No especificado"

  // Calcular ritmo (ejemplo: 5:30 min/km)
  const timeParts = competitor.time.split(":")
  const totalMinutes = Number.parseInt(timeParts[0]) * 60 + Number.parseInt(timeParts[1])
  const pace = (totalMinutes / 21.1).toFixed(2) // Asumiendo media maratón (21.1 km)
  const paceMinutes = Math.floor(pace)
  const paceSeconds = Math.round((pace - paceMinutes) * 60)
  document.getElementById("modal-pace").textContent = `${paceMinutes}:${paceSeconds.toString().padStart(2, "0")} min/km`

  // Mostrar el modal
  modal.style.display = "block"
}

// Función para cerrar el modal
function closeModal() {
  const modal = document.getElementById("competitor-modal")
  modal.style.display = "none"
}

// Mostrar mensaje de error
function showError(message) {
  alert(message)
}
