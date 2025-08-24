import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

export const jobs = sqliteTable('jobs', {
  id: integer('id').primaryKey(),
  title: text('title').notNull(),
  department: text('department').notNull(),
  category: text('category').notNull(),
  location: text('location').notNull(),
  state: text('state').notNull(),
  salaryMin: integer('salary_min'),
  salaryMax: integer('salary_max'),
  experienceRequired: text('experience_required'),
  educationRequired: text('education_required'),
  applicationDeadline: text('application_deadline'),
  postedDate: text('posted_date').notNull(),
  jobType: text('job_type', { enum: ['permanent', 'contract', 'temporary'] }),
  employmentType: text('employment_type', { enum: ['full-time', 'part-time'] }),
  description: text('description'),
  applicationUrl: text('application_url'),
});

export const categories = sqliteTable('categories', {
    id: integer('id').primaryKey(),
    name: text('name').notNull().unique(),
    slug: text('slug').notNull().unique(),
});

export const locations = sqliteTable('locations', {
    id: integer('id').primaryKey(),
    city: text('city').notNull(),
    state: text('state').notNull(),
    slug: text('slug').notNull().unique(),
});