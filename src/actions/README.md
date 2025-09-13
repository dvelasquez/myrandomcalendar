# Actions Structure

This directory contains the authentication actions for the application, organized into individual files for better maintainability.

## File Structure

```
src/actions/
├── index.ts      # Main exports file
├── register.ts   # User registration action
├── login.ts      # User login action
└── logout.ts     # User logout action
```

## Actions

### Register Action (`register.ts`)
- **Purpose**: Handles user registration
- **Input**: `name`, `email`, `password`
- **Validation**: Zod schema validation
- **Returns**: `{ success: boolean, userId?: string }`
- **Error Codes**: `CONFLICT`, `INTERNAL_SERVER_ERROR`

### Login Action (`login.ts`)
- **Purpose**: Handles user authentication
- **Input**: `email`, `password`
- **Validation**: Zod schema validation
- **Returns**: `{ success: boolean, user?: User }`
- **Error Codes**: `UNAUTHORIZED`, `INTERNAL_SERVER_ERROR`

### Logout Action (`logout.ts`)
- **Purpose**: Handles user logout and session cleanup
- **Input**: None (form data only)
- **Returns**: `{ success: boolean }`
- **Error Codes**: `INTERNAL_SERVER_ERROR`

## Usage

Actions are imported and used in Astro components:

```astro
---
import { actions } from 'astro:actions';
---

<form method="POST" action={actions.login}>
  <!-- form fields -->
</form>
```

## Benefits of Individual Files

1. **Better Organization**: Each action has its own file
2. **Easier Maintenance**: Changes to one action don't affect others
3. **Better Testing**: Individual actions can be tested in isolation
4. **Cleaner Code**: Smaller, focused files are easier to read
5. **Reusability**: Actions can be imported individually if needed
