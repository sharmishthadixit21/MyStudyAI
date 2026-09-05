/**
 * AuraSpace Error Monitor & Real-Time Crash Diagnostic System
 * Automatically catches uncaught runtime errors, unhandled rejections, and network faults.
 * Saves detailed traces to localStorage and enables 1-click export for instant AI debugging.
 */

class ErrorMonitor {
  constructor() {
    this.storageKey = 'aura_system_error_logs';
    this.maxLogs = 50;
    this.logs = this.loadLogs();
    this.initHandlers();
  }

  loadLogs() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey)) || [];
    } catch (e) {
      return [];
    }
  }

  saveLogs() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.logs.slice(-this.maxLogs)));
    } catch (e) {
      console.warn("Could not save error logs to localStorage:", e);
    }
  }

  initHandlers() {
    // Window global runtime error
    window.onerror = (message, source, lineno, colno, error) => {
      this.recordError({
        type: 'Runtime Error',
        message: String(message),
        source: source || 'inline/script',
        lineno: lineno || 0,
        colno: colno || 0,
        stack: error ? error.stack : 'No stack trace',
        timestamp: new Date().toISOString()
      });
      return false; // Let default browser console also see it
    };

    // Unhandled Promise Rejection (Fetch errors, Async fails)
    window.onunhandledrejection = (event) => {
      const reason = event.reason;
      this.recordError({
        type: 'Unhandled Promise Rejection',
        message: reason ? (reason.message || String(reason)) : 'Promise rejected with no reason',
        stack: (reason && reason.stack) ? reason.stack : 'No stack trace',
        timestamp: new Date().toISOString()
      });
    };
  }

  recordError(errorObj) {
    const errorRecord = {
      id: 'err_' + Date.now() + '_' + Math.floor(Math.random()*1000),
      appVersion: 'AuraSpace v2.0-Desktop',
      theme: localStorage.getItem('aura_theme') || 'dark',
      userAgent: navigator.userAgent,
      ...errorObj
    };

    this.logs.push(errorRecord);
    this.saveLogs();
    this.showToastNotification(errorRecord);

    // Update UI if diagnostics modal is currently open
    if (typeof renderDiagnosticsList === 'function') {
      renderDiagnosticsList();
    }
  }

  showToastNotification(errorRecord) {
    let toast = document.getElementById('aura-error-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'aura-error-toast';
      toast.style.cssText = `
        position: fixed; bottom: 24px; right: 24px; z-index: 999999;
        background: rgba(30, 15, 20, 0.95); border: 1px solid rgba(239, 68, 68, 0.6);
        color: #fca5a5; padding: 14px 20px; border-radius: 16px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.6); backdrop-filter: blur(16px);
        font-family: 'Outfit', sans-serif; font-size: 0.9rem; max-width: 380px;
        display: flex; flex-direction: column; gap: 8px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      `;
      document.body.appendChild(toast);
    }

    toast.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <strong style="color:#ef4444; display:flex; align-items:center; gap:6px;">⚠️ Bug/Issue Detected</strong>
        <span style="cursor:pointer; font-size:1.1rem; color:#cbd5e1;" onclick="document.getElementById('aura-error-toast').style.display='none'">✕</span>
      </div>
      <p style="margin:0; font-size:0.82rem; color:#cbd5e1; word-break:break-word;">${errorRecord.message}</p>
      <div style="display:flex; gap:8px; margin-top:4px;">
        <button style="background:rgba(239,68,68,0.25); border:1px solid rgba(239,68,68,0.5); color:#fca5a5; padding:4px 10px; border-radius:8px; cursor:pointer; font-size:0.75rem;" onclick="openDiagnosticsModal()">View Diagnostics</button>
        <button style="background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; padding:4px 10px; border-radius:8px; cursor:pointer; font-size:0.75rem;" onclick="copySingleError('${errorRecord.id}')">Copy Error</button>
      </div>
    `;

    toast.style.display = 'flex';
    setTimeout(() => {
      if (toast) toast.style.display = 'none';
    }, 8000);
  }

  getLogs() {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
    localStorage.removeItem(this.storageKey);
  }

  exportFormattedMarkdown() {
    if (this.logs.length === 0) {
      return "### AuraSpace Diagnostics Log\nNo errors or crashes detected. System is running cleanly! ✨";
    }

    let md = `### AuraSpace Error Diagnostics Export (${new Date().toLocaleString()})\n`;
    md += `**Total Errors Recorded**: ${this.logs.length}\n\n`;
    
    this.logs.forEach((err, idx) => {
      md += `#### ${idx + 1}. [${err.type}] - ${err.timestamp}\n`;
      md += `- **Message**: \`${err.message}\`\n`;
      if (err.source) md += `- **Source**: \`${err.source}:${err.lineno}:${err.colno}\`\n`;
      md += `\`\`\`\n${err.stack || 'No stack trace available'}\n\`\`\`\n\n`;
    });

    return md;
  }
}

// Global Singleton
window.auraErrorMonitor = new ErrorMonitor();

window.copySingleError = function(id) {
  const err = (window.auraErrorMonitor.getLogs() || []).find(e => e.id === id);
  if (err) {
    navigator.clipboard.writeText(JSON.stringify(err, null, 2));
    alert("Error details copied to clipboard!");
  }
};
