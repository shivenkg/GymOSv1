import React from 'react';
import { useGym } from '../context/GymContext';

interface AsyncDataStateProps {
  children: React.ReactNode;
  entityName?: string;
}

export const AsyncDataState: React.FC<AsyncDataStateProps> = ({
  children,
  entityName = 'Records',
}) => {
  const { isLoadingData, dataError, refreshData, toggleDemoMode } = useGym();

  if (isLoadingData) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4 animate-fadeIn">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-2xl animate-spin">
            progress_activity
          </span>
        </div>
        <div className="text-center">
          <h3 className="text-sm font-semibold text-on-surface">Loading {entityName} from Database...</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Querying isolated PostgreSQL schema via verified JWT claims
          </p>
        </div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="my-6 p-6 rounded-2xl bg-error-container/15 border border-error/30 max-w-xl mx-auto space-y-4 text-center">
        <div className="w-10 h-10 rounded-xl bg-error/20 text-error flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-xl">database_off</span>
        </div>
        <div>
          <h3 className="text-sm font-bold text-on-surface">Database Sync Error</h3>
          <p className="text-xs text-on-surface-variant font-mono mt-1">{dataError}</p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            onClick={() => refreshData()}
            className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-xs font-semibold text-on-surface transition-colors cursor-pointer border border-outline-variant/40"
          >
            Retry Connection
          </button>
          <button
            onClick={() => toggleDemoMode(true)}
            className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Switch to Demo Mode
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
