import { Task, SeniorProfile, BriefingStyle } from '../types';

export function cleanPhoneNumber(phone: string): string {
  // Strip spaces, dashes, parentheses, plus signs
  return phone.replace(/[^\d]/g, '');
}

export function formatWhatsAppDate(dateObj: Date = new Date()): string {
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

interface FormatOptions {
  customNote?: string;
  senderName?: string;
  style?: BriefingStyle;
  includeBlockers?: boolean;
  includeNextSteps?: boolean;
  includeProgressPercent?: boolean;
  includeTimeSpent?: boolean;
}

export function generateWhatsAppMessage(
  tasks: Task[],
  profile: SeniorProfile,
  options: FormatOptions = {}
): string {
  const selectedTasks = tasks.filter((t) => t.selectedForUpdate);
  const now = new Date();
  const dateFormatted = formatWhatsAppDate(now);

  const style = options.style ?? profile.preferredStyle ?? 'executive';
  const includeBlockers = options.includeBlockers ?? profile.includeBlockers ?? true;
  const includeNextSteps = options.includeNextSteps ?? profile.includeNextSteps ?? true;
  const includeProgress = options.includeProgressPercent ?? profile.includeProgressPercent ?? true;
  const includeTimeSpent = options.includeTimeSpent ?? profile.includeTimeSpent ?? false;
  const senderName = options.senderName || profile.senderName || 'Your Name';

  // Partition tasks
  const completed = selectedTasks.filter((t) => t.status === 'completed');
  const inProgress = selectedTasks.filter((t) => t.status === 'in_progress');
  const blocked = selectedTasks.filter((t) => t.status === 'blocked');
  const todo = selectedTasks.filter((t) => t.status === 'todo');

  const salutation = profile.salutation.trim() 
    ? profile.salutation.replace('{name}', profile.name || 'Sir')
    : `Hi ${profile.name || 'there'}`;

  const signoff = profile.signoff.trim()
    ? profile.signoff.replace('{sender}', senderName)
    : `Regards,\n${senderName}`;

  if (style === 'standup') {
    // Agile Standup: Done, Doing, Blocked
    const lines: string[] = [];
    lines.push(salutation + ',');
    lines.push('');
    lines.push(`*Daily Progress Standup — ${dateFormatted}*`);
    lines.push('');

    // Done
    lines.push('✅ *Completed:*');
    if (completed.length === 0) {
      lines.push('• _None completed today_');
    } else {
      completed.forEach((t) => {
        const timeNote = includeTimeSpent && t.timeSpentMinutes ? ` (${t.timeSpentMinutes}m)` : '';
        lines.push(`• ${t.title}${timeNote}`);
      });
    }
    lines.push('');

    // Doing / In Progress
    lines.push('⏳ *In Progress:*');
    if (inProgress.length === 0 && todo.length === 0) {
      lines.push('• _No active tasks currently_');
    } else {
      [...inProgress, ...todo].forEach((t) => {
        const progressStr = includeProgress ? ` [${t.progressPercent}%]` : '';
        const step = includeNextSteps && t.nextStep ? ` -> _Next: ${t.nextStep}_` : '';
        lines.push(`• ${t.title}${progressStr}${step}`);
      });
    }
    lines.push('');

    // Blockers
    if (includeBlockers) {
      lines.push('⚠️ *Blockers & Impediments:*');
      if (blocked.length === 0) {
        lines.push('• _No blockers currently. All moving forward smoothly._');
      } else {
        blocked.forEach((t) => {
          const reason = t.blockerReason ? `: ${t.blockerReason}` : '';
          lines.push(`• ${t.title}${reason}`);
        });
      }
      lines.push('');
    }

    if (options.customNote && options.customNote.trim()) {
      lines.push('📌 *Note:*');
      lines.push(options.customNote.trim());
      lines.push('');
    }

    lines.push(signoff);
    return lines.join('\n');
  }

  if (style === 'bullet') {
    // Clean, direct bullet checklist
    const lines: string[] = [];
    lines.push(`${salutation}, here is my quick daily update for *${dateFormatted}*:`);
    lines.push('');

    if (completed.length > 0) {
      lines.push('*Finished Today:*');
      completed.forEach((t) => lines.push(`• [DONE] ${t.title}`));
      lines.push('');
    }

    if (inProgress.length > 0 || todo.length > 0) {
      lines.push('*Active / In Progress:*');
      [...inProgress, ...todo].forEach((t) => {
        const prog = includeProgress ? ` (${t.progressPercent}% done)` : '';
        lines.push(`• [ACTIVE] ${t.title}${prog}`);
      });
      lines.push('');
    }

    if (includeBlockers && blocked.length > 0) {
      lines.push('*Attention / Blockers:*');
      blocked.forEach((t) => {
        const reason = t.blockerReason ? ` - ${t.blockerReason}` : '';
        lines.push(`• [BLOCKED] ${t.title}${reason}`);
      });
      lines.push('');
    }

    if (options.customNote && options.customNote.trim()) {
      lines.push(`*Note:* ${options.customNote.trim()}`);
      lines.push('');
    }

    lines.push(signoff);
    return lines.join('\n');
  }

  if (style === 'detailed') {
    // Detailed end-of-day report
    const lines: string[] = [];
    lines.push(salutation + ',');
    lines.push('');
    lines.push(`*End-of-Day Progress Report | ${dateFormatted}*`);
    lines.push(`_Reported by ${senderName}_`);
    lines.push('────────────────────────');
    lines.push('');

    // Summary count
    const totalWorking = selectedTasks.length;
    lines.push(`📊 *Overview:* ${completed.length}/${totalWorking} tasks completed · ${inProgress.length} active · ${blocked.length} blocked`);
    lines.push('');

    // Completed
    lines.push('*1. Completed Deliverables:*');
    if (completed.length === 0) {
      lines.push('  • _No completed items recorded today._');
    } else {
      completed.forEach((t) => {
        const timeNote = includeTimeSpent && t.timeSpentMinutes ? ` [${t.timeSpentMinutes} mins logged]` : '';
        lines.push(`  ✓ *${t.title}*${timeNote}`);
        if (t.description) lines.push(`    _${t.description}_`);
      });
    }
    lines.push('');

    // In Progress
    lines.push('*2. Work In Progress:*');
    if (inProgress.length === 0 && todo.length === 0) {
      lines.push('  • _No ongoing tasks pending._');
    } else {
      [...inProgress, ...todo].forEach((t) => {
        const prog = includeProgress ? ` — *${t.progressPercent}%*` : '';
        lines.push(`  • *${t.title}*${prog}`);
        if (t.description) lines.push(`    _${t.description}_`);
        if (includeNextSteps && t.nextStep) {
          lines.push(`    Target: ${t.nextStep}`);
        }
      });
    }
    lines.push('');

    // Blockers
    if (includeBlockers && blocked.length > 0) {
      lines.push('*3. Items Requiring Support / Blockers:*');
      blocked.forEach((t) => {
        lines.push(`  ⚠️ *${t.title}*`);
        if (t.blockerReason) {
          lines.push(`    Issue: ${t.blockerReason}`);
        }
      });
      lines.push('');
    }

    // Tomorrow plan
    const tomorrowTasks = tasks.filter((t) => t.nextStep || t.status === 'todo');
    if (includeNextSteps && tomorrowTasks.length > 0) {
      lines.push('*4. Key Priorities for Tomorrow:*');
      tomorrowTasks.slice(0, 3).forEach((t) => {
        lines.push(`  • ${t.nextStep || t.title}`);
      });
      lines.push('');
    }

    if (options.customNote && options.customNote.trim()) {
      lines.push('*Additional Notes:*');
      lines.push(options.customNote.trim());
      lines.push('');
    }

    lines.push('────────────────────────');
    lines.push(signoff);
    return lines.join('\n');
  }

  // Default: Executive Brief
  const lines: string[] = [];
  lines.push(`${salutation},`);
  lines.push('');
  lines.push(`*Daily Progress Update — ${dateFormatted}*`);
  lines.push('');

  // Key Accomplishments
  lines.push('*Key Accomplishments Today:*');
  if (completed.length === 0) {
    lines.push('• Continued focus on active engineering items.');
  } else {
    completed.forEach((t) => {
      const timeNote = includeTimeSpent && t.timeSpentMinutes ? ` (${t.timeSpentMinutes} mins)` : '';
      lines.push(`• ✅ *${t.title}*${timeNote}`);
      if (t.description) {
        lines.push(`   _${t.description}_`);
      }
    });
  }
  lines.push('');

  // Ongoing work
  if (inProgress.length > 0 || todo.length > 0) {
    lines.push('*Current In-Progress Focus:*');
    [...inProgress, ...todo].forEach((t) => {
      const prog = includeProgress ? ` [${t.progressPercent}%]` : '';
      lines.push(`• ⏳ ${t.title}${prog}`);
      if (includeNextSteps && t.nextStep) {
        lines.push(`   _Next milestone: ${t.nextStep}_`);
      }
    });
    lines.push('');
  }

  // Blockers
  if (includeBlockers && blocked.length > 0) {
    lines.push('*Needs Review / Blockers:*');
    blocked.forEach((t) => {
      const reason = t.blockerReason ? `: ${t.blockerReason}` : '';
      lines.push(`• ⚠️ *${t.title}*${reason}`);
    });
    lines.push('');
  }

  // Tomorrow
  const upcomingTasks = tasks.filter((t) => t.status === 'todo' || t.nextStep);
  if (includeNextSteps && upcomingTasks.length > 0) {
    lines.push('*Planned Next:*');
    upcomingTasks.slice(0, 3).forEach((t) => {
      lines.push(`• 🎯 ${t.nextStep || t.title}`);
    });
    lines.push('');
  }

  if (options.customNote && options.customNote.trim()) {
    lines.push(`*Notes:* ${options.customNote.trim()}`);
    lines.push('');
  }

  lines.push(signoff);
  return lines.join('\n');
}

export function buildWhatsAppUrls(phone: string, text: string) {
  const cleanPhone = cleanPhoneNumber(phone);
  const encoded = encodeURIComponent(text);

  // Direct universal wa.me link (works on mobile app and web)
  const universalUrl = cleanPhone 
    ? `https://wa.me/${cleanPhone}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;

  // WhatsApp Web explicit link for desktop browsers
  const webUrl = cleanPhone
    ? `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`
    : `https://web.whatsapp.com/send?text=${encoded}`;

  // Mobile API link
  const apiUrl = cleanPhone
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`
    : `https://api.whatsapp.com/send?text=${encoded}`;

  return { universalUrl, webUrl, apiUrl };
}
