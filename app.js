// Configuración
const ADMIN_PASSWORD = "4911";

// === CONFIGURACIÓN SUPABASE - REEMPLAZA CON TUS DATOS REALES ===
const SUPABASE_URL = 'https://blyolzsymozdhpprrgar.supabase.co';  // Cambiar por tu URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJseW9senN5bW96ZGhwcHJyZ2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjYxMDcsImV4cCI6MjA3NTAwMjEwN30.UPr9REeEUPRMVhDYtbNDFsrtwBFxB2OEYAwYiuwH7-o';          // Cambiar por tu key

// Inicializar Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Datos de las reuniones (compartidos entre vista pública y admin)
let meetingsData = {};

// Elementos del DOM
const adminAccessBtn = document.getElementById('admin-access-btn');
const publicContent = document.querySelector('.public-content');
const adminPanel = document.getElementById('admin-panel');
const loginModal = document.getElementById('login-modal');
const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');
const backToPublicBtn = document.getElementById('back-to-public');
const logoutBtn = document.getElementById('logout-btn');
const meetingsContainer = document.getElementById('meetings-container');
const meetingModal = document.getElementById('meeting-modal');
const meetingForm = document.getElementById('meeting-form');
const addMeetingBtn = document.getElementById('add-meeting-btn');

// Variables globales
let currentEditKey = null;
let currentMonth = '2025-10'; // Mes actual por defecto

// ========== FUNCIONES SUPABASE ==========

async function loadMeetingsData() {
    try {
        console.log('🔄 Cargando datos desde Supabase...');
        
        const { data, error } = await supabase
            .from('meetings')
            .select('*')
            .order('date', { ascending: true });

        if (error) {
            console.error('Error de Supabase:', error);
            throw error;
        }

        // Convertir array a objeto
        meetingsData = {};
        data.forEach(meeting => {
            meetingsData[meeting.id] = {
                date: meeting.date,
                bibleReference: meeting.bible_reference,
                president: meeting.president,
                openingPrayer: meeting.opening_prayer,
                closingPrayer: meeting.closing_prayer,
                content: meeting.content
            };
        });

        console.log('✅ Datos cargados:', Object.keys(meetingsData).length, 'reuniones');
        
        updateNavigation();
        
        // Cargar primera reunión del mes actual
        const firstMeeting = Object.keys(meetingsData)
            .filter(key => meetingsData[key].date.startsWith(currentMonth))
            .sort((a, b) => new Date(meetingsData[a].date) - new Date(meetingsData[b].date))[0];
        
        if (firstMeeting) {
            renderMeeting(firstMeeting);
        } else if (Object.keys(meetingsData).length > 0) {
            // Si no hay reuniones este mes, cargar la primera disponible
            const anyMeeting = Object.keys(meetingsData)[0];
            renderMeeting(anyMeeting);
        } else {
            createInitialData();
        }

    } catch (error) {
        console.error('❌ Error cargando datos:', error);
        alert('Error al cargar los datos. Usando datos locales.');
        loadFromLocalStorage();
    }
}

async function saveMeetingToSupabase(key, meetingData) {
    try {
        const { error } = await supabase
            .from('meetings')
            .upsert({
                id: key,
                date: meetingData.date,
                bible_reference: meetingData.bibleReference,
                president: meetingData.president,
                opening_prayer: meetingData.openingPrayer,
                closing_prayer: meetingData.closingPrayer,
                content: meetingData.content,
                updated_at: new Date().toISOString()
            });

        if (error) {
            console.error('Error de Supabase:', error);
            throw error;
        }

        console.log('✅ Reunión guardada en Supabase:', key);
        return true;
    } catch (error) {
        console.error('❌ Error guardando en Supabase:', error);
        saveToLocalStorage(key, meetingData);
        return false;
    }
}

async function deleteMeetingFromSupabase(key) {
    try {
        const { error } = await supabase
            .from('meetings')
            .delete()
            .eq('id', key);

        if (error) {
            console.error('Error de Supabase:', error);
            throw error;
        }

        console.log('✅ Reunión eliminada de Supabase:', key);
        return true;
    } catch (error) {
        console.error('❌ Error eliminando de Supabase:', error);
        return false;
    }
}

// Fallback a localStorage
function loadFromLocalStorage() {
    const localData = JSON.parse(localStorage.getItem('meetingsData')) || {};
    meetingsData = localData;
    updateNavigation();
    
    const firstMeeting = Object.keys(meetingsData)[0];
    if (firstMeeting) renderMeeting(firstMeeting);
}

function saveToLocalStorage(key, meetingData) {
    meetingsData[key] = meetingData;
    localStorage.setItem('meetingsData', JSON.stringify(meetingsData));
}

// Crear datos iniciales si no existen
async function createInitialData() {
    console.log('🔄 Creando datos iniciales...');
    
    const initialData = {
        "octubre-2": {
            date: "2025-10-02",
            bibleReference: "ECLESIASTÉS 3,4",
            president: "NOMBRE",
            openingPrayer: "NOMBRE",
            closingPrayer: "NOMBRE",
            content: [
                { type: "song", number: 93 },
                { type: "intro", duration: "1 min." },
                { 
                    type: "section", 
                    title: "TESOROS DE LA BIBLIA", 
                    items: [
                        { number: 1, title: "Fortalezcan su cuerda triple", duration: "10 mins.", participants: "NOMBRE / NOMBRE" },
                        { number: 2, title: "Busquemos perlas escondidas", duration: "10 mins.", participants: "NOMBRE / NOMBRE" },
                        { number: 3, title: "Lectura de la Biblia", duration: "4 mins.", participants: "NOMBRE / NOMBRE" }
                    ]
                },
                { 
                    type: "section", 
                    title: "SEAMOS MEJORES MAESTROS", 
                    items: [
                        { number: 4, title: "De casa en casa", duration: "4 mins.", participants: "NOMBRE / NOMBRE" },
                        { number: 5, title: "Predicación Informal", duration: "4 mins.", participants: "NOMBRE / NOMBRE" },
                        { number: 6, title: "Discurso", duration: "4 mins.", participants: "NOMBRE" }
                    ]
                },
                { type: "song", number: 131 },
                { 
                    type: "section", 
                    title: "NUESTRA VIDA CRISTIANA", 
                    items: [
                        { number: 7, title: "Cuando tengan problemas en su matrimonio, no aparten a Jehová de su vida", duration: "4 mins.", participants: "NOMBRE" },
                        { number: 8, title: "Estudio bíblico de congregación", duration: "30 mins.", participants: "NOMBRE / NOMBRE", conductor: true }
                    ]
                },
                { type: "conclusion", duration: "3 mins." },
                { type: "song", number: 51 }
            ]
        }
    };

    let savedCount = 0;
    for (const [key, meeting] of Object.entries(initialData)) {
        const success = await saveMeetingToSupabase(key, meeting);
        if (success) {
            meetingsData[key] = meeting;
            savedCount++;
        }
    }

    if (savedCount > 0) {
        updateNavigation();
        const firstKey = Object.keys(meetingsData)[0];
        if (firstKey) renderMeeting(firstKey);
        
        alert('✅ Datos iniciales creados en la base de datos.');
    }
}

// ========== INICIALIZACIÓN ==========

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar selector de mes primero
    initializeMonthSelector();
    updateMonthDisplay();
    
    // Cargar datos desde Supabase
    loadMeetingsData();
    
    // Inicializar elementos dinámicos (solo event listeners)
    initializeDynamicElements();
    
    // Event listeners para administración
    adminAccessBtn.addEventListener('click', showLoginModal);
    backToPublicBtn.addEventListener('click', showPublicView);
    logoutBtn.addEventListener('click', handleLogout);
    loginForm.addEventListener('submit', handleLogin);
    addMeetingBtn.addEventListener('click', openAddModal);
    meetingForm.addEventListener('submit', handleMeetingSubmit);

    // Event listeners para cerrar modales
    document.querySelector('.close').addEventListener('click', function() {
        loginModal.style.display = 'none';
    });
    
    document.querySelector('.close-meeting').addEventListener('click', function() {
        meetingModal.style.display = 'none';
    });
    
    document.getElementById('login-cancel').addEventListener('click', function() {
        loginModal.style.display = 'none';
    });

    document.getElementById('cancel-btn').addEventListener('click', function() {
        meetingModal.style.display = 'none';
    });

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(event) {
        if (event.target === loginModal || event.target === meetingModal) {
            loginModal.style.display = 'none';
            meetingModal.style.display = 'none';
        }
    });
});

// ========== FUNCIONES MODIFICADAS PARA SUPABASE ==========

async function handleMeetingSubmit(e) {
    e.preventDefault();
    
    const date = document.getElementById('meeting-date').value;
    const key = document.getElementById('meeting-key').value;
    const bibleReference = document.getElementById('meeting-bible').value;
    const president = document.getElementById('meeting-president').value;
    const openingPrayer = document.getElementById('meeting-opening-prayer').value;
    const closingPrayer = document.getElementById('meeting-closing-prayer').value;
    
    const songOpening = parseInt(document.getElementById('song-opening').value);
    const songMiddle = parseInt(document.getElementById('song-middle').value);
    const songClosing = parseInt(document.getElementById('song-closing').value);

    const treasure1Title = document.getElementById('treasure-1-title').value;
    const treasure2Title = document.getElementById('treasure-2-title').value;
    const treasure3Title = document.getElementById('treasure-3-title').value;
    const treasure1Participants = document.getElementById('treasure-1-participants').value;
    const treasure2Participants = document.getElementById('treasure-2-participants').value;
    const treasure3Participants = document.getElementById('treasure-3-participants').value;
    const treasure1Duration = document.getElementById('treasure-1-duration').value;
    const treasure2Duration = document.getElementById('treasure-2-duration').value;
    const treasure3Duration = document.getElementById('treasure-3-duration').value;

    // Generar el contenido automáticamente desde los campos del formulario
    const content = generateContentFromForm({
        songOpening, songMiddle, songClosing,
        treasure1Title, treasure2Title, treasure3Title,
        treasure1Participants, treasure2Participants, treasure3Participants,
        treasure1Duration, treasure2Duration, treasure3Duration
    });
    
    const meetingData = {
        date,
        bibleReference,
        president,
        openingPrayer,
        closingPrayer,
        content
    };
    
    // Guardar en Supabase
    const success = await saveMeetingToSupabase(key, meetingData);
    
    if (success) {
        if (currentEditKey && currentEditKey !== key) {
            await deleteMeetingFromSupabase(currentEditKey);
            delete meetingsData[currentEditKey];
        }
        
        meetingsData[key] = meetingData;
        meetingModal.style.display = 'none';
        renderAdminMeetings();
        
        const activeBtn = document.querySelector('.nav-btn.active');
        if (activeBtn && activeBtn.getAttribute('data-section') === key) {
            renderMeeting(key);
        }
        
        alert('✅ Reunión guardada exitosamente en la base de datos.');
    } else {
        alert('⚠️ Error al guardar en la base de datos. Los datos se guardaron localmente.');
    }
}

async function deleteMeeting(key) {
    if (confirm(`¿Estás seguro de que quieres eliminar la reunión del ${formatDisplayDate(meetingsData[key].date)}?`)) {
        const success = await deleteMeetingFromSupabase(key);
        
        if (success) {
            delete meetingsData[key];
            renderAdminMeetings();
            
            const activeBtn = document.querySelector('.nav-btn.active');
            if (activeBtn && activeBtn.getAttribute('data-section') === key) {
                const firstKey = Object.keys(meetingsData)[0];
                if (firstKey) {
                    document.querySelector(`.nav-btn[data-section="${firstKey}"]`).click();
                } else {
                    document.getElementById('meeting-content').innerHTML = 
                        '<div class="empty-state"><h3>No hay reuniones programadas</h3></div>';
                }
            }
            
            alert('✅ Reunión eliminada exitosamente de la base de datos.');
        } else {
            alert('❌ Error al eliminar de la base de datos.');
        }
    }
}

async function generateMonthTemplates() {
    if (!confirm(`¿Generar plantillas para ${getMonthName(currentMonth)}? Esto creará reuniones para todos los jueves del mes que no tengan ya una plantilla.`)) {
        return;
    }
    
    const [year, month] = currentMonth.split('-').map(Number);
    const weeks = getWeeksInMonth(year, month);
    
    let generatedCount = 0;
    let skippedCount = 0;
    
    for (const week of weeks) {
        const meetingDate = week.start;
        
        const existingMeeting = Object.keys(meetingsData).find(key => {
            const storedMeeting = meetingsData[key];
            return storedMeeting.date === meetingDate;
        });
        
        if (!existingMeeting) {
            const newMeeting = createMeetingTemplate(meetingDate, weeks.indexOf(week) + 1);
            const success = await saveMeetingToSupabase(meetingDate, newMeeting);
            
            if (success) {
                meetingsData[meetingDate] = newMeeting;
                generatedCount++;
            }
        } else {
            skippedCount++;
        }
    }
    
    if (generatedCount > 0) {
        updateNavigation();
        if (adminPanel.style.display === 'block') {
            renderAdminMeetings();
        }
        
        alert(`✅ Se generaron ${generatedCount} nuevas plantillas para ${getMonthName(currentMonth)}. ${skippedCount > 0 ? `Se omitieron ${skippedCount} reuniones que ya existían.` : ''}`);
    } else {
        alert(`ℹ️ No se generaron nuevas plantillas. ${skippedCount > 0 ? `Todas las ${skippedCount} reuniones para ${getMonthName(currentMonth)} ya existen.` : 'No hay jueves en este mes para generar reuniones.'}`);
    }
}

// ========== FUNCIONES EXISTENTES (MANTENER DE TU CÓDIGO ORIGINAL) ==========
// ========== FUNCIÓN PARA OBTENER REUNIÓN ACTUAL ==========

function getCurrentWeekMeeting() {
    // Obtener fecha actual
    const today = new Date();
    
    // Obtener jueves de esta semana (día de reunión)
    const currentThursday = getThursdayOfWeek(today);
    
    // Formatear fecha para comparación
    const currentThursdayStr = formatDateForInput(currentThursday);
    
    console.log('🔍 Buscando reunión para:', currentThursdayStr);
    
    // Buscar reunión exacta para el jueves actual
    let exactMatch = Object.keys(meetingsData).find(key => {
        return meetingsData[key].date === currentThursdayStr;
    });
    
    if (exactMatch) {
        console.log('✅ Encontrada reunión exacta:', exactMatch);
        return exactMatch;
    }
    
    // Si no hay reunión exacta, buscar la más cercana (pasada o futura)
    console.log('⚠️ No hay reunión exacta, buscando la más cercana...');
    
    const sortedMeetings = Object.keys(meetingsData)
        .sort((a, b) => new Date(meetingsData[a].date) - new Date(meetingsData[b].date));
    
    // Buscar la reunión más cercana a la fecha actual
    let closestMeeting = null;
    let minDiff = Infinity;
    
    sortedMeetings.forEach(key => {
        const meetingDate = new Date(meetingsData[key].date);
        const diff = Math.abs(meetingDate - today);
        
        if (diff < minDiff) {
            minDiff = diff;
            closestMeeting = key;
        }
    });
    
    if (closestMeeting) {
        console.log('📅 Reunión más cercana encontrada:', closestMeeting);
        return closestMeeting;
    }
    
    console.log('❌ No se encontró ninguna reunión');
    return null;
}

function getThursdayOfWeek(date) {
    // Clonar fecha para no modificar la original
    const thursday = new Date(date);
    
    // Obtener día de la semana (0 = domingo, 1 = lunes, ..., 4 = jueves)
    const dayOfWeek = thursday.getDay();
    
    // Calcular diferencia hasta el jueves
    // Si hoy es jueves (4), diferencia = 0
    // Si hoy es viernes (5), diferencia = -1 (jueves pasado)
    // Si hoy es miércoles (3), diferencia = 1 (jueves siguiente)
    const diff = 4 - dayOfWeek;
    
    thursday.setDate(thursday.getDate() + diff);
    
    return thursday;
}

function initializeMonthSelector() {
    const monthSelect = document.getElementById('month-select');
    const generateBtn = document.getElementById('generate-month-btn');
    
    if (monthSelect) {
        monthSelect.addEventListener('change', function() {
            currentMonth = this.value;
            updateMonthDisplay();
            updateNavigation();
            
            // Si estamos en vista de administración, actualizar también
            if (adminPanel.style.display === 'block') {
                renderAdminMeetings();
            }
        });
    }
    
    if (generateBtn) {
        generateBtn.addEventListener('click', generateMonthTemplates);
    }
}

function getWeeksInMonth(year, month) {
    const weeks = [];
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    
    let currentDate = new Date(firstDay);
    
    // Ajustar al primer JUEVES (día de reunión) - 4 = jueves
    while (currentDate <= lastDay && currentDate.getDay() !== 4) {
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Si no encontramos ningún jueves, retornar array vacío
    if (currentDate > lastDay) {
        return weeks;
    }
    
    // Generar solo los jueves del mes (una reunión por semana)
    while (currentDate <= lastDay) {
        const weekStart = new Date(currentDate);
        weeks.push({
            start: formatDateForInput(weekStart),
            number: weeks.length + 1
        });
        
        // Siguiente jueves (7 días después)
        currentDate.setDate(currentDate.getDate() + 7);
    }
    
    return weeks;
}

function createMeetingTemplate(date, weekNumber) {
    const [year, month, day] = date.split('-');
    const monthName = getMonthName(currentMonth);
    
    return {
        date: date,
        bibleReference: "LECTURA BÍBLICA SEMANAL",
        president: "NOMBRE",
        openingPrayer: "NOMBRE",
        closingPrayer: "NOMBRE",
        content: [
            { type: "song", number: 93 },
            { type: "intro", duration: "1 min." },
            { 
                type: "section", 
                title: "TESOROS DE LA BIBLIA", 
                items: [
                    { number: 1, title: "Fortalezcan su cuerda triple", duration: "10 mins.", participants: "NOMBRE / NOMBRE" },
                    { number: 2, title: "Busquemos perlas escondidas", duration: "10 mins.", participants: "NOMBRE / NOMBRE" },
                    { number: 3, title: "Lectura de la Biblia", duration: "4 mins.", participants: "NOMBRE / NOMBRE" }
                ]
            },
            { 
                type: "section", 
                title: "SEAMOS MEJORES MAESTROS", 
                items: [
                    { number: 4, title: "De casa en casa", duration: "4 mins.", participants: "NOMBRE / NOMBRE" },
                    { number: 5, title: "Predicación Informal", duration: "4 mins.", participants: "NOMBRE / NOMBRE" },
                    { number: 6, title: "Discurso", duration: "4 mins.", participants: "NOMBRE" }
                ]
            },
            { type: "song", number: 131 },
            { 
                type: "section", 
                title: "NUESTRA VIDA CRISTIANA", 
                items: [
                    { number: 7, title: "Cuando tengan problemas en su matrimonio, no aparten a Jehová de su vida", duration: "4 mins.", participants: "NOMBRE" },
                    { number: 8, title: "Estudio bíblico de congregación", duration: "30 mins.", participants: "NOMBRE / NOMBRE", conductor: true }
                ]
            },
            { type: "conclusion", duration: "3 mins." },
            { type: "song", number: 51 }
        ]
    };
}

/*function updateNavigation() {
    const navigation = document.querySelector('.navigation');
    if (!navigation) return;
    
    // Limpiar navegación existente
    navigation.innerHTML = '';
    
    // Obtener reuniones del mes actual
    const monthMeetings = Object.keys(meetingsData)
        .filter(key => {
            const meetingDate = meetingsData[key].date;
            return meetingDate.startsWith(currentMonth);
        })
        .sort((a, b) => new Date(meetingsData[a].date) - new Date(meetingsData[b].date));
    
    // Crear botones de navegación
    monthMeetings.forEach((key, index) => {
        const meeting = meetingsData[key];
        const button = document.createElement('button');
        button.className = `nav-btn ${index === 0 ? 'active' : ''}`;
        button.setAttribute('data-section', key);
        button.textContent = formatDisplayDate(meeting.date);
        
        button.addEventListener('click', function() {
            document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            renderMeeting(key);
        });
        
        navigation.appendChild(button);
    });
    
    // Si no hay reuniones, mostrar mensaje
    if (monthMeetings.length === 0) {
        navigation.innerHTML = `
            <div class="empty-state">
                <p>No hay reuniones programadas para ${getMonthName(currentMonth)}</p>
                <p style="margin-top: 10px; font-size: 0.9em; color: #7f8c8d;">
                    Usa el acceso administrativo para generar plantillas o agregar reuniones.
                </p>
            </div>
        `;
    }
    
    // Cargar la primera reunión del mes automáticamente
    if (monthMeetings.length > 0) {
        renderMeeting(monthMeetings[0]);
    } else {
        document.getElementById('meeting-content').innerHTML = `
            <div class="empty-state">
                <h3>No hay reuniones programadas</h3>
                <p>No hay reuniones programadas para ${getMonthName(currentMonth)}.</p>
            </div>
        `;
    }
}*/
function updateNavigation() {
    const navigation = document.querySelector('.navigation');
    if (!navigation) return;
    
    // Limpiar navegación existente
    navigation.innerHTML = '';
    
    // Obtener reuniones del mes actual
    const monthMeetings = Object.keys(meetingsData)
        .filter(key => {
            const meetingDate = meetingsData[key].date;
            return meetingDate.startsWith(currentMonth);
        })
        .sort((a, b) => new Date(meetingsData[a].date) - new Date(meetingsData[b].date));
    
    // Obtener reunión actual
    const currentMeetingKey = getCurrentWeekMeeting();
    let activeMeetingKey = monthMeetings.length > 0 ? monthMeetings[0] : null;
    
    // Si hay reunión actual y está en el mes seleccionado, usarla
    if (currentMeetingKey && monthMeetings.includes(currentMeetingKey)) {
        activeMeetingKey = currentMeetingKey;
    }
    
    // Crear botones de navegación
    monthMeetings.forEach((key) => {
        const meeting = meetingsData[key];
        const button = document.createElement('button');
        button.className = `nav-btn ${key === activeMeetingKey ? 'active' : ''}`;
        button.setAttribute('data-section', key);
        button.textContent = formatDisplayDate(meeting.date);
        
        // Marcar con indicador si es la reunión actual
        if (key === currentMeetingKey) {
            const indicator = document.createElement('span');
            indicator.textContent = ' 🔵';
            indicator.title = 'Reunión de esta semana';
            button.appendChild(indicator);
        }
        
        button.addEventListener('click', function() {
            document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            renderMeeting(key);
        });
        
        navigation.appendChild(button);
    });
    
    // Si no hay reuniones, mostrar mensaje
    if (monthMeetings.length === 0) {
        navigation.innerHTML = `
            <div class="empty-state">
                <p>No hay reuniones programadas para ${getMonthName(currentMonth)}</p>
                <p style="margin-top: 10px; font-size: 0.9em; color: #7f8c8d;">
                    Usa el acceso administrativo para generar plantillas o agregar reuniones.
                </p>
            </div>
        `;
    }
    
    // Cargar la reunión activa automáticamente
    if (activeMeetingKey) {
        renderMeeting(activeMeetingKey);
    } else {
        document.getElementById('meeting-content').innerHTML = `
            <div class="empty-state">
                <h3>No hay reuniones programadas</h3>
                <p>No hay reuniones programadas para ${getMonthName(currentMonth)}.</p>
            </div>
        `;
    }
}

function getMonthName(monthString) {
    const [year, month] = monthString.split('-');
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
}

function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function updateMonthDisplay() {
    const monthDisplay = document.getElementById('current-month-display');
    if (monthDisplay) {
        monthDisplay.textContent = `Las Colonias \u{1F30B} ${getMonthName(currentMonth)}`;
    }
}

function renderMeeting(sectionId) {
    const meeting = meetingsData[sectionId];
    const meetingContent = document.getElementById('meeting-content');
    
    if (!meeting) {
        meetingContent.innerHTML = `
            <div class="empty-state">
                <h3>Reunión no programada</h3>
                <p>Esta reunión no está programada para ${getMonthName(currentMonth)}.</p>
                <p style="margin-top: 10px; font-size: 0.9em; color: #7f8c8d;">
                    Selecciona otra fecha o contacta al administrador.
                </p>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="program-info">
            <div class="program-date">${formatDisplayDate(meeting.date)}</div>
            <div class="bible-reference">${meeting.bibleReference}</div>
        </div>
        
        <div class="prayer-info">
            <div class="president-info">Presidente: ${meeting.president}</div>
            <div class="prayer-assignment">Oración: ${meeting.openingPrayer}</div>
        </div>
    `;
    
    // Renderizar contenido
    meeting.content.forEach(item => {
        if (item.type === "song") {
            html += `
                <div class="song-item">
                    <div class="song-icon">♪</div>
                    <div class="item-title">Canción ${item.number}</div>
                </div>
            `;
        } else if (item.type === "intro") {
            html += `
                <div class="program-item">
                    <div class="item-time">00:00:00</div>
                    <div class="item-title">Palabras de Introducción</div>
                    <div class="item-duration">${item.duration}</div>
                </div>
            `;
        } else if (item.type === "conclusion") {
            html += `
                <div class="program-item">
                    <div class="item-time">00:00:00</div>
                    <div class="item-title">Palabras de conclusión</div>
                    <div class="item-duration">${item.duration}</div>
                </div>
            `;
        } else if (item.type === "section") {
            let sectionClass = "section-otros";
            if (item.title.includes("TESOROS")) sectionClass = "section-tesoros";
            else if (item.title.includes("MAESTROS")) sectionClass = "section-maestros";
            else if (item.title.includes("VIDA")) sectionClass = "section-vida";
            
            html += `
                <div class="program-section">
                    <div class="section-header ${sectionClass}">${item.title}</div>
                    <div class="section-content">
            `;
            
            item.items.forEach(sectionItem => {
                const conductorText = sectionItem.conductor ? 
                    '<div style="font-size:12px; color:#7f8c8d; margin-top:5px;">Conductor / Lector</div>' : '';
                
                html += `
                    <div class="program-item">
                        <div class="item-time">00:00:00</div>
                        <div class="item-number">${sectionItem.number}.</div>
                        <div class="item-title">${sectionItem.title}</div>
                        <div class="item-duration">${sectionItem.duration}</div>
                        <div class="item-participants">${sectionItem.participants}</div>
                    </div>
                    ${conductorText}
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        }
    });
    
    // Oración final
    html += `
        <div class="prayer-info">
            <div class="prayer-assignment">Oración: ${meeting.closingPrayer}</div>
        </div>
    `;
    
    meetingContent.innerHTML = html;
}

function showLoginModal() {
    loginModal.style.display = 'block';
    loginMessage.style.display = 'none';
    document.getElementById('password').value = '';
}

function handleLogin(e) {
    e.preventDefault();
    const password = document.getElementById('password').value;
    
    if (password === ADMIN_PASSWORD) {
        loginModal.style.display = 'none';
        showAdminView();
    } else {
        loginMessage.textContent = 'Contraseña incorrecta. Inténtalo de nuevo.';
        loginMessage.className = 'message error';
        loginMessage.style.display = 'block';
    }
}

function showAdminView() {
    publicContent.style.display = 'none';
    adminPanel.style.display = 'block'; 
    adminAccessBtn.style.display = 'none';
    renderAdminMeetings();
}

function showPublicView() {
    publicContent.style.display = 'block';
    adminPanel.style.display = 'none';
    adminAccessBtn.style.display = 'block';
    adminAccessBtn.style.margin = '20px auto 0 auto';
    
    updateNavigation();
    updateMonthDisplay();
    
    const activeBtn = document.querySelector('.nav-btn.active');
    if (activeBtn) {
        renderMeeting(activeBtn.getAttribute('data-section'));
    } else {
        const firstMeeting = Object.keys(meetingsData)
            .filter(key => meetingsData[key].date.startsWith(currentMonth))
            .sort((a, b) => new Date(meetingsData[a].date) - new Date(meetingsData[b].date))[0];
        
        if (firstMeeting) {
            renderMeeting(firstMeeting);
            const correspondingBtn = document.querySelector(`.nav-btn[data-section="${firstMeeting}"]`);
            if (correspondingBtn) {
                correspondingBtn.classList.add('active');
            }
        }
    }
}

function handleLogout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        showPublicView();
        loginForm.reset();
        meetingForm.reset();
    }
}

function renderAdminMeetings() {
    meetingsContainer.innerHTML = '';
    
    const currentMonthMeetings = Object.keys(meetingsData)
        .filter(key => {
            const meetingDate = meetingsData[key].date;
            return meetingDate.startsWith(currentMonth);
        })
        .sort((a, b) => new Date(meetingsData[a].date) - new Date(meetingsData[b].date));

    if (currentMonthMeetings.length === 0) {
        meetingsContainer.innerHTML = `
            <div class="empty-state">
                <h3>No hay reuniones programadas para ${getMonthName(currentMonth)}</h3>
                <p>Haz clic en "Agregar Nueva Reunión" o "Generar Plantillas" para crear reuniones.</p>
            </div>
        `;
        return;
    }
    
    currentMonthMeetings.forEach(key => {
        const meeting = meetingsData[key];
        const meetingElement = document.createElement('div');
        meetingElement.className = 'meeting-card';
        meetingElement.innerHTML = `
            <div class="meeting-info">
                <h4>Reunión del ${formatDisplayDate(meeting.date)}</h4>
                <p><strong>Lectura:</strong> ${meeting.bibleReference}</p>
                <p><strong>Presidente:</strong> ${meeting.president}</p>
                <p><strong>Oración Inicial:</strong> ${meeting.openingPrayer}</p>
            </div>
            <div class="meeting-actions">
                <button class="btn-edit" data-key="${key}">✏️ Editar</button>
                <button class="btn-delete" data-key="${key}">🗑️ Eliminar</button>
            </div>
        `;
        meetingsContainer.appendChild(meetingElement);
    });
    
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const key = this.getAttribute('data-key');
            openEditModal(key);
        });
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const key = this.getAttribute('data-key');
            deleteMeeting(key);
        });
    });
}

function openAddModal() {
    document.getElementById('modal-title').textContent = 'Agregar Nueva Reunión';
    meetingForm.reset();
    currentEditKey = null;
    
    // Inicializar elementos dinámicos para nueva reunión (limpios)
    clearMastersContainer();
    clearLifeContainer();
    
    // Agregar elementos por defecto para nueva reunión
    for (let i = 1; i <= 3; i++) {
        addMastersItem(i, {
            title: getDefaultMastersTitle(i),
            participants: getDefaultMastersParticipants(i),
            duration: getDefaultMastersDuration(i)
        });
    }
    
    for (let i = 7; i <= 8; i++) {
        addLifeItem(i, {
            title: getDefaultLifeTitle(i),
            participants: getDefaultLifeParticipants(i),
            duration: getDefaultLifeDuration(i)
        });
    }
    
    meetingModal.style.display = 'block';
}

function openEditModal(key) {
    const meeting = meetingsData[key];
    if (!meeting) return;
    
    document.getElementById('modal-title').textContent = 'Editar Reunión';
    document.getElementById('meeting-date').value = meeting.date;
    document.getElementById('meeting-key').value = key;
    document.getElementById('meeting-bible').value = meeting.bibleReference;
    document.getElementById('meeting-president').value = meeting.president;
    document.getElementById('meeting-opening-prayer').value = meeting.openingPrayer;
    document.getElementById('meeting-closing-prayer').value = meeting.closingPrayer;
    
    // Extraer detalles SIN inicializar contenedores desde cero
    extractMeetingDetails(meeting.content);
    
    currentEditKey = key;
    meetingModal.style.display = 'block';
}

function formatDisplayDate(dateString) {
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day);
    
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
    });
}

// ========== FUNCIONES PARA ELEMENTOS DINÁMICOS ==========

function initializeDynamicElements() {
    // Solo inicializar event listeners, NO los contenedores
    document.querySelectorAll('.btn-add-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            if (section === 'masters') {
                addMastersItem(getNextMastersNumber());
            } else if (section === 'life') {
                addLifeItem(getNextLifeNumber());
            }
        });
    });
}

function clearMastersContainer() {
    const container = document.getElementById('masters-items-container');
    container.innerHTML = '';
}

function clearLifeContainer() {
    const container = document.getElementById('life-items-container');
    container.innerHTML = '';
}

function addMastersItem(number, data = null) {
    const container = document.getElementById('masters-items-container');
    const itemId = `masters-${number}`;
    
    // Verificar si el elemento ya existe
    if (document.getElementById(`${itemId}-container`)) {
        return; // No duplicar elementos existentes
    }
    
    const itemHTML = `
        <div class="dynamic-item" id="${itemId}-container">
            <div class="dynamic-item-header">
                <span class="dynamic-item-number">Elemento ${number}</span>
                <button type="button" class="btn-remove-item" data-item="${itemId}">🗑️ Eliminar</button>
            </div>
            <div class="dynamic-item-fields">
                <div class="form-group">
                    <label for="${itemId}-title">Título:</label>
                    <input type="text" id="${itemId}-title" 
                           value="${data?.title || getDefaultMastersTitle(number)}" 
                           placeholder="Título" required>
                </div>
                <div class="form-group">
                    <label for="${itemId}-participants">Participantes:</label>
                    <input type="text" id="${itemId}-participants" 
                           value="${data?.participants || getDefaultMastersParticipants(number)}" 
                           placeholder="Participantes" required>
                </div>
                <div class="form-group">
                    <label for="${itemId}-duration">Duración:</label>
                    <input type="text" id="${itemId}-duration" 
                           value="${data?.duration || getDefaultMastersDuration(number)}" 
                           placeholder="Duración" required>
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', itemHTML);
    
    // Agregar event listener al botón de eliminar
    const removeBtn = document.querySelector(`[data-item="${itemId}"]`);
    if (removeBtn) {
        removeBtn.addEventListener('click', function() {
            removeMastersItem(number);
        });
    }
}

function addLifeItem(number, data = null) {
    const container = document.getElementById('life-items-container');
    const itemId = `life-${number}`;
    
    // Verificar si el elemento ya existe
    if (document.getElementById(`${itemId}-container`)) {
        return; // No duplicar elementos existentes
    }
    
    const itemHTML = `
        <div class="dynamic-item" id="${itemId}-container">
            <div class="dynamic-item-header">
                <span class="dynamic-item-number">Elemento ${number}</span>
                <button type="button" class="btn-remove-item" data-item="${itemId}">🗑️ Eliminar</button>
            </div>
            <div class="dynamic-item-fields">
                <div class="form-group">
                    <label for="${itemId}-title">Título:</label>
                    <input type="text" id="${itemId}-title" 
                           value="${data?.title || getDefaultLifeTitle(number)}" 
                           placeholder="Título" required>
                </div>
                <div class="form-group">
                    <label for="${itemId}-participants">Participantes:</label>
                    <input type="text" id="${itemId}-participants" 
                           value="${data?.participants || getDefaultLifeParticipants(number)}" 
                           placeholder="Participantes" required>
                </div>
                <div class="form-group">
                    <label for="${itemId}-duration">Duración:</label>
                    <input type="text" id="${itemId}-duration" 
                           value="${data?.duration || getDefaultLifeDuration(number)}" 
                           placeholder="Duración" required>
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', itemHTML);
    
    // Agregar event listener al botón de eliminar
    const removeBtn = document.querySelector(`[data-item="${itemId}"]`);
    if (removeBtn) {
        removeBtn.addEventListener('click', function() {
            removeLifeItem(number);
        });
    }
}

function removeMastersItem(number) {
    const container = document.getElementById(`masters-${number}-container`);
    if (container && confirm('¿Estás seguro de que quieres eliminar este elemento?')) {
        container.remove();
    }
}

function removeLifeItem(number) {
    const container = document.getElementById(`life-${number}-container`);
    if (container && confirm('¿Estás seguro de que quieres eliminar este elemento?')) {
        container.remove();
    }
}

function getDefaultMastersTitle(number) {
    const titles = {
        1: "De casa en casa",
        2: "Predicación Informal", 
        3: "Discurso",
        4: "Nueva Conversación",
        5: "Revisita"
    };
    return titles[number] || "Nuevo Elemento";
}

function getDefaultMastersParticipants(number) {
    return number === 3 ? "NOMBRE" : "NOMBRE / NOMBRE";
}

function getDefaultMastersDuration(number) {
    return "4 mins.";
}

function getDefaultLifeTitle(number) {
    const titles = {
        7: "Cuando tengan problemas en su matrimonio, no aparten a Jehová de su vida",
        8: "Estudio bíblico de congregación",
        9: "Necesidades de la congregación",
        10: "Anuncios"
    };
    return titles[number] || "Nuevo Elemento";
}

function getDefaultLifeParticipants(number) {
    return number === 8 ? "NOMBRE / NOMBRE" : "NOMBRE";
}

function getDefaultLifeDuration(number) {
    return number === 8 ? "30 mins." : "4 mins.";
}

function getNextMastersNumber() {
    const containers = document.querySelectorAll('#masters-items-container .dynamic-item');
    let maxNumber = 0;
    
    containers.forEach(container => {
        const numberText = container.querySelector('.dynamic-item-number').textContent;
        const number = parseInt(numberText.replace('Elemento ', ''));
        if (number > maxNumber) maxNumber = number;
    });
    
    return maxNumber + 1;
}

function getNextLifeNumber() {
    const containers = document.querySelectorAll('#life-items-container .dynamic-item');
    let maxNumber = 6;
    
    containers.forEach(container => {
        const numberText = container.querySelector('.dynamic-item-number').textContent;
        const number = parseInt(numberText.replace('Elemento ', ''));
        if (number > maxNumber) maxNumber = number;
    });
    
    return maxNumber + 1;
}

function getDynamicMastersItems() {
    const items = [];
    const containers = document.querySelectorAll('#masters-items-container .dynamic-item');
    
    containers.forEach(container => {
        const numberText = container.querySelector('.dynamic-item-number').textContent;
        const number = parseInt(numberText.replace('Elemento ', ''));
        const title = document.getElementById(`masters-${number}-title`).value;
        const participants = document.getElementById(`masters-${number}-participants`).value;
        const duration = document.getElementById(`masters-${number}-duration`).value;
        
        items.push({
            number: number,
            title: title,
            participants: participants,
            duration: duration
        });
    });
    
    return items.sort((a, b) => a.number - b.number);
}

function getDynamicLifeItems() {
    const items = [];
    const containers = document.querySelectorAll('#life-items-container .dynamic-item');
    
    containers.forEach(container => {
        const numberText = container.querySelector('.dynamic-item-number').textContent;
        const number = parseInt(numberText.replace('Elemento ', ''));
        const title = document.getElementById(`life-${number}-title`).value;
        const participants = document.getElementById(`life-${number}-participants`).value;
        const duration = document.getElementById(`life-${number}-duration`).value;
        
        items.push({
            number: number,
            title: title,
            participants: participants,
            duration: duration
        });
    });
    
    return items.sort((a, b) => a.number - b.number);
}

function extractMeetingDetails(content) {
    let songOpening = 93;
    let songMiddle = 131;
    let songClosing = 51;

    let treasure1Title = "Fortalezcan su cuerda triple";
    let treasure2Title = "Busquemos perlas escondidas";
    let treasure3Title = "Lectura de la Biblia";
    let treasure1Participants = "NOMBRE / NOMBRE";
    let treasure2Participants = "NOMBRE / NOMBRE";
    let treasure3Participants = "NOMBRE / NOMBRE";
    let treasure1Duration = "10 mins.";
    let treasure2Duration = "10 mins.";
    let treasure3Duration = "4 mins.";

    // Limpiar contenedores ANTES de extraer datos
    clearMastersContainer();
    clearLifeContainer();

    content.forEach(item => {
        if (item.type === "song") {
            if (content.indexOf(item) === 0) songOpening = item.number;
            else if (content.indexOf(item) === 4) songMiddle = item.number;
            else if (content.indexOf(item) === 7) songClosing = item.number;
        }
        else if (item.type === "section" && item.title.includes("TESOROS")) {
            if (item.items[0]) {
                treasure1Title = item.items[0].title;
                treasure1Participants = item.items[0].participants || "NOMBRE / NOMBRE";
                treasure1Duration = item.items[0].duration || "10 mins.";
            }
            if (item.items[1]) {
                treasure2Title = item.items[1].title;
                treasure2Participants = item.items[1].participants || "NOMBRE / NOMBRE";
                treasure2Duration = item.items[1].duration || "10 mins.";
            }
            if (item.items[2]) {
                treasure3Title = item.items[2].title;
                treasure3Participants = item.items[2].participants || "NOMBRE / NOMBRE";
                treasure3Duration = item.items[2].duration || "4 mins.";
            }    
        }
        else if (item.type === "section" && item.title.includes("MAESTROS")) {
            item.items.forEach((sectionItem, index) => {
                const itemNumber = sectionItem.number;
                addMastersItem(itemNumber, {
                    title: sectionItem.title,
                    participants: sectionItem.participants,
                    duration: sectionItem.duration
                });
            });
        }
        else if (item.type === "section" && item.title.includes("VIDA")) {
            item.items.forEach((sectionItem, index) => {
                const itemNumber = sectionItem.number;
                addLifeItem(itemNumber, {
                    title: sectionItem.title,
                    participants: sectionItem.participants,
                    duration: sectionItem.duration
                });
            });
        }                        
    });
    
    document.getElementById('song-opening').value = songOpening;
    document.getElementById('song-middle').value = songMiddle;
    document.getElementById('song-closing').value = songClosing;

    document.getElementById('treasure-1-title').value = treasure1Title;
    document.getElementById('treasure-2-title').value = treasure2Title;
    document.getElementById('treasure-3-title').value = treasure3Title;
    document.getElementById('treasure-1-participants').value = treasure1Participants;
    document.getElementById('treasure-2-participants').value = treasure2Participants;
    document.getElementById('treasure-3-participants').value = treasure3Participants;
    document.getElementById('treasure-1-duration').value = treasure1Duration;
    document.getElementById('treasure-2-duration').value = treasure2Duration;
    document.getElementById('treasure-3-duration').value = treasure3Duration;
}

function generateContentFromForm(values) {
    const mastersItems = getDynamicMastersItems();
    const lifeItems = getDynamicLifeItems();
    
    return [
        { type: "song", number: values.songOpening },
        { type: "intro", duration: "1 min." },
        { 
            type: "section", 
            title: "TESOROS DE LA BIBLIA", 
            items: [
                { number: 1, title: values.treasure1Title, duration: values.treasure1Duration, participants: values.treasure1Participants },
                { number: 2, title: values.treasure2Title, duration: values.treasure2Duration, participants: values.treasure2Participants },
                { number: 3, title: values.treasure3Title, duration: values.treasure3Duration, participants: values.treasure3Participants }
            ]
        },
        { 
            type: "section", 
            title: "SEAMOS MEJORES MAESTROS", 
            items: mastersItems
        },
        { type: "song", number: values.songMiddle },
        { 
            type: "section", 
            title: "NUESTRA VIDA CRISTIANA", 
            items: lifeItems
        },
        { type: "conclusion", duration: "3 mins." },
        { type: "song", number: values.songClosing }
    ];
}