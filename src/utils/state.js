// ============================================
// Estado global de la aplicación
// ============================================

// El año lectivo actual, por defecto el año presente
let currentYear = parseInt(localStorage.getItem('currentYear')) || new Date().getFullYear();

// Lista de oyentes para cuando cambia el año
const yearChangeListeners = [];

export function getCurrentYear() {
    return currentYear;
}

export function setCurrentYear(year) {
    currentYear = parseInt(year);
    localStorage.setItem('currentYear', currentYear);

    // Notificar a todos los interesados
    yearChangeListeners.forEach(callback => callback(currentYear));
}

export function onYearChange(callback) {
    yearChangeListeners.push(callback);
}

export default { getCurrentYear, setCurrentYear, onYearChange };
