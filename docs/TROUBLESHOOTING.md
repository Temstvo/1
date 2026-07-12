# Troubleshooting Guide

## Common Issues

### Database Connection Error

```
Error: Can't reach database server
```

**Solution:**
```bash
# Check PostgreSQL is running
docker compose ps postgres

# Check logs
docker compose logs postgres

# Verify connection
docker compose exec postgres pg_isready -U postgres

# Restart PostgreSQL
docker compose restart postgres
```

### Redis Connection Error

```
Error: Redis connection refused
```

**Solution:**
```bash
# Check Redis is running
docker compose ps redis

# Check logs
docker compose logs redis

# Test connection
docker compose exec redis redis-cli ping

# Restart Redis
docker compose restart redis
```

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Find process using the port
netstat -ano | findstr :3000
# or on macOS/Linux
lsof -i :3000

# Kill the process
taskkill /PID <PID> /F
# or on macOS/Linux
kill -9 <PID>
```

### Prisma Migration Error

```
Error: P1001: Can't reach database server
```

**Solution:**
```bash
# Ensure database is running
docker compose up -d postgres

# Wait for it to be ready
sleep 5

# Run migrations
pnpm --filter backend prisma migrate deploy
```

### pnpm Lock File Out of Sync

```
 ERR_PNPM_OUTDATED_LOCKFILE
```

**Solution:**
```bash
# Remove lock file and reinstall
rm pnpm-lock.yaml
rm -rf node_modules
pnpm install
```

### TypeScript Build Errors

```
error TS2345: Argument of type 'X' is not assignable
```

**Solution:**
1. Check types are correctly defined
2. Run `pnpm typecheck` to see all errors
3. Fix type issues in the code

### Build Failures

```bash
# Clean build artifacts
pnpm clean

# Clear turbo cache
rm -rf .turbo

# Clear node_modules
rm -rf node_modules
pnpm install

# Retry build
pnpm build
```

### Docker Build Failures

```bash
# Remove old images
docker compose down --rmi all

# Rebuild from scratch
docker compose build --no-cache

# Start services
docker compose up -d
```

## Performance Issues

### Slow API Response

1. Check database query performance
2. Verify Redis caching
3. Check for N+1 queries
4. Review indexes

### High Memory Usage

1. Check for memory leaks
2. Review Redis memory usage
3. Check PostgreSQL connections
4. Review container resource limits

## Logs

### Viewing Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend

# Last 100 lines
docker compose logs --tail 100 backend
```

### Log Levels

Set `LOG_LEVEL` in environment:
- `error` - Errors only
- `warn` - Warnings and errors
- `info` - General information
- `debug` - Detailed debugging

## Getting Help

1. Check this guide
2. Search existing issues on GitHub
3. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Environment details
   - Relevant logs
