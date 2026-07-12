# APPI VPN - Security Audit Checklist

## Authentication & Authorization
- [ ] Password hashing uses Argon2id with proper parameters
- [ ] JWT tokens have appropriate expiry (15min access, 7d refresh)
- [ ] Refresh token rotation is implemented
- [ ] OAuth flows use state parameter
- [ ] Brute force protection is active (5 attempts = 15min lock)
- [ ] Account lockout notifications are sent
- [ ] Role-based access control (RBAC) is enforced
- [ ] Admin endpoints require ADMIN/SUPER_ADMIN role
- [ ] User can only access their own resources
- [ ] Session management with revocation support

## API Security
- [ ] Rate limiting is configured (10r/s API, 5r/m auth)
- [ ] CORS is properly configured
- [ ] Input validation with class-validator
- [ ] SQL injection prevention via Prisma ORM
- [ ] XSS protection headers are set
- [ ] CSRF protection is enabled
- [ ] Request size limits are enforced
- [ ] Error messages don't leak sensitive info

## Data Protection
- [ ] Passwords are never stored in plain text
- [ ] API keys are in environment variables
- [ ] Database connections use SSL in production
- [ ] Sensitive data is encrypted at rest
- [ ] PII is handled according to GDPR
- [ ] Logs don't contain sensitive data
- [ ] Backup encryption is enabled

## Infrastructure
- [ ] Docker containers run as non-root
- [ ] Environment variables are not committed
- [ ] SSL/TLS is properly configured
- [ ] Security headers are set in Nginx
- [ ] File upload size limits are enforced
- [ ] Directory traversal is prevented
- [ ] HTTP methods are properly restricted

## Monitoring & Logging
- [ ] Security events are logged
- [ ] Failed login attempts are tracked
- [ ] Suspicious activity triggers alerts
- [ ] Audit logs are tamper-proof
- [ ] Log retention policy is defined
- [ ] Real-time alerts for critical events

## Dependencies
- [ ] No known vulnerabilities in dependencies
- [ ] Dependencies are regularly updated
- [ ] Lock files are committed
- [ ] Supply chain attacks are mitigated

## VPN Specific
- [ ] VPN configs are encrypted
- [ ] Private keys are not logged
- [ ] Connection data is properly isolated
- [ ] Traffic accounting is accurate
- [ ] Server health checks are automated

## Compliance
- [ ] Privacy policy is published
- [ ] Terms of service are published
- [ ] Data processing agreement exists
- [ ] Cookie consent is implemented
- [ ] Right to deletion is supported
