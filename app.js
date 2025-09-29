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
    
    // Obtener los nuevos valores
    const songOpening = parseInt(document.getElementById('song-opening').value);
    const songMiddle = parseInt(document.getElementById('song-middle').value);
    const songClosing = parseInt(document.getElementById('song-closing').value);
    //const treasure1Duration = document.getElementById('treasure-1-duration').value;
    //const life8Duration = document.getElementById('life-8-duration').value;
    const treasure1Title = document.getElementById('treasure-1-title').value;
    const life7Title = document.getElementById('life-7-title').value;
    
    let content;
    try {
        content = JSON.parse(document.getElementById('meeting-content-json').value);
        
        // Actualizar los valores en el contenido
        content = updateContentWithFormValues(content, {
            songOpening, songMiddle, songClosing,
            treasure1Title, life7Title
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
    let treasure1Duration = "10 mins.";
    let life8Duration = "30 mins.";
    let treasure1Title = "Fortalezcan su cuerda triple";
    let life7Title = "Cuando tengan problemas en su matrimonio, no aparten a Jehová de su vida";
    
    // Extraer valores del contenido
    content.forEach(item => {
        if (item.type === "song") {
            if (content.indexOf(item) === 0) songOpening = item.number;
            else if (content.indexOf(item) === 4) songMiddle = item.number;
            else if (content.indexOf(item) === 7) songClosing = item.number;
        }
        else if (item.type === "section" && item.title.includes("TESOROS")) {
            if (item.items[0]) {
                treasure1Title = item.items[0].title;
            }
        }
        else if (item.type === "section" && item.title.includes("VIDA")) {
            if (item.items[0]) life7Title = item.items[0].title;
        }
    });
    
    // Llenar los campos
    document.getElementById('song-opening').value = songOpening;
    document.getElementById('song-middle').value = songMiddle;
    document.getElementById('song-closing').value = songClosing;
    document.getElementById('treasure-1-title').value = treasure1Title;
    document.getElementById('life-7-title').value = life7Title;
}

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
        return item;
    });
}
// ========== FIN DE NUEVAS FUNCIONES ==========