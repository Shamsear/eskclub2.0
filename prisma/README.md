# Database Setup Guide

## Prerequisites

- PostgreSQL installed and running
- Node.js and npm installed

## Setup Steps

### 1. Configure Database Connection

Update the `DATABASE_URL` in your `.env` file with your actual PostgreSQL credentials:

```env
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/club_management?schema=public"
```

Replace:
- `YOUR_USERNAME` with your PostgreSQL username
- `YOUR_PASSWORD` with your PostgreSQL password

### 2. Create Database

Create the database in PostgreSQL:

```sql
CREATE DATABASE club_management;
```

### 3. Run Migrations

Generate and apply the database schema:

```bash
npx prisma migrate dev --name init
```

This will:
- Create the migration files
- Apply the migration to your database
- Generate the Prisma Client

### 4. Generate Prisma Client

If you need to regenerate the Prisma Client:

```bash
npx prisma generate
```

### 5. Seed the Database (Optional)

Populate the database with sample data:

```bash
npx prisma db seed
```

## Database Schema

The schema includes the following models:

- **Admin**: System administrators
- **Club**: Sports clubs with name and logo
- **Manager**: Club managers
- **Mentor**: Club mentors
- **Captain**: Team captains
- **Player**: Club players
- **PlayerStatistics**: Player performance statistics

## Useful Commands

- View database in Prisma Studio: `npx prisma studio`
- Reset database: `npx prisma migrate reset`
- Check migration status: `npx prisma migrate status`
