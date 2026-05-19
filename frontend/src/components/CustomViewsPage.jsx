import PMGanttTimeline from './customViews/PMGanttTimeline';
import DowntimeHeatmap from './customViews/DowntimeHeatmap';
import PMChecklistPdf from './customViews/PMChecklistPdf';
import MaintenanceRulesEditor from './customViews/MaintenanceRulesEditor';

export default function CustomViewsPage() {
  return (
    <div data-testid="custom-views-page">
      <div className="page-header">
        <h1><span className="header-icon">🔧</span>Maintenance Views</h1>
        <div className="page-actions" style={{ color: '#94a3b8', fontSize: 13 }}>
          PM scheduling, downtime analytics, checklists, and rules
        </div>
      </div>

      <PMGanttTimeline />
      <DowntimeHeatmap />
      <PMChecklistPdf />
      <MaintenanceRulesEditor />
    </div>
  );
}
