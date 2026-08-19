import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { logClientError } from '../services/monitoringService';

interface State { hasError: boolean; }
export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(): State { return { hasError: true }; }
  componentDidCatch(error: unknown, info: React.ErrorInfo) { console.error('MarketPulse runtime error', error, info); void logClientError(error instanceof Error ? new Error(`${error.message}\n${info.componentStack || ''}`) : error, 'react-boundary'); }
  render() {
    if (!this.state.hasError) return this.props.children;
    return <div className="min-h-screen bg-[#f8f9ff] dark:bg-[#121c2a] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-[#182232] rounded-3xl border border-[#bdcabe]/40 dark:border-[#2d3e58] p-7 text-center shadow-xl">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center"><AlertTriangle className="w-6 h-6"/></div>
        <h1 className="text-xl font-bold mt-4">MarketPulse hit an unexpected error</h1>
        <p className="text-sm text-[#6e7a70] mt-2">Your account and verified database records are not changed by this screen. Reload the app to recover.</p>
        <button onClick={()=>window.location.reload()} className="mt-5 px-5 py-3 rounded-xl bg-[#008751] text-white text-sm font-bold inline-flex items-center gap-2"><RefreshCw className="w-4 h-4"/>Reload MarketPulse</button>
      </div>
    </div>;
  }
}
