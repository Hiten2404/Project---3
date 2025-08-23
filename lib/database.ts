import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { jobs, categories, locations } from './mockData';

// The path will be provided by an environment variable on Render
const dbPath = process.env.DATABASE_PATH || path.join((process as any).cwd(), 'data', 'govjobalert.db');
const dbDir = path.dirname(dbPath);

// Ensure the directory for the database exists
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
console.log(`Database connected at ${dbPath}`);

// Check if the database is new (no tables)
const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='jobs'").get();

if (!tableCheck) {
    console.log("No tables found. Initializing and seeding database...");
    
    // Create Tables
    db.exec(`
      CREATE TABLE jobs (
        id INTEGER PRIMARY KEY, title TEXT NOT NULL, department TEXT NOT NULL, category TEXT NOT NULL,
        location TEXT NOT NULL, state TEXT NOT NULL, salary_min INTEGER, salary_max INTEGER,
        experience_required TEXT, education_required TEXT, application_deadline TEXT, posted_date TEXT NOT NULL,
        job_type TEXT, employment_type TEXT, description TEXT, application_url TEXT
      );
    `);
    db.exec(`CREATE TABLE categories (id INTEGER PRIMARY KEY, name TEXT UNIQUE NOT NULL, slug TEXT UNIQUE NOT NULL);`);
    db.exec(`CREATE TABLE locations (id INTEGER PRIMARY KEY, city TEXT NOT NULL, state TEXT NOT NULL, slug TEXT UNIQUE NOT NULL);`);
    
    // Create Indexes
    db.exec(`CREATE INDEX idx_jobs_category ON jobs(category);`);
    db.exec(`CREATE INDEX idx_jobs_state ON jobs(state);`);
    db.exec(`CREATE INDEX idx_jobs_location ON jobs(location);`);
    db.exec(`CREATE INDEX idx_jobs_job_type ON jobs(job_type);`);
    db.exec(`CREATE INDEX idx_jobs_posted_date ON jobs(posted_date DESC);`);

    // Seed Data
    const catStmt = db.prepare("INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)");
    const locStmt = db.prepare("INSERT INTO locations (id, city, state, slug) VALUES (?, ?, ?, ?)");
    const jobStmt = db.prepare(`
      INSERT INTO jobs (id, title, department, category, location, state, salary_min, salary_max, experience_required, education_required, application_deadline, posted_date, job_type, employment_type, description, application_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((items, stmt) => {
        for (const item of items) stmt.run(...Object.values(item));
    });

    insertMany(categories, catStmt);
    insertMany(locations, locStmt);
    insertMany(jobs.map(j => [j.id, j.title, j.department, j.category, j.location, j.state, j.salaryMin, j.salaryMax, j.experienceRequired, j.educationRequired, j.applicationDeadline, j.postedDate, j.jobType, j.employmentType, j.description, j.applicationUrl]), jobStmt);

    console.log("Database seeded successfully.");
} else {
    console.log("Database already initialized.");
}

export default db;