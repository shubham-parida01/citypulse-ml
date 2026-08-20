/**
 * Utility for generating, exporting, and parsing Excel / CSV Reports
 * with Before & After completion status details for municipal admins.
 */

export function generateBeforeAfterExcelReport(complaints, cityObj) {
  const headers = [
    'Ticket Reference ID',
    'Municipal Body',
    'City Ward Location',
    'Issue Category',
    'Priority Level',
    'BEFORE Status',
    'BEFORE Reported Time',
    'BEFORE AI Vision Severity (0-10)',
    'BEFORE Photo Evidence URL',
    'IN-PROGRESS Department',
    'IN-PROGRESS Field Officer',
    'AFTER Completion Status',
    'AFTER Completion Time',
    'AFTER Evidence Photo URL',
    'Total SLA Resolution Time (Hours)'
  ];

  const rows = complaints.map(c => {
    const isComplete = c.status === 'RESOLVED' || c.status === 'CLOSED';
    const isInProgress = c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED';
    const completionStatus = isComplete ? 'COMPLETE' : isInProgress ? 'IN_PROGRESS' : 'NOT_COMPLETE (Awaiting Crew)';
    
    return [
      `"${c.id}"`,
      `"${cityObj.body || 'Municipal Corporation'}"`,
      `"${c.ward || 'General Ward'}"`,
      `"${c.categoryLabel || c.category}"`,
      `"${c.priority}"`,
      `"Reported & AI Classified"`,
      `"${c.reportedAt || '2026-08-20 10:00'}"`,
      `"${c.severity || 8.2}"`,
      `"${c.beforePhoto || 'https://images.unsplash.com/photo-1590496793929-36417d3117de?w=600'}"`,
      `"${c.department || 'Public Works Department'}"`,
      `"${c.officer || 'Suresh Patil (Crew #14)'}"`,
      `"${completionStatus}"`,
      `"${isComplete ? '2026-08-20 18:30' : 'Pending Completion'}"`,
      `"${isComplete ? (c.afterPhoto || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600') : 'Not Available Yet'}"`,
      `"${isComplete ? (c.slaHours || 12.5) : 'In Progress'}"`
    ];
  });

  const csvContent = 'data:text/csv;charset=utf-8,' 
    + headers.join(',') + '\n'
    + rows.map(r => r.join(',')).join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${cityObj.id}_Before_After_Completion_Audit_Report.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function parseExcelCSVImport(text) {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  if (lines.length <= 1) return [];

  const newComplaints = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').trim());
    if (cols.length >= 4) {
      newComplaints.push({
        id: cols[0] || `CP-IMP-${Date.now()}-${i}`,
        category: 'POTHOLE',
        categoryLabel: cols[3] || 'Road & Infrastructure Damage',
        priority: (cols[4] || 'HIGH').toUpperCase(),
        status: (cols[11] || 'AWAITING_REVIEW').toUpperCase().includes('COMPLETE') ? 'RESOLVED' : 'AWAITING_REVIEW',
        severity: 8.0,
        aiConfidence: 0.94,
        ward: cols[2] || 'Ward Central',
        location: cols[2] || 'Main Junction',
        description: 'Imported from Excel Audit Sheet',
        department: cols[9] || 'Municipal PWD',
        reportedAt: cols[6] || new Date().toISOString(),
        officer: cols[10] || 'Unassigned Crew',
        beforePhoto: 'https://images.unsplash.com/photo-1590496793929-36417d3117de?w=600',
        afterPhoto: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600',
      });
    }
  }
  return newComplaints;
}
