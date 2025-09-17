# Actions Structure

This directory contains the main actions index and utility actions for the application. Authentication actions have been moved to the features-based structure.

## File Structure

```
src/actions/
├── index.ts           # Main exports file - imports from features
└── fetch-calendar.ts  # Calendar data fetching action
```

## Features-Based Structure

Authentication actions are now organized in the features structure:

```
src/features/auth/actions/
├── index.ts    # Auth actions export
├── login.ts    # User login action
├── logout.ts   # User logout action
└── register.ts # User registration action
```

## Usage

Actions are imported and used in Astro components:

```astro
---
import { actions } from 'astro:actions';
---

<!-- Auth actions are now nested under auth -->
<form method="POST" action={actions.auth.login}>
  <!-- form fields -->
</form>

<!-- Other feature actions -->
<form method="POST" action={actions.schedule.createScheduleBlock}>
  <!-- form fields -->
</form>
```

## Benefits of Features Structure

1. **Better Organization**: Related functionality grouped together
2. **Scalability**: Easy to add new features without cluttering main actions
3. **Maintainability**: Each feature is self-contained
4. **Consistency**: Follows the established pattern for schedule and periodic-events
5. **Modularity**: Features can be developed and tested independently