# Claude Code Hooks - Commit Reminder System

## Overview

This directory contains Claude Code hooks that implement industry-standard development practices, including automated commit reminders to prevent work loss and encourage good git hygiene.

## Commit Reminder Hook

The `commit_reminder.py` hook implements industry-standard commit practices:

### Features

1. **Time-based Reminders**: Reminds to commit every 30 minutes of active work
2. **Task Completion Detection**: Triggers reminders after completing discrete tasks
3. **Change Tracking**: Monitors file changes and suggests commits when significant work is done
4. **Conventional Commit Support**: Provides examples of proper commit message formats
5. **Industry Best Practices**: Follows "commit early, commit often" philosophy

### Industry Standards Implemented

- **Atomic Commits**: Encourages one logical change per commit
- **Meaningful Messages**: Promotes clear, descriptive commit messages
- **Regular Backups**: Prevents work loss through frequent commits
- **Conventional Commits**: Supports structured commit message formats

### Configuration

The hook is configured in `.claude/settings.json` and runs automatically after tool use.

**Default Settings:**
- Reminder interval: 30 minutes
- File change threshold: 3 files
- Task completion tracking: Enabled

### Commit Message Examples

The hook provides examples of good commit messages:

```bash
# Feature additions
feat(auction): add Hebrew calendar integration for auction scheduling

# Bug fixes  
fix(auth): resolve Google OAuth token refresh issue

# Documentation
docs(readme): update installation instructions

# Refactoring
refactor(hooks): extract commit reminder logic into separate module

# Tests
test(auction): add unit tests for Hebrew date calculations
```

### Hook Dependencies

- **GitPython**: For git repository status checking
- **Python 3.8+**: Required runtime environment
- **uv**: Package manager for script execution

### Logging

The hook maintains logs in the `logs/` directory:
- `commit_reminder.json`: Hook execution history
- `commit_reminder_state.json`: Current session state
- `hook_errors.json`: Error tracking

## Other Hooks

- `pre_tool_use.py`: Validation and security checks before tool execution
- `post_tool_use.py`: Logging and state tracking after tool execution
- `send_event.py`: Event notification system
- `notification.py`: User notification handling
- `stop.py` / `subagent_stop.py`: Session cleanup
- `user_prompt_submit.py`: User input logging

## Usage

Hooks run automatically based on configuration in `.claude/settings.json`. No manual intervention required.

The commit reminder will display messages like:

```
⏰ COMMIT REMINDER: You've been working for 32 minutes.
📝 3 files have changes that should be committed.
   Modified: CLAUDE.md, package.json
   New files: commit_reminder.py

📋 Industry Standard Recommendations:
• Commit early and often to prevent work loss
• Use atomic commits (one logical change per commit)  
• Write clear, descriptive commit messages
• Consider using conventional commit format: type(scope): description

💡 Example good commit message:
feat(hooks): add automated commit reminder system with industry standards
```