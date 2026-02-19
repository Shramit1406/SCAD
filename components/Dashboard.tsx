
import React, { useState } from 'react';
import type { Company } from '../types';
import { Node } from '../App';
import MetricTree from './MetricTree';
import NetworkGraph from './NetworkGraph';
import Tabs from './Tabs';
import SummaryView from './SummaryView';
import ControlAndPredictionPanel from './ControlAndPredictionPanel';
import ForecastView from './ForecastView';
import ScenarioControl from './ScenarioControl';
import { BackArrowIcon } from './Icons';

interface DashboardProps {
  company: Company;
  onSelectNode: (node: Node) => void;
  onBack: () => void;
  dispatch: React.Dispatch<any>; // Using any for simplicity with reducer actions
}

const Dashboard: React.FC<DashboardProps> = ({
  company,
  onSelectNode,
  onBack,
  dispatch,
}) => {
  const [activeTab, setActiveTab] = useState('Chain Flow');
  const tabs = ['Chain Flow', 'Overall Performance', 'Data Summary', 'Live Controls', 'Analytics & Forecasts'];

  const renderTabContent = () => {
    const animationWrapperClass = "mt-6";
    switch (activeTab) {
      case 'Overall Performance':
        return (
          <div className={`${animationWrapperClass} max-w-4xl mx-auto`}>
            {/* FIX: Removed 'data' prop as it's not defined in MetricTreeProps. */}
            <MetricTree 
              metrics={company.data.networkMetrics} 
              scenario={company.scenario} 
              title="Overall Network KPIs" 
            />
          </div>
        );
      case 'Data Summary':
        return <div className={animationWrapperClass}><SummaryView data={company.data} /></div>;
      case 'Live Controls':
        return <div className={animationWrapperClass}><ControlAndPredictionPanel company={company} dispatch={dispatch} /></div>;
      case 'Analytics & Forecasts':
        return <div className={animationWrapperClass}><ForecastView company={company} /></div>;
      case 'Chain Flow':
      default:
        return (
            <div className={animationWrapperClass}>
              <NetworkGraph
                  company={company}
                  onSelectNode={onSelectNode}
                  dispatch={dispatch}
              />
            </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">{company.name}</h2>
              <p className="text-slate-500 mt-1">{company.description}</p>
            </div>
            <button onClick={onBack} className="bg-white hover:bg-slate-50 text-slate-700 font-semibold py-2 px-4 rounded-lg border border-slate-300 transition-all duration-200 shadow-sm flex items-center gap-2 self-start sm:self-center hover:shadow-md hover:border-slate-400">
              <BackArrowIcon />
              Change Company
            </button>
        </div>

        {activeTab === 'Chain Flow' && <ScenarioControl company={company} dispatch={dispatch} />}
        
        <Tabs tabs={tabs} activeTab={activeTab} onTabClick={setActiveTab} />

        <div>
            {renderTabContent()}
        </div>
    </div>
  );
};

export default Dashboard;