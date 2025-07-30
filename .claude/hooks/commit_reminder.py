#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.8"
# dependencies = ["GitPython>=3.1.40"]
# ///

"""
Commit Reminder Hook - Industry Standard Practices

This hook implements industry-standard git commit reminders:
1. Reminds to commit after completing discrete tasks
2. Time-based reminders (every 30 minutes of active work)
3. Tracks file changes and suggests commits when significant work is done
4. Follows conventional commit standards
5. Prevents work loss by encouraging regular commits

Industry Standards Implemented:
- Commit early, commit often
- Atomic commits (one logical change per commit)
- Meaningful commit messages
- Regular backup through commits
- Branch protection through frequent commits
"""

import json
import os
import sys
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional

try:
    import git
    GIT_AVAILABLE = True
except ImportError:
    GIT_AVAILABLE = False

# Configuration - Industry standard intervals
COMMIT_REMINDER_INTERVAL_MINUTES = 30  # Remind every 30 minutes
TASK_COMPLETION_REMINDER = True        # Remind after task completion
SIGNIFICANT_CHANGES_THRESHOLD = 5      # Lines changed to trigger reminder
MAX_FILES_CHANGED_BEFORE_REMINDER = 3 # Files changed threshold

class CommitReminder:
    def __init__(self):
        self.log_dir = Path.cwd() / 'logs'
        self.log_dir.mkdir(parents=True, exist_ok=True)
        self.state_file = self.log_dir / 'commit_reminder_state.json'
        self.load_state()
        
    def load_state(self):
        """Load the current state from disk."""
        if self.state_file.exists():
            try:
                with open(self.state_file, 'r') as f:
                    self.state = json.load(f)
            except (json.JSONDecodeError, FileNotFoundError):
                self.state = self._default_state()
        else:
            self.state = self._default_state()
    
    def save_state(self):
        """Save the current state to disk."""
        with open(self.state_file, 'w') as f:
            json.dump(self.state, f, indent=2)
    
    def _default_state(self) -> Dict:
        """Return default state structure."""
        return {
            'last_commit_reminder': None,
            'last_commit_time': None,
            'tasks_completed': 0,
            'files_modified': [],
            'session_start': time.time(),
            'total_work_time': 0,
            'reminders_sent': 0
        }
    
    def get_git_status(self) -> Optional[Dict]:
        """Get current git repository status."""
        if not GIT_AVAILABLE:
            return None
            
        try:
            repo = git.Repo(Path.cwd())
            
            # Get changed files
            changed_files = []
            staged_files = []
            untracked_files = []
            
            # Check for changes
            if repo.is_dirty():
                changed_files = [item.a_path for item in repo.index.diff(None)]
                staged_files = [item.a_path for item in repo.index.diff("HEAD")]
            
            untracked_files = repo.untracked_files
            
            # Get last commit time
            try:
                last_commit = repo.head.commit
                last_commit_time = last_commit.committed_date
            except:
                last_commit_time = None
            
            return {
                'changed_files': changed_files,
                'staged_files': staged_files,
                'untracked_files': untracked_files,
                'total_changes': len(changed_files) + len(staged_files) + len(untracked_files),
                'last_commit_time': last_commit_time,
                'has_changes': len(changed_files) > 0 or len(staged_files) > 0 or len(untracked_files) > 0
            }
        except git.exc.InvalidGitRepositoryError:
            return None
        except Exception:
            return None
    
    def should_remind_time_based(self) -> bool:
        """Check if enough time has passed for a time-based reminder."""
        if not self.state['last_commit_reminder']:
            return True
            
        last_reminder = datetime.fromtimestamp(self.state['last_commit_reminder'])
        time_since_reminder = datetime.now() - last_reminder
        
        return time_since_reminder >= timedelta(minutes=COMMIT_REMINDER_INTERVAL_MINUTES)
    
    def should_remind_task_based(self) -> bool:
        """Check if we should remind based on task completion."""
        return TASK_COMPLETION_REMINDER and self.state['tasks_completed'] > 0
    
    def should_remind_changes_based(self, git_status: Dict) -> bool:
        """Check if we should remind based on file changes."""
        if not git_status or not git_status['has_changes']:
            return False
            
        return (git_status['total_changes'] >= MAX_FILES_CHANGED_BEFORE_REMINDER)
    
    def generate_reminder_message(self, git_status: Dict = None) -> str:
        """Generate an appropriate reminder message."""
        messages = []
        
        # Time-based reminder
        if self.should_remind_time_based():
            session_duration = (time.time() - self.state['session_start']) / 60
            messages.append(f"⏰ **COMMIT REMINDER**: You've been working for {session_duration:.0f} minutes.")
        
        # Changes-based reminder
        if git_status and git_status['has_changes']:
            total_changes = git_status['total_changes']
            messages.append(f"📝 **{total_changes} files have changes** that should be committed.")
            
            if git_status['changed_files']:
                messages.append(f"   Modified: {', '.join(git_status['changed_files'][:3])}")
            if git_status['untracked_files']:
                messages.append(f"   New files: {', '.join(git_status['untracked_files'][:3])}")
        
        # Industry standard recommendations
        recommendations = [
            "",
            "📋 **Industry Standard Recommendations:**",
            "• Commit early and often to prevent work loss",
            "• Use atomic commits (one logical change per commit)",
            "• Write clear, descriptive commit messages",
            "• Consider using conventional commit format: `type(scope): description`",
            "",
            "🏷️ **Common commit types:** feat, fix, docs, style, refactor, test, chore",
            "",
            "💡 **Example good commit message:**",
            "`feat(auction): add Hebrew calendar integration for auction scheduling`",
            "",
            "⚡ **Quick commit commands:**",
            "```bash",
            "git add -A && git commit -m \"your message here\"",
            "# or for conventional commits:",
            "git add -A && git commit -m \"feat: your feature description\"",
            "```"
        ]
        
        return "\n".join(messages + recommendations)
    
    def update_task_completion(self):
        """Update task completion counter."""
        self.state['tasks_completed'] += 1
        self.save_state()
    
    def reset_after_reminder(self):
        """Reset state after sending a reminder."""
        self.state['last_commit_reminder'] = time.time()
        self.state['reminders_sent'] += 1
        self.state['tasks_completed'] = 0  # Reset task counter
        self.save_state()
    
    def process_hook_data(self, hook_data: Dict) -> Optional[str]:
        """Process hook data and determine if a reminder should be sent."""
        git_status = self.get_git_status()
        
        # Determine if we should send a reminder
        should_remind = (
            self.should_remind_time_based() or
            self.should_remind_task_based() or
            (git_status and self.should_remind_changes_based(git_status))
        )
        
        if should_remind and git_status and git_status['has_changes']:
            reminder_message = self.generate_reminder_message(git_status)
            self.reset_after_reminder()
            return reminder_message
        
        # Update task completion if this appears to be a task completion
        tool_name = hook_data.get('tool_name', '')
        if tool_name in ['Write', 'Edit', 'MultiEdit', 'TodoWrite']:
            self.update_task_completion()
        
        return None

def main():
    """Main hook execution function."""
    try:
        # Read hook data from stdin
        hook_data = json.load(sys.stdin)
        
        # Initialize commit reminder
        reminder = CommitReminder()
        
        # Process the hook data
        reminder_message = reminder.process_hook_data(hook_data)
        
        # If we have a reminder message, output it
        if reminder_message:
            print(reminder_message, file=sys.stderr)
            
        # Log the hook execution
        log_entry = {
            'timestamp': time.time(),
            'hook_data': hook_data,
            'reminder_sent': reminder_message is not None,
            'git_available': GIT_AVAILABLE
        }
        
        log_file = Path.cwd() / 'logs' / 'commit_reminder.json'
        if log_file.exists():
            with open(log_file, 'r') as f:
                try:
                    log_data = json.load(f)
                except:
                    log_data = []
        else:
            log_data = []
        
        log_data.append(log_entry)
        
        # Keep only last 100 entries
        if len(log_data) > 100:
            log_data = log_data[-100:]
            
        with open(log_file, 'w') as f:
            json.dump(log_data, f, indent=2)
        
        sys.exit(0)
        
    except Exception as e:
        # Log error but don't fail the hook
        error_log = {
            'timestamp': time.time(),
            'error': str(e),
            'type': 'commit_reminder_error'
        }
        
        try:
            error_file = Path.cwd() / 'logs' / 'hook_errors.json'
            if error_file.exists():
                with open(error_file, 'r') as f:
                    errors = json.load(f)
            else:
                errors = []
            
            errors.append(error_log)
            with open(error_file, 'w') as f:
                json.dump(errors, f, indent=2)
        except:
            pass
        
        sys.exit(0)

if __name__ == '__main__':
    main()