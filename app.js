// Configuración - Cambia esta contraseña por una segura
const ADMIN_PASSWORD = "1914";

// Datos de las reuniones (compartidos entre vista pública y admin)
let meetingsData = JSON.parse(localStorage.getItem('meetingsData')) || {
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
const exportDataBtn = document.getElementById('export-data-btn');

// Variables globales
let currentEditKey = null;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Cargar la primera reunión por defecto
    renderMeeting('octubre-2');
    
    // Event listeners para navegación pública
    document.querySelectorAll('.nav-btn').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            const sectionId = this.getAttribute('data-section');
            renderMeeting(sectionId);
        });
    });
    
    // Event listeners para administración
    adminAccessBtn.addEventListener('click', showLoginModal);
    backToPublicBtn.addEventListener('click', showPublicView);
    logoutBtn.addEventListener('click', handleLogout);
    loginForm.addEventListener('submit', handleLogin);
    addMeetingBtn.addEventListener('click', openAddModal);
    exportDataBtn.addEventListener('click', exportData);
    meetingForm.addEventListener('submit', handleMeetingSubmit);

    // Event listeners para cerrar modales - NUEVA VERSIÓN CORREGIDA
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
    /*
    // Cerrar modales
    document.querySelectorAll('.close, .close-meeting, #login-cancel, #cancel-btn').forEach(btn => 
        {
        btn.addEventListener('click', function() {
            loginModal.style.display = 'none';
            meetingModal.style.display = 'none';
        });
    });
    */
 /*   
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(event) {
        if (event.target === loginModal) {
            loginModal.style.display = 'none';
        }
        if (event.target === meetingModal) {
            meetingModal.style.display = 'none';
        }
    });
});*/

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(event) {
        if (event.target === loginModal || event.target === meetingModal) {
            loginModal.style.display = 'none';
            meetingModal.style.display = 'none';
        }
    });
});

// Función para renderizar reunión pública
function renderMeeting(sectionId) {
    const meeting = meetingsData[sectionId];
    const meetingContent = document.getElementById('meeting-content');
    
    if (!meeting) {
        meetingContent.innerHTML = '<div class="empty-state"><h3>Reunión no encontrada</h3><p>Esta reunión no está programada aún.</p></div>';
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
            // Determinar la clase CSS según el título de la sección
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

// Funciones de administración
function showLoginModal() {
    loginModal.style.display = 'block';
    loginMessage.style.display = 'none';
    document.getElementById('password').value = '1914';
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
    // Ocultar el botón de acceso administrativo
    adminAccessBtn.style.display = 'none';
    renderAdminMeetings();
}

function showPublicView() {
    publicContent.style.display = 'block';// Solo esta línea para mostrar contenido público
    adminPanel.style.display = 'none';
    // Asegurar que el botón admin sea visible
    adminAccessBtn.style.display = 'block'; // ← AGREGAR ESTA LÍNEA
    adminAccessBtn.style.margin = '20px auto 0 auto'; // Centrar el botón
    // Recargar la reunión actual
    const activeBtn = document.querySelector('.nav-btn.active');
    if (activeBtn) {
        renderMeeting(activeBtn.getAttribute('data-section'));
    }
}

function handleLogout() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        showPublicView();
        // Opcional: Resetear formularios
        loginForm.reset();
        meetingForm.reset();
    }
}

function renderAdminMeetings() {
    meetingsContainer.innerHTML = '';
    
    if (Object.keys(meetingsData).length === 0) {
        meetingsContainer.innerHTML = `
            <div class="empty-state">
                <h3>No hay reuniones programadas</h3>
                <p>Haz clic en "Agregar Nueva Reunión" para crear la primera.</p>
            </div>
        `;
        return;
    }
    
    Object.keys(meetingsData).forEach(key => {
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
    
    // Agregar event listeners a los botones
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
    meetingModal.style.display = 'block';
}
/*
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
    document.getElementById('meeting-content-json').value = JSON.stringify(meeting.content, null, 2);
    
    currentEditKey = key;
    meetingModal.style.display = 'block';
}
*/
// CON ESTA NUEVA VERSIÓN:
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
    document.getElementById('meeting-content-json').value = JSON.stringify(meeting.content, null, 2);
    
    // NUEVO: Extraer valores para los nuevos campos
    extractMeetingDetails(meeting.content);
    
    currentEditKey = key;
    meetingModal.style.display = 'block';
}
/*
function handleMeetingSubmit(e) {
    e.preventDefault();
    
    const date = document.getElementById('meeting-date').value;
    const key = document.getElementById('meeting-key').value;
    const bibleReference = document.getElementById('meeting-bible').value;
    const president = document.getElementById('meeting-president').value;
    const openingPrayer = document.getElementById('meeting-opening-prayer').value;
    const closingPrayer = document.getElementById('meeting-closing-prayer').value;
    
    let content;
    try {
        content = JSON.parse(document.getElementById('meeting-content-json').value);
    } catch (error) {
        alert('Error en el formato JSON del contenido. Por favor, verifica la sintaxis.');
        return;
    }
    
    if (currentEditKey && currentEditKey !== key) {
        // Si se cambió la clave, eliminar la entrada vieja
        delete meetingsData[currentEditKey];
    }
    
    meetingsData[key] = {
        date,
        bibleReference,
        president,
        openingPrayer,
        closingPrayer,
        content
    };

    
    // Guardar en localStorage
    localStorage.setItem('meetingsData', JSON.stringify(meetingsData));
    
    meetingModal.style.display = 'none';
    renderAdminMeetings();
    
    // Actualizar la vista pública si estamos viendo esta reunión
    const activeBtn = document.querySelector('.nav-btn.active');
    if (activeBtn && activeBtn.getAttribute('data-section') === key) {
        renderMeeting(key);
    }
}
*/ 

function handleMeetingSubmit(e) {
    e.preventDefault();
    
    const date = document.getElementById('meeting-date').value;
    const key = document.getElementById('meeting-key').value;
    const bibleReference = document.getElementById('meeting-bible').value;
    const president = document.getElementById('meeting-president').value;
    const openingPrayer = document.getElementById('meeting-opening-prayer').value;
    const closingPrayer = document.getElementById('meeting-closing-prayer').value;
    
    // Obtener los nuevos valores Completos
    const songOpening = parseInt(document.getElementById('song-opening').value);
    const songMiddle = parseInt(document.getElementById('song-middle').value);
    const songClosing = parseInt(document.getElementById('song-closing').value);

    // TESOROS
    const treasure1Title = document.getElementById('treasure-1-title').value;
    const treasure2Title = document.getElementById('treasure-2-title').value;
    const treasure3Title = document.getElementById('treasure-3-title').value;
    const treasure1Participants = document.getElementById('treasure-1-participants').value;
    const treasure2Participants = document.getElementById('treasure-2-participants').value;
    const treasure3Participants = document.getElementById('treasure-3-participants').value;
    const treasure1Duration = document.getElementById('treasure-1-duration').value;
    const treasure2Duration = document.getElementById('treasure-2-duration').value;
    const treasure3Duration = document.getElementById('treasure-3-duration').value; 

    // MAESTROS
    const masters1Title = document.getElementById('masters-1-title').value;
    const masters2Title = document.getElementById('masters-2-title').value;
    const masters3Title = document.getElementById('masters-3-title').value;
    const masters1Participants = document.getElementById('masters-1-participants').value;
    const masters2Participants = document.getElementById('masters-2-participants').value;
    const masters3Participants = document.getElementById('masters-3-participants').value;
    const masters1Duration = document.getElementById('masters-1-duration').value;
    const masters2Duration = document.getElementById('masters-2-duration').value;
    const masters3Duration = document.getElementById('masters-3-duration').value;    
    
    // VIDA CRISTIANA
    const life7Title = document.getElementById('life-7-title').value;
    const life8Title = document.getElementById('life-8-title').value;
    const life7Participants = document.getElementById('life-7-participants').value;
    const life8Participants = document.getElementById('life-8-participants').value;
    const life7Duration = document.getElementById('life-7-duration').value;
    const life8Duration = document.getElementById('life-8-duration').value;

    let content;
    try {
        content = JSON.parse(document.getElementById('meeting-content-json').value);
        
        // Actualizar los valores en el contenido
        content = updateContentWithFormValues(content, {
            songOpening, songMiddle, songClosing,
            // TESOROS
            treasure1Title, treasure2Title, treasure3Title,
            treasure1Participants, treasure2Participants, treasure3Participants,
            treasure1Duration, treasure2Duration, treasure3Duration,
            // MAESTROS
            masters1Title, masters2Title, masters3Title,
            masters1Participants, masters2Participants, masters3Participants,
            masters1Duration, masters2Duration, masters3Duration,
            // VIDA CRISTIANA
            life7Title, life8Title,
            life7Participants, life8Participants,
            life7Duration, life8Duration
        });
        
    } catch (error) {
        alert('Error en el formato JSON del contenido. Por favor, verifica la sintaxis.');
        return;
    }
    
    if (currentEditKey && currentEditKey !== key) {
        delete meetingsData[currentEditKey];
    }
    
    meetingsData[key] = {
        date,
        bibleReference,
        president,
        openingPrayer,
        closingPrayer,
        content
    };
    
    localStorage.setItem('meetingsData', JSON.stringify(meetingsData));
    meetingModal.style.display = 'none';
    renderAdminMeetings();
    
    const activeBtn = document.querySelector('.nav-btn.active');
    if (activeBtn && activeBtn.getAttribute('data-section') === key) {
        renderMeeting(key);
    }
}

function deleteMeeting(key) {
    if (confirm(`¿Estás seguro de que quieres eliminar la reunión del ${formatDisplayDate(meetingsData[key].date)}?`)) {
        delete meetingsData[key];
        localStorage.setItem('meetingsData', JSON.stringify(meetingsData));
        renderAdminMeetings();
        
        // Si esta era la reunión activa, cargar la primera disponible
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
    }
}

function exportData() {
    const dataStr = JSON.stringify(meetingsData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'reuniones-congregacion.json';
    link.click();
}

/*
function formatDisplayDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}*/

function formatDisplayDate(dateString) {
    // Dividir la fecha manualmente para evitar problemas de zona horaria
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day); // month - 1 porque enero es 0
    
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
    });
}
// ========== NUEVAS FUNCIONES AGREGAR AL FINAL ==========

function extractMeetingDetails(content) {
    // Valores por defecto
    let songOpening = 93;
    let songMiddle = 131;
    let songClosing = 51;

    // Valores por defecto para TESOROS
    let treasure1Title = "Fortalezcan su cuerda triple";
    let treasure2Title = "Busquemos perlas escondidas";
    let treasure3Title = "Lectura de la Biblia";
    let treasure1Participants = "NOMBRE / NOMBRE";
    let treasure2Participants = "NOMBRE / NOMBRE";
    let treasure3Participants = "NOMBRE / NOMBRE";
    let treasure1Duration = "10 mins.";
    let treasure2Duration = "10 mins.";
    let treasure3Duration = "4 mins.";

    // Valores por defecto para MAESTROS
    let masters1Title = "DE CASA EN CASA";
    let masters2Title = "PREDICACIÓN INFORMAL";
    let masters3Title = "DISCURSO";
    let masters1Participants = "NOMBRE / NOMBRE";
    let masters2Participants = "NOMBRE / NOMBRE";
    let masters3Participants = "NOMBRE";
    let masters1Duration = "4 mins.";
    let masters2Duration = "4 mins.";
    let masters3Duration = "4 mins.";

    // Valores por defecto para VIDA CRISTIANA
    let life7Title = "Cuando tengan problemas en su matrimonio, no aparten a Jehová de su vida";
    let life8Title = "Estudio bíblico de congregación";
    let life7Participants = "NOMBRE";
    let life8Participants = "NOMBRE / NOMBRE";
    let life7Duration = "4 mins.";
    let life8Duration = "30 mins.";

    // Extraer valores del contenido
    content.forEach(item => {
        if (item.type === "song") {
            if (content.indexOf(item) === 0) songOpening = item.number;
            else if (content.indexOf(item) === 4) songMiddle = item.number;
            else if (content.indexOf(item) === 7) songClosing = item.number;
        }
        else if (item.type === "section" && item.title.includes("TESOROS")) {
            // Extraer los 3 ítems de TESOROS
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
            // Extraer los 3 ítems de MAESTROS
            if (item.items[0]) {
                masters1Title = item.items[0].title;
                masters1Participants = item.items[0].participants || "NOMBRE / NOMBRE";
                masters1Duration = item.items[0].duration || "4 mins.";
            }
            if (item.items[1]) {
                masters2Title = item.items[1].title;
                masters2Participants = item.items[1].participants || "NOMBRE / NOMBRE";
                masters2Duration = item.items[1].duration || "4 mins.";
            }
            if (item.items[2]) {
                masters3Title = item.items[2].title;
                masters3Participants = item.items[2].participants || "NOMBRE";
                masters3Duration = item.items[2].duration || "4 mins.";
            }
        }
        else if (item.type === "section" && item.title.includes("VIDA")) {
            // Extraer los 2 ítems de VIDA CRISTIANA
            if (item.items[0]) {
                life7Title = item.items[0].title;
                life7Participants = item.items[0].participants || "NOMBRE";
                life7Duration = item.items[0].duration || "4 mins.";
            }
            if (item.items[1]) {
                life8Title = item.items[1].title;
                life8Participants = item.items[1].participants || "NOMBRE / NOMBRE";
                life8Duration = item.items[1].duration || "30 mins.";
            }
        }                        
    });
    
    // Llenar los campos del formulario - TÍTULOS
    document.getElementById('song-opening').value = songOpening;
    document.getElementById('song-middle').value = songMiddle;
    document.getElementById('song-closing').value = songClosing;

    // TESOROS
    document.getElementById('treasure-1-title').value = treasure1Title;
    document.getElementById('treasure-2-title').value = treasure2Title;
    document.getElementById('treasure-3-title').value = treasure3Title;
    document.getElementById('treasure-1-participants').value = treasure1Participants;
    document.getElementById('treasure-2-participants').value = treasure2Participants;
    document.getElementById('treasure-3-participants').value = treasure3Participants;
    document.getElementById('treasure-1-duration').value = treasure1Duration;
    document.getElementById('treasure-2-duration').value = treasure2Duration;
    document.getElementById('treasure-3-duration').value = treasure3Duration;

    // MAESTROS
    document.getElementById('masters-1-title').value = masters1Title;
    document.getElementById('masters-2-title').value = masters2Title;
    document.getElementById('masters-3-title').value = masters3Title;
    document.getElementById('masters-1-participants').value = masters1Participants;
    document.getElementById('masters-2-participants').value = masters2Participants;
    document.getElementById('masters-3-participants').value = masters3Participants;
    document.getElementById('masters-1-duration').value = masters1Duration;
    document.getElementById('masters-2-duration').value = masters2Duration;
    document.getElementById('masters-3-duration').value = masters3Duration;

    // VIDA CRISTIANA
    document.getElementById('life-7-title').value = life7Title;
    document.getElementById('life-8-title').value = life8Title;
    document.getElementById('life-7-participants').value = life7Participants;
    document.getElementById('life-8-participants').value = life8Participants;
    document.getElementById('life-7-duration').value = life7Duration;
    document.getElementById('life-8-duration').value = life8Duration;
}
/*
function updateContentWithFormValues(content, values) {
    let songCount = 0;
    
    return content.map(item => {
        if (item.type === "song") {
            songCount++;
            if (songCount === 1) return { ...item, number: values.songOpening };
            if (songCount === 2) return { ...item, number: values.songMiddle };
            if (songCount === 3) return { ...item, number: values.songClosing };
        }
        else if (item.type === "section" && item.title.includes("TESOROS")) {
            return {
                ...item,
                items: item.items.map((sectionItem, index) => {
                    if (index === 0) {
                        return {
                            ...sectionItem,
                            title: values.treasure1Title
                        };
                    }
                    return sectionItem;
                })
            };
        }
        else if (item.type === "section" && item.title.includes("VIDA")) {
            return {
                ...item,
                items: item.items.map((sectionItem, index) => {
                    if (index === 0) {
                        return { ...sectionItem, title: values.life7Title };
                    }
                    return sectionItem;
                })
            };
        }
        else if (item.type === "section" && item.title.includes("MAESTROS")) {
            return {
                ...item,
                items: item.items.map((sectionItem, index) => {
                    if (index === 0 && values.masters1Title) {
                        return { ...sectionItem, title: values.masters1Title };
                    }
                    else if (index === 1 && values.masters2Title) {
                        return { ...sectionItem, title: values.masters2Title };
                    }
                    else if (index === 2 && values.masters3Title) {
                        return { ...sectionItem, title: values.masters3Title };
                    }
                    return sectionItem;
                })
            };
        }    
        return item;
    });*/

//Nueva versión de la función
function updateContentWithFormValues(content, values) {
    let songCount = 0;
    
    return content.map(item => {
        if (item.type === "song") {
            songCount++;
            if (songCount === 1) return { ...item, number: values.songOpening };
            if (songCount === 2) return { ...item, number: values.songMiddle };
            if (songCount === 3) return { ...item, number: values.songClosing };
        }
        else if (item.type === "section" && item.title.includes("TESOROS")) {
            return {
                ...item,
                items: item.items.map((sectionItem, index) => {
                    const updatedItem = { ...sectionItem };
                    
                    if (index === 0) {
                        if (values.treasure1Title) updatedItem.title = values.treasure1Title;
                        if (values.treasure1Participants) updatedItem.participants = values.treasure1Participants;
                        if (values.treasure1Duration) updatedItem.duration = values.treasure1Duration;
                    }
                    else if (index === 1) {
                        if (values.treasure2Title) updatedItem.title = values.treasure2Title;
                        if (values.treasure2Participants) updatedItem.participants = values.treasure2Participants;
                        if (values.treasure2Duration) updatedItem.duration = values.treasure2Duration;
                    }
                    else if (index === 2) {
                        if (values.treasure3Title) updatedItem.title = values.treasure3Title;
                        if (values.treasure3Participants) updatedItem.participants = values.treasure3Participants;
                        if (values.treasure3Duration) updatedItem.duration = values.treasure3Duration;
                    }
                    
                    return updatedItem;
                })
            };
        }
        else if (item.type === "section" && item.title.includes("MAESTROS")) {
            return {
                ...item,
                items: item.items.map((sectionItem, index) => {
                    const updatedItem = { ...sectionItem };
                    
                    if (index === 0) {
                        if (values.masters1Title) updatedItem.title = values.masters1Title;
                        if (values.masters1Participants) updatedItem.participants = values.masters1Participants;
                        if (values.masters1Duration) updatedItem.duration = values.masters1Duration;
                    }
                    else if (index === 1) {
                        if (values.masters2Title) updatedItem.title = values.masters2Title;
                        if (values.masters2Participants) updatedItem.participants = values.masters2Participants;
                        if (values.masters2Duration) updatedItem.duration = values.masters2Duration;
                    }
                    else if (index === 2) {
                        if (values.masters3Title) updatedItem.title = values.masters3Title;
                        if (values.masters3Participants) updatedItem.participants = values.masters3Participants;
                        if (values.masters3Duration) updatedItem.duration = values.masters3Duration;
                    }
                    
                    return updatedItem;
                })
            };
        }
        else if (item.type === "section" && item.title.includes("VIDA")) {
            return {
                ...item,
                items: item.items.map((sectionItem, index) => {
                    const updatedItem = { ...sectionItem };
                    
                    if (index === 0) {
                        if (values.life7Title) updatedItem.title = values.life7Title;
                        if (values.life7Participants) updatedItem.participants = values.life7Participants;
                        if (values.life7Duration) updatedItem.duration = values.life7Duration;
                    }
                    else if (index === 1) {
                        if (values.life8Title) updatedItem.title = values.life8Title;
                        if (values.life8Participants) updatedItem.participants = values.life8Participants;
                        if (values.life8Duration) updatedItem.duration = values.life8Duration;
                    }
                    
                    return updatedItem;
                })
            };
        }
        return item;
    });    
}
// ========== FIN DE NUEVAS FUNCIONES ==========