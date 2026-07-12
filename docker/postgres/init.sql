-- APPI VPN - Database Initialization
-- This script runs on first PostgreSQL startup

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create indexes for performance
-- (Actual schema managed by Prisma migrations)
