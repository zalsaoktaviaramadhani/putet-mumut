from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime
import json
import os

# Set explicit template and static folders
app = Flask(__name__, 
            template_folder='templates',
            static_folder='static')
CORS(app)

# Inisialisasi Database
def init_db():
    conn = sqlite3.connect('survey_vht.db')
    c = conn.cursor()
    
    # Tabel Survei
    c.execute('''CREATE TABLE IF NOT EXISTS surveys
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  respondent_name TEXT,
                  age INTEGER,
                  gender TEXT,
                  location TEXT,
                  survey_date DATE,
                  category TEXT,
                  score INTEGER,
                  notes TEXT)''')
    
    # Insert data sample jika tabel kosong
    c.execute("SELECT COUNT(*) FROM surveys")
    if c.fetchone()[0] == 0:
        sample_data = [
            ('Ahmad', 25, 'Laki-laki', 'Jakarta', '2024-10-01', 'Kesehatan', 85, 'Baik'),
            ('Siti', 30, 'Perempuan', 'Bandung', '2024-10-02', 'Pendidikan', 90, 'Sangat Baik'),
            ('Budi', 28, 'Laki-laki', 'Surabaya', '2024-10-03', 'Kesehatan', 75, 'Cukup'),
            ('Ani', 35, 'Perempuan', 'Jakarta', '2024-10-04', 'Ekonomi', 80, 'Baik'),
            ('Dedi', 22, 'Laki-laki', 'Medan', '2024-10-05', 'Pendidikan', 88, 'Baik'),
            ('Rina', 27, 'Perempuan', 'Surabaya', '2024-10-06', 'Kesehatan', 92, 'Sangat Baik'),
            ('Hadi', 33, 'Laki-laki', 'Bandung', '2024-10-07', 'Ekonomi', 78, 'Baik'),
            ('Maya', 29, 'Perempuan', 'Jakarta', '2024-10-08', 'Pendidikan', 85, 'Baik'),
        ]
        c.executemany('INSERT INTO surveys (respondent_name, age, gender, location, survey_date, category, score, notes) VALUES (?,?,?,?,?,?,?,?)', sample_data)
    
    conn.commit()
    conn.close()

# Route: Halaman Utama
@app.route('/')
def index():
    return render_template('index.html')

# API: Get All Surveys
@app.route('/api/surveys', methods=['GET'])
def get_surveys():
    conn = sqlite3.connect('survey_vht.db')
    c = conn.cursor()
    c.execute('SELECT * FROM surveys ORDER BY survey_date DESC')
    surveys = c.fetchall()
    conn.close()
    
    result = []
    for s in surveys:
        result.append({
            'id': s[0],
            'respondent_name': s[1],
            'age': s[2],
            'gender': s[3],
            'location': s[4],
            'survey_date': s[5],
            'category': s[6],
            'score': s[7],
            'notes': s[8]
        })
    
    return jsonify(result)

# API: Add Survey
@app.route('/api/surveys', methods=['POST'])
def add_survey():
    data = request.json
    conn = sqlite3.connect('survey_vht.db')
    c = conn.cursor()
    
    c.execute('''INSERT INTO surveys 
                 (respondent_name, age, gender, location, survey_date, category, score, notes)
                 VALUES (?,?,?,?,?,?,?,?)''',
              (data['respondent_name'], data['age'], data['gender'], 
               data['location'], data['survey_date'], data['category'], 
               data['score'], data['notes']))
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Survey added successfully'}), 201

# API: Get Statistics
@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    conn = sqlite3.connect('survey_vht.db')
    c = conn.cursor()
    
    # Total Responden
    c.execute('SELECT COUNT(*) FROM surveys')
    total = c.fetchone()[0]
    
    # Rata-rata Score
    c.execute('SELECT AVG(score) FROM surveys')
    avg_score = c.fetchone()[0] or 0
    
    # Distribusi Gender
    c.execute('SELECT gender, COUNT(*) FROM surveys GROUP BY gender')
    gender_dist = dict(c.fetchall())
    
    # Distribusi Kategori
    c.execute('SELECT category, COUNT(*) FROM surveys GROUP BY category')
    category_dist = dict(c.fetchall())
    
    # Distribusi Lokasi
    c.execute('SELECT location, COUNT(*) FROM surveys GROUP BY location')
    location_dist = dict(c.fetchall())
    
    # Score per Kategori
    c.execute('SELECT category, AVG(score) FROM surveys GROUP BY category')
    score_by_category = dict(c.fetchall())
    
    conn.close()
    
    return jsonify({
        'total_respondents': total,
        'average_score': round(avg_score, 2),
        'gender_distribution': gender_dist,
        'category_distribution': category_dist,
        'location_distribution': location_dist,
        'score_by_category': score_by_category
    })

# API: Delete Survey
@app.route('/api/surveys/<int:survey_id>', methods=['DELETE'])
def delete_survey(survey_id):
    conn = sqlite3.connect('survey_vht.db')
    c = conn.cursor()
    c.execute('DELETE FROM surveys WHERE id = ?', (survey_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Survey deleted successfully'})

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)