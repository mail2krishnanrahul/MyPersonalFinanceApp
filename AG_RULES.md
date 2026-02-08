# AGENT_RULES.md

This document establishes the comprehensive technical governance framework, coding standards, and engineering best practices for enterprise Java development. All team members, contributors, and automated systems must adhere to these standards.

---

## 1. Governance & Process

### 1.1 Requirements Analysis
- **Specification Review Protocol**: Before implementation, conduct thorough requirements analysis. Document all gaps, ambiguities, risks, and assumptions in a Requirements Analysis Document (RAD).
- **Stakeholder Sign-off**: Obtain formal approval from technical leads and product owners before proceeding.
- **Impact Assessment**: Evaluate impact on existing systems, dependencies, performance, and security posture.
- **Always Commit to GitHub**: Ensure all code changes are committed to GitHub before proceeding.

### 1.2 Implementation Planning
- **Mandatory Planning Documents**: Create detailed `implementation_plan.md` for all medium-to-large initiatives including:
  - Technical approach and architecture decisions
  - Component breakdown and interaction diagrams
  - Risk mitigation strategies
  - Rollback procedures
  - Performance and security considerations
  - Resource requirements and timeline estimates
- **Approval Gate**: Implementation plans require formal approval from technical leadership before development begins.
- **Plan Versioning**: Maintain plans under version control with change history.

### 1.3 Task Management
- **Work Breakdown Structure**: Decompose all work into manageable tasks documented in `task.md` or project management system.
- **Status Tracking**: Update task status daily (Not Started, In Progress, Blocked, In Review, Complete).
- **Dependency Mapping**: Document inter-task dependencies and critical paths.
- **Retrospectives**: Conduct regular reviews to identify process improvements.

### 1.4 Documentation Standards
- **Code Documentation**: Maintain comprehensive Javadoc for all public APIs.
- **Architecture Decision Records (ADRs)**: Document significant architectural decisions with context, alternatives considered, and rationale.
- **Runbooks**: Create operational runbooks for deployment, monitoring, incident response, and disaster recovery.
- **API Documentation**: Maintain OpenAPI/Swagger specifications for all REST endpoints.
- **Requirements Documentation**: Maintain `requirements.md` for high-level system requirements.

---

## 2. Software Engineering Principles

### 2.1 SOLID Principles (Mandatory)
- **Single Responsibility Principle (SRP)**: Each class must have one, and only one, reason to change. Maximum class size: 300 lines.
- **Open/Closed Principle (OCP)**: Design for extension through interfaces and abstract classes, not modification of existing code.
- **Liskov Substitution Principle (LSP)**: Derived classes must be substitutable for base classes without breaking functionality or contracts.
- **Interface Segregation Principle (ISP)**: Create focused, role-specific interfaces. Avoid "fat" interfaces with unrelated methods.
- **Dependency Inversion Principle (DIP)**: High-level modules must depend on abstractions, not concrete implementations. Use dependency injection.

### 2.2 Design Principles
- **KISS (Keep It Simple)**: Favor simplicity over cleverness. Complex solutions require exceptional justification.
- **DRY (Don't Repeat Yourself)**: Extract duplicate logic into reusable utilities, services, or libraries. Three-strike rule: refactor on third occurrence.
- **YAGNI (You Aren't Gonna Need It)**: Implement only what is required now. Avoid speculative generalization.
- **Separation of Concerns**: Clearly separate business logic, data access, presentation, and infrastructure concerns.
- **Fail Fast**: Validate inputs and preconditions early. Throw meaningful exceptions immediately upon detecting invalid state.

### 2.3 Clean Code Standards

#### 2.3.1 Code Structure
- **Method Complexity**: Maximum cyclomatic complexity: 10. Methods exceeding this must be refactored.
- **Method Length**: Target maximum: 30 lines. Hard limit: 50 lines.
- **Class Size**: Target maximum: 200 lines. Hard limit: 300 lines.
- **Parameter Count**: Maximum: 4 parameters. Use parameter objects for more complex cases.
- **Nesting Depth**: Maximum: 3 levels. Deeply nested code must be refactored.

#### 2.3.2 Naming Conventions
- **Classes**: PascalCase, noun-based (`UserService`, `OrderRepository`).
- **Interfaces**: PascalCase, adjective or noun (`Serializable`, `UserRepository`).
- **Methods**: camelCase, verb-based (`calculateTotal()`, `validateInput()`).
- **Variables**: camelCase, descriptive (`userId`, `orderTotal`).
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY_ATTEMPTS`, `DEFAULT_TIMEOUT`).
- **Boolean Variables/Methods**: Prefix with `is`, `has`, `can` (`isValid`, `hasPermission`).
- **Avoid Abbreviations**: Use full words unless abbreviation is industry standard (e.g., `DTO`, `URL`).

#### 2.3.3 Comments & Documentation
- **Self-Documenting Code**: Code should explain *what* it does through clear naming and structure.
- **Comments for Why**: Use comments to explain *why* decisions were made, not what the code does.
- **Javadoc Requirements**: 
  - All public classes, interfaces, and methods
  - Include `@param`, `@return`, `@throws` tags
  - Describe edge cases and assumptions
- **TODO Comments**: Must include ticket number and assignee (`TODO(JIRA-123, @username): Description`).
- **Remove Dead Code**: Never comment out code. Remove it (version control preserves history).

#### 2.3.4 Code Smells to Avoid
- **Long Methods/Classes**: Violates SRP. Refactor immediately.
- **Long Parameter Lists**: Use parameter objects or builder pattern.
- **Primitive Obsession**: Wrap primitives in domain-specific value objects where appropriate.
- **Feature Envy**: Methods accessing data of other objects excessively should be moved.
- **Data Clumps**: Repeated groups of parameters should become objects.
- **Magic Numbers/Strings**: Extract to named constants.

---

## 3. Database Management

### 3.1 Schema Management (Liquibase Mandatory)
- **Version Control**: ALL database changes must be managed through Liquibase changesets under version control.
- **Changeset Standards**:
  - One logical change per changeset
  - Include rollback instructions where possible
  - Use meaningful IDs and authors
  - Add descriptive comments
- **Naming Convention**: `YYYYMMDD-HHMM-description.xml` (e.g., `20250130-1430-add-user-email-index.xml`).
- **Review Process**: Database changes require code review and DBA approval for production.

### 3.2 Hibernate Configuration
- **Production Settings**: 
  - `spring.jpa.hibernate.ddl-auto=validate` (production)
  - `spring.jpa.hibernate.ddl-auto=none` (preferred for maximum safety)
- **Development Settings**: `validate` only. Never use `create`, `create-drop`, or `update` in any environment.
- **Schema Validation**: Enable schema validation on application startup to detect drift.

### 3.3 Database Design Standards
- **Normalization**: Minimum 3NF unless denormalization is explicitly justified for performance.
- **Constraints**: 
  - Enforce referential integrity with foreign keys
  - Use unique constraints for natural keys
  - Apply NOT NULL constraints where appropriate
  - Use check constraints for data validation
- **Indexing Strategy**:
  - Index all foreign keys
  - Index columns used in WHERE, JOIN, ORDER BY clauses
  - Monitor and optimize based on query patterns
- **Naming Conventions**:
  - Tables: plural, lowercase with underscores (`users`, `order_items`)
  - Columns: lowercase with underscores (`first_name`, `created_at`)
  - Indexes: `idx_tablename_columnname`
  - Foreign keys: `fk_tablename_referenced_table`

### 3.4 Data Integrity
- **Audit Columns**: Include `created_at`, `created_by`, `updated_at`, `updated_by` on all tables.
- **Soft Deletes**: Use `deleted_at` timestamp for logical deletes where applicable.
- **Optimistic Locking**: Implement version columns for concurrent update protection.
- **Transactions**: Use appropriate isolation levels. Default to READ_COMMITTED.

---

## 4. Security Standards

### 4.1 Secrets Management (Zero Tolerance)
- **Prohibition**: NEVER commit secrets, credentials, API keys, tokens, or certificates to version control.
- **Detection**: Configure pre-commit hooks to scan for secrets (use tools like git-secrets, truffleHog).
- **Storage**: 
  - Use environment variables for local development
  - Use enterprise secret managers (HashiCorp Vault, AWS Secrets Manager, Azure Key Vault) for production
  - Rotate secrets regularly per policy
- **Remediation**: If secrets are committed, immediately:
  1. Rotate the compromised credentials
  2. Remove from Git history (`git filter-branch` or BFG Repo-Cleaner)
  3. Report incident per security policy

### 4.2 Input Validation & Sanitization
- **Validate at Boundary**: All external input must be validated at the API/controller layer.
- **Whitelist Approach**: Define allowed inputs rather than blacklisting dangerous ones.
- **Bean Validation**: Use JSR-380 annotations (`@NotNull`, `@Size`, `@Pattern`, etc.).
- **SQL Injection**: Use parameterized queries or JPA/Hibernate exclusively. NEVER concatenate SQL strings.
- **XSS Prevention**: Sanitize output when rendering user-generated content.
- **Path Traversal**: Validate file paths and restrict to expected directories.

### 4.3 Authentication & Authorization
- **Framework**: Use Spring Security. Do not implement custom authentication.
- **Password Policy**:
  - Minimum complexity requirements per enterprise policy
  - Use bcrypt, scrypt, or Argon2 for hashing (NEVER MD5 or SHA-1)
  - Implement account lockout after failed attempts
- **JWT Standards**:
  - Use appropriate expiration times (access: 15-30 min, refresh: 7-30 days)
  - Sign with RS256 or ES256 (not HS256 in distributed systems)
  - Validate all claims (iss, aud, exp, nbf)
- **Authorization**: 
  - Implement role-based (RBAC) or attribute-based (ABAC) access control
  - Deny by default; explicitly grant access
  - Validate authorization on every protected resource access

### 4.4 Dependency Management
- **Scanning**: Run dependency vulnerability scans (OWASP Dependency-Check, Snyk) in CI/CD pipeline.
- **Update Policy**: 
  - Critical vulnerabilities: Patch within 24 hours
  - High vulnerabilities: Patch within 7 days
  - Medium/Low: Address during regular maintenance
- **SCA Tools**: Integrate Software Composition Analysis in development workflow.
- **License Compliance**: Verify all dependencies comply with enterprise licensing policy.

### 4.5 Additional Security Controls
- **HTTPS Only**: Enforce TLS 1.2+ for all communications. No plaintext protocols.
- **CORS**: Configure strict CORS policies. Avoid wildcard origins.
- **Security Headers**: Implement Content-Security-Policy, X-Frame-Options, HSTS, etc.
- **Rate Limiting**: Implement API rate limiting to prevent abuse.
- **Audit Logging**: Log all security-relevant events (authentication, authorization failures, data access).
- **Error Handling**: Never expose stack traces or sensitive system information in error messages.

---

## 5. Version Control Standards

### 5.1 Branching Strategy
- **Model**: Git Flow or Trunk-Based Development (as defined by team).
- **Branch Types**:
  - `main`/`master`: Production-ready code only
  - `develop`: Integration branch for features
  - `feature/*`: New features (`feature/JIRA-123-user-login`)
  - `bugfix/*`: Bug fixes (`bugfix/JIRA-456-fix-null-pointer`)
  - `hotfix/*`: Critical production fixes
  - `release/*`: Release preparation
- **Protection**: Enforce branch protection rules on `main` and `develop` (require reviews, status checks).

### 5.2 Commit Standards
- **Message Format**: Follow Conventional Commits specification:
  ```
  <type>(<scope>): <subject>
  
  <body>
  
  <footer>
  ```
- **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`
- **Examples**:
  - `feat(auth): add OAuth2 login support`
  - `fix(order): resolve calculation error for discounts`
  - `docs(readme): update installation instructions`
- **Atomic Commits**: Each commit should represent one logical change.
- **Commit Frequency**: Commit early and often. Minimum once per day for work in progress.

### 5.3 Code Review Process
- **Mandatory Reviews**: All code requires peer review before merge.
- **Reviewer Responsibilities**:
  - Verify adherence to coding standards
  - Check for security vulnerabilities
  - Validate test coverage
  - Assess maintainability and design
- **Author Responsibilities**:
  - Keep PRs small (< 400 lines preferred)
  - Provide clear description and context
  - Respond to feedback promptly
  - Resolve all conversations before merge
- **Approval Requirements**: Minimum 2 approvals for production merges.

### 5.4 Repository Hygiene
- **`.gitignore`**: Maintain comprehensive `.gitignore` for IDE files, build artifacts, OS files, local configs.
- **Binary Files**: Avoid committing binaries. Use artifact repositories or Git LFS if necessary.
- **Large Files**: Keep repository size manageable. Archive or remove obsolete large files.
- **Cleanup**: Regularly delete merged branches.

---

## 6. Testing Standards

### 6.1 Test Coverage Requirements
- **Unit Tests**: Minimum 80% line coverage, 70% branch coverage.
- **Integration Tests**: Cover all critical business flows and external integrations.
- **End-to-End Tests**: Automate key user journeys for regression detection.
- **Coverage Reporting**: Generate coverage reports in CI/CD and fail builds below threshold.

### 6.2 Test Design Principles
- **Independence**: Tests must not depend on execution order or shared state.
- **Determinism**: Tests must produce consistent results. No flaky tests.
- **Speed**: Unit tests should execute in milliseconds. Optimize slow tests.
- **Clarity**: Test names should describe what is being tested and expected outcome.
- **AAA Pattern**: Structure tests as Arrange, Act, Assert.

### 6.3 Test Types & Tools
- **Unit Testing**: JUnit 5
- **Integration Testing**: Spring Boot Test, Testcontainers for databases
- **E2E Testing**: Playwright
- **Performance Testing**: JMeter
- **Security Testing**: OWASP ZAP

### 6.4 Test Data Management
- **Isolation**: Use separate test databases. Never test against production data.
- **Fixtures**: Use factories or builders for test data creation.
- **Cleanup**: Ensure proper cleanup after tests (use `@AfterEach`, `@DirtiesContext` sparingly).
- **Synthetic Data**: Generate realistic but synthetic data for testing.

### 6.5 Continuous Testing
- **CI Integration**: Run full test suite on every commit.
- **Fast Feedback**: Fail fast on test failures. Prioritize fast tests.
- **Test Quarantine**: Isolate flaky tests for investigation; do not disable permanently.

---

## 7. Logging & Monitoring Standards

### 7.1 Logging Framework
- **Standard**: SLF4J API with Logback or Log4j2 implementation.
- **Configuration**: Externalize logging configuration (logback-spring.xml).
- **Log Rotation**: Implement size-based and time-based rotation policies.
- **Retention**: Define retention policy per environment (e.g., 30 days production, 7 days development).

### 7.2 Log Levels (Strict Definitions)
- **ERROR**: 
  - System failures requiring immediate attention
  - Exceptions that prevent operation completion
  - Data corruption or loss scenarios
  - **Action Required**: On-call alert
- **WARN**: 
  - Degraded functionality but operation continues
  - Recoverable errors or fallback scenarios
  - Deprecated API usage
  - Resource constraints (approaching limits)
  - **Action Required**: Investigation within SLA
- **INFO**: 
  - Application lifecycle events (startup, shutdown, deployment)
  - Significant business events (user registration, order placement)
  - Configuration changes
  - Scheduled job execution
  - **Audience**: Operations team, business analysts
- **DEBUG**: 
  - Detailed execution flow for troubleshooting
  - Method entry/exit with parameters
  - State transitions
  - Query execution details
  - **Audience**: Developers during troubleshooting
- **TRACE**: 
  - Extremely verbose diagnostic information
  - Typically disabled in production
  - **Audience**: Developers during deep debugging

### 7.3 Logging Best Practices
- **Structured Logging**: Use JSON or key-value format for machine parsing:
  ```java
  logger.info("User login successful", 
      kv("userId", userId), 
      kv("ipAddress", ipAddress), 
      kv("timestamp", Instant.now()));
  ```
- **Correlation IDs**: Include request/trace IDs in all log statements for distributed tracing.
- **Contextual Information**: Use MDC (Mapped Diagnostic Context) for thread-local context.
- **Performance**: Use parameterized logging to avoid unnecessary string concatenation:
  ```java
  // Correct
  logger.debug("Processing order {}", orderId);
  
  // Incorrect (creates string even if debug disabled)
  logger.debug("Processing order " + orderId);
  ```
- **Exception Logging**: Always log the full exception object:
  ```java
  logger.error("Failed to process order", exception);
  ```

### 7.4 Security & Compliance
- **PII Protection**: NEVER log personally identifiable information (names, emails, SSNs, credit cards).
- **Credential Protection**: NEVER log passwords, API keys, tokens, or secrets.
- **Data Masking**: Mask sensitive data if logging is necessary (e.g., `****-****-****-1234`).
- **Compliance**: Ensure logging practices comply with GDPR, HIPAA, or other applicable regulations.

### 7.5 Monitoring & Observability
- **Metrics**: Implement application metrics (response times, error rates, throughput) using Micrometer.
- **Health Checks**: Expose health endpoints for monitoring systems.
- **Alerting**: Configure alerts for critical errors, performance degradation, and SLA violations.
- **Dashboards**: Create operational dashboards for real-time system visibility.
- **Distributed Tracing**: Implement distributed tracing (OpenTelemetry, Jaeger, Zipkin) for microservices.

---

## 8. Performance Standards

### 8.1 Performance Requirements
- **API Response Times**: 
  - p50 < 200ms
  - p95 < 500ms
  - p99 < 1000ms
- **Database Queries**: Individual queries < 100ms under normal load.
- **Batch Processing**: Design for horizontal scalability.

### 8.2 Optimization Practices
- **Database**: Use proper indexing, query optimization, connection pooling.
- **Caching**: Implement caching layers (Redis, Caffeine) for frequently accessed data.
- **Lazy Loading**: Use lazy loading for expensive operations.
- **Async Processing**: Use async/await for I/O-bound operations.
- **Profiling**: Regularly profile applications to identify bottlenecks.

---

## 9. Code Quality & Static Analysis

### 9.1 Static Analysis Tools (Mandatory)
- **SonarQube**: Must pass quality gate before merge.
- **Checkstyle**: Enforce coding style consistency.
- **PMD**: Detect code smells and potential bugs.
- **SpotBugs**: Identify bug patterns.
- **OWASP Dependency-Check**: Scan for vulnerable dependencies.

### 9.2 Quality Gates
- **Code Coverage**: Minimum 80% line coverage.
- **Code Smells**: Zero critical, < 10 major per 1000 lines.
- **Duplications**: < 3% duplicate code.
- **Maintainability Rating**: Minimum B rating.
- **Security Hotspots**: All reviewed and resolved.

---

## 10. Compliance & Enforcement

### 10.1 Automated Enforcement
- **CI/CD Integration**: Enforce all rules through automated pipeline checks.
- **Pre-commit Hooks**: Install hooks to catch violations before commit.
- **Quality Gates**: Block merges that violate standards.

### 10.2 Continuous Improvement
- **Regular Reviews**: Review and update standards quarterly.
- **Feedback Loop**: Encourage team feedback on standards effectiveness.
- **Training**: Provide regular training on standards and best practices.

### 10.3 Exceptions
- **Request Process**: Exceptions to standards require written justification and architect approval.
- **Documentation**: Document all approved exceptions with rationale and expiration date.
- **Technical Debt**: Track exceptions as technical debt for future remediation.

---

## 11. References & Resources

- **Java Style Guide**: [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)
- **Spring Best Practices**: [Spring Framework Documentation](https://spring.io/guides)
- **Security Standards**: [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- **Clean Code**: Robert C. Martin - "Clean Code: A Handbook of Agile Software Craftsmanship"
- **Design Patterns**: Gang of Four - "Design Patterns: Elements of Reusable Object-Oriented Software"

---


### 2.4 Specific Coding Rules (New)
- **Optional Return Types**: Return `Optional<T>` instead of `null` or fallback values for methods that may fail or return nothing.
- **Proper Logging with SLF4J**: Use SLF4J (`org.slf4j.Logger`) for logging instead of `System.out` or `System.err`.
- **Input Validation**: Validate all inputs at the beginning of a method. Check for `null`, empty collections, or invalid ranges.
- **Configurable Model Names**: Do not hardcode model names (e.g., "gpt-4o"). Use configuration properties (e.g., `@Value("${azure.ai.model.chat}")`).
- **Stream API Usage**: Use Java Stream API for collection processing and conversions where appropriate.
- **Descriptive Error Messages**: Provide clear and descriptive error messages in exceptions and logs. Include relevant context.

---

**Document Control:**
- **Version**: 1.1
- **Last Updated**: 2025-12-01
- **Review Cycle**: Quarterly
- **Owner**: Engineering Leadership
- **Approval Required For Changes**: Architecture Review Board