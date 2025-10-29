// API Base URL
const API_URL = 'http://localhost:5000/api';

// Global Variables
let categoryChart, genderChart, scoreChart;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    displayCurrentDate();
    loadStatistics();
    loadSurveyData();
    initCharts();
    
    // Form Submit Handler
    document.getElementById('survey-form').addEventListener('submit', handleFormSubmit);
});

// Display Current Date
function displayCurrentDate() {
    const dateElement = document.getElementById('current-date');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString('id-ID', options);
    dateElement.textContent = today;
}

// Show Section
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Show selected section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update active nav item
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    event.target.closest('.nav-item').classList.add('active');
    
    // Load data for specific sections
    if (sectionName === 'data') {
        loadSurveyData();
    } else if (sectionName === 'report') {
        generateReport();
    }
}

// Load Statistics
async function loadStatistics() {
    try {
        const response = await fetch(`${API_URL}/statistics`);
        const stats = await response.json();
        
        // Update stat cards
        document.getElementById('total-respondents').textContent = stats.total_respondents;
        document.getElementById('avg-score').textContent = stats.average_score;
        document.getElementById('total-locations').textContent = Object.keys(stats.location_distribution).length;
        document.getElementById('total-categories').textContent = Object.keys(stats.category_distribution).length;
        
        // Update charts
        updateCategoryChart(stats.category_distribution);
        updateGenderChart(stats.gender_distribution);
        updateScoreChart(stats.score_by_category);
        
    } catch (error) {
        console.error('Error loading statistics:', error);
        showNotification('Gagal memuat statistik', 'error');
    }
}

// Initialize Charts
function initCharts() {
    const ctxCategory = document.getElementById('categoryChart').getContext('2d');
    categoryChart = new Chart(ctxCategory, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#f093fb',
                    '#4facfe',
                    '#43e97b'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: { size: 12 }
                    }
                }
            }
        }
    });
    
    const ctxGender = document.getElementById('genderChart').getContext('2d');
    genderChart = new Chart(ctxGender, {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: ['#667eea', '#f093fb'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: { size: 12 }
                    }
                }
            }
        }
    });
    
    const ctxScore = document.getElementById('scoreChart').getContext('2d');
    scoreChart = new Chart(ctxScore, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Rata-rata Skor',
                data: [],
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderColor: '#667eea',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        font: { size: 11 }
                    }
                },
                x: {
                    ticks: {
                        font: { size: 11 }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Update Charts
function updateCategoryChart(data) {
    categoryChart.data.labels = Object.keys(data);
    categoryChart.data.datasets[0].data = Object.values(data);
    categoryChart.update();
}

function updateGenderChart(data) {
    genderChart.data.labels = Object.keys(data);
    genderChart.data.datasets[0].data = Object.values(data);
    genderChart.update();
}

function updateScoreChart(data) {
    scoreChart.data.labels = Object.keys(data);
    scoreChart.data.datasets[0].data = Object.values(data).map(v => v.toFixed(2));
    scoreChart.update();
}

// Load Survey Data
async function loadSurveyData() {
    try {
        const response = await fetch(`${API_URL}/surveys`);
        const surveys = await response.json();
        
        const tbody = document.getElementById('survey-tbody');
        tbody.innerHTML = '';
        
        surveys.forEach((survey, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${survey.respondent_name}</td>
                <td>${survey.age}</td>
                <td>${survey.gender}</td>
                <td>${survey.location}</td>
                <td>${formatDate(survey.survey_date)}</td>
                <td>${survey.category}</td>
                <td>${survey.score}</td>
                <td>${survey.notes}</td>
                <td>
                    <button class="btn-delete" onclick="deleteSurvey(${survey.id})">🗑️ Hapus</button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Error loading survey data:', error);
        showNotification('Gagal memuat data survei', 'error');
    }
}

// Handle Form Submit
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
        const response = await fetch(`${API_URL}/surveys`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showNotification('Data survei berhasil ditambahkan!', 'success');
            e.target.reset();
            loadStatistics();
            loadSurveyData();
        } else {
            showNotification('Gagal menambahkan data', 'error');
        }
        
    } catch (error) {
        console.error('Error submitting form:', error);
        showNotification('Terjadi kesalahan', 'error');
    }
}

// Delete Survey
async function deleteSurvey(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/surveys/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('Data berhasil dihapus', 'success');
            loadStatistics();
            loadSurveyData();
        } else {
            showNotification('Gagal menghapus data', 'error');
        }
        
    } catch (error) {
        console.error('Error deleting survey:', error);
        showNotification('Terjadi kesalahan', 'error');
    }
}

// Generate Report
async function generateReport() {
    try {
        const response = await fetch(`${API_URL}/statistics`);
        const stats = await response.json();
        
        const reportContent = document.getElementById('report-content');
        
        let html = `
            <div class="report-section">
                <h3>📊 Ringkasan Umum</h3>
                <p><strong>Total Responden:</strong> ${stats.total_respondents} orang</p>
                <p><strong>Rata-rata Skor Keseluruhan:</strong> ${stats.average_score} dari 100</p>
                <p><strong>Jumlah Lokasi Survei:</strong> ${Object.keys(stats.location_distribution).length} lokasi</p>
                <p><strong>Jumlah Kategori:</strong> ${Object.keys(stats.category_distribution).length} kategori</p>
            </div>
            
            <div class="report-section">
                <h3>👥 Distribusi Responden</h3>
                <div class="report-highlight">
                    <p><strong>Gender:</strong></p>
                    ${Object.entries(stats.gender_distribution).map(([gender, count]) => 
                        `<p>• ${gender}: ${count} orang (${((count/stats.total_respondents)*100).toFixed(1)}%)</p>`
                    ).join('')}
                </div>
            </div>
            
            <div class="report-section">
                <h3>📂 Kategori Survei</h3>
                <div class="report-highlight">
                    ${Object.entries(stats.category_distribution).map(([category, count]) => 
                        `<p>• ${category}: ${count} responden (${((count/stats.total_respondents)*100).toFixed(1)}%)</p>`
                    ).join('')}
                </div>
            </div>
            
            <div class="report-section">
                <h3>⭐ Performa per Kategori</h3>
                <div class="report-highlight">
                    ${Object.entries(stats.score_by_category).map(([category, score]) => 
                        `<p>• ${category}: ${score.toFixed(2)} (${getScoreLabel(score)})</p>`
                    ).join('')}
                </div>
            </div>
            
            <div class="report-section">
                <h3>📍 Distribusi Lokasi</h3>
                <div class="report-highlight">
                    ${Object.entries(stats.location_distribution).map(([location, count]) => 
                        `<p>• ${location}: ${count} responden</p>`
                    ).join('')}
                </div>
            </div>
        `;
        
        reportContent.innerHTML = html;
        
    } catch (error) {
        console.error('Error generating report:', error);
        showNotification('Gagal membuat laporan', 'error');
    }
}

// Helper Functions
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

function getScoreLabel(score) {
    if (score >= 90) return 'Sangat Baik';
    if (score >= 80) return 'Baik';
    if (score >= 70) return 'Cukup';
    if (score >= 60) return 'Kurang';
    return 'Sangat Kurang';
}

function showNotification(message, type) {
    // Simple alert for now - can be enhanced with better UI
    alert(message);
}