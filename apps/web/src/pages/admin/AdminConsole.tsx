import React, { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { AdminOverviewPage } from './AdminOverviewPage';
import { AdminReportsPage } from './AdminReportsPage';
import { AdminUsersPage } from './AdminUsersPage';
import { AdminAuditLogsPage } from './AdminAuditLogsPage';
import { AdminSystemPage } from './AdminSystemPage';

export interface AdminConsoleProps {
  onNavigateMarketplace: () => void;
}

export function AdminConsole({ onNavigateMarketplace }: AdminConsoleProps) {
  const [currentTab, setCurrentTab] = useState<'OVERVIEW' | 'REPORTS' | 'USERS' | 'AUDIT' | 'SYSTEM'>('OVERVIEW');

  return (
    <AdminLayout
      currentTab={currentTab}
      onTabChange={(tab) => setCurrentTab(tab)}
      onNavigateMarketplace={onNavigateMarketplace}
    >
      {currentTab === 'OVERVIEW' && <AdminOverviewPage />}
      {currentTab === 'REPORTS' && <AdminReportsPage />}
      {currentTab === 'USERS' && <AdminUsersPage />}
      {currentTab === 'AUDIT' && <AdminAuditLogsPage />}
      {currentTab === 'SYSTEM' && <AdminSystemPage />}
    </AdminLayout>
  );
}
