# Oden Framework Steering Files

This directory contains AI steering files that guide Kiro in generating consistent, high-quality Oden Framework code.

## What Are Steering Files?

Steering files are **always-on documentation** that Kiro reads before responding to you. They ensure:
- ✅ Consistent code generation
- ✅ Framework rules always followed
- ✅ Best practices enforced
- ✅ Common mistakes avoided
- ✅ Knowledge preservation

## Available Steering Files

### 1. oden-core-rules.md
**Purpose**: Fundamental framework rules and principles

**Contains**:
- Framework overview and architecture
- Critical rules (no imports, naming conventions, etc.)
- Mandatory components for every form
- Audit column handling
- itemId consistency requirements
- Parent-child relationships
- LOV implementation
- Common mistakes to avoid
- Quality checklist

**When Used**: Always (for all Oden development)

---

### 2. oden-python-patterns.md
**Purpose**: Detailed Python code generation patterns

**Contains**:
- Python file structure
- Block classes (FormLayout, DataGridLayout)
- Record classes with validation
- Item classes for all field types
- execVcount structure
- newInstance functions
- LOV functions
- Custom API functions
- Block lifecycle hooks (pre/post)
- Call form implementation
- Common patterns and examples

**When Used**: Always (when generating Python code)

---

### 3. oden-javascript-patterns.md
**Purpose**: Detailed JavaScript code generation patterns

**Contains**:
- JavaScript file structure
- winConfigForm configuration
- Element arrays for all field types
- Rules objects
- Block creation (form/datagrid)
- Multiview implementation
- renderLov function
- Layout definition
- Custom functions (validation, buttons)
- Call form implementation
- Helper functions
- Complete examples

**When Used**: Always (when generating JavaScript code)

---

### 4. oden-validation-guide.md
**Purpose**: Comprehensive validation patterns

**Contains**:
- Validation hierarchy (client vs server)
- Client-side validation (JavaScript)
- Server-side validation (Python)
- Item-level validation
- Record-level validation
- Block-level validation (hooks)
- Custom API validation
- Validation patterns (required, format, range, uniqueness)
- Cross-field validation
- LOV validation
- Best practices
- Common scenarios

**When Used**: Always (when implementing validation)

---

### 5. oden-database-mapping.md
**Purpose**: Database-to-code mapping patterns

**Contains**:
- Complete PostgreSQL to Python/JavaScript mapping table
- DDL analysis patterns
- Foreign key relationships
- Lookup/reference tables
- Special column patterns (status, flags, sequences)
- Constraint analysis (PK, NOT NULL, CHECK, UNIQUE)
- Common DDL patterns
- itemId generation rules
- Quick reference guide

**When Used**: Always (when analyzing DDL or creating forms)

---

### 6. oden-gcp-deployment.md
**Purpose**: GCP Cloud Run deployment guide

**Contains**:
- Deployment architecture
- Environment configuration
- Connection configuration (CreateConnection.py)
- Docker configuration
- Cloud Build pipelines
- GCP infrastructure setup
- Secret Manager configuration
- Deployment workflows
- Cloud Run configuration
- Monitoring and logging
- Troubleshooting
- Best practices
- Deployment checklist

**When Used**: When deploying to GCP Cloud Run

---

## How Steering Files Work

### Inclusion Modes

All current steering files use `inclusion: always`, meaning Kiro reads them in **every conversation**.

```markdown
---
inclusion: always
---
```

**Other modes available**:
- `inclusion: fileMatch` - Read only when specific files are in context
- `inclusion: manual` - Read only when explicitly referenced with `#`

### Benefits

**Before Steering Files**:
```
You: "Create a form from this DDL"
AI: *Might miss newInstance functions*
    *Might create audit column items*
    *Might use wrong itemId format*
```

**With Steering Files**:
```
You: "Create a form from this DDL"
AI: *Reads all steering files first*
    *Knows to create newInstance for every block*
    *Knows to exclude audit columns*
    *Knows itemIds must be lowercase*
    *Follows exact Oden patterns*
    *Generates consistent, correct code*
```

## Usage Examples

### Example 1: Form Generation

```
You: "Create an employee management form with this DDL"
    *Paste DDL*

Kiro: *Reads steering files*
      *Analyzes DDL using oden-database-mapping.md*
      *Generates Python using oden-python-patterns.md*
      *Generates JavaScript using oden-javascript-patterns.md*
      *Applies validation using oden-validation-guide.md*
      *Follows core rules from oden-core-rules.md*
      
      ✅ Complete, consistent form generated
```

### Example 2: Validation Implementation

```
You: "Add validation to check if employee code exists"

Kiro: *Reads oden-validation-guide.md*
      *Knows to implement both client and server validation*
      *Uses correct patterns*
      *Follows best practices*
      
      ✅ Proper validation implemented
```

### Example 3: Deployment

```
You: "Deploy this to Cloud Run"

Kiro: *Reads oden-gcp-deployment.md*
      *Knows to use CreateConnection.py*
      *Generates proper cloudbuild.yaml*
      *Sets up correct environment variables*
      
      ✅ Deployment configured correctly
```

## Maintaining Steering Files

### When to Update

Update steering files when:
- Framework patterns change
- New features are added
- Common mistakes are discovered
- Best practices evolve

### How to Update

1. Edit the relevant `.md` file
2. Kiro will automatically use the updated version
3. No restart or reload needed

### Adding New Steering Files

Create new steering files for:
- Specific form patterns (e.g., `oden-report-patterns.md`)
- Custom integrations (e.g., `oden-api-integration.md`)
- Team-specific standards (e.g., `oden-company-standards.md`)

## File Organization

```
.kiro/steering/
├── README.md                      # This file
├── oden-core-rules.md            # Framework fundamentals
├── oden-python-patterns.md       # Python code patterns
├── oden-javascript-patterns.md   # JavaScript code patterns
├── oden-validation-guide.md      # Validation patterns
├── oden-database-mapping.md      # DDL to code mapping
└── oden-gcp-deployment.md        # Cloud Run deployment
```

## Next Steps

### Phase 2: AI Agent Hooks

After steering files, implement agent hooks for:
- Automatic form validation on file save
- Test generation after form creation
- Documentation updates
- Deployment checks

### Phase 3: Specification Templates

Create templates for:
- Form specifications
- Master-detail patterns
- Multiview patterns
- Custom Oden patterns

### Phase 4: Pattern Library

Build reusable examples:
- Simple form
- Master-detail
- Multi-view
- Call form
- Custom Oden dashboard

## Support

If you encounter issues or have questions:
1. Check the relevant steering file
2. Ask Kiro for clarification
3. Update steering files with new patterns

---

**Remember**: Steering files are your AI knowledge base. Keep them updated, and Kiro will always generate consistent, high-quality Oden Framework code.
