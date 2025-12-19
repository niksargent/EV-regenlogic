import React, { useState, useEffect, useMemo } from 'react';
import { InputControl, ToggleControl } from './components/InputControl';
import { Charts } from './components/Charts';
import { runSimulation } from './utils/simulation';
import { DEFAULT_PARAMS } from './constants';
import { SimulationParams } from './types';
import { analyzeSimulation } from './services/geminiService';
import { Zap, Wind, Settings, PlayCircle, Info, BrainCircuit, AlertTriangle, ExternalLink } from 'lucide-react';

const App: React.FC = () => {
  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Detect if running in an environment with an API Key (e.g. Google AI Studio)
  const isAiAvailable = useMemo(() => {
    return !!process.env.API_KEY && process.env.API_KEY !== '';
  }, []);

  // Run simulation whenever params change
  const results = useMemo(() => runSimulation(params), [params]);

  const handleParamChange = (key: keyof SimulationParams, value: number | boolean) => {
    setParams(prev => ({ ...prev, [key]: value }));
    setAnalysis(null); // Reset analysis on param change
  };

  const handleAnalyze = async () => {
    if (!isAiAvailable) return;
    setIsAnalyzing(true);
    const resultText = await analyzeSimulation(params, results);
    setAnalysis(resultText);
    setIsAnalyzing(false);
  };

  const isCoastingShort = !results.summary.didReachTargetA;
  const netSave = results.summary.energyB - results.summary.energyA; 

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent flex items-center gap-3">
            <Zap className="w-8 h-8 text-cyan-400" />
            EV Regen vs Coast Simulator
          </h1>
          <p className="text-slate-400 mt-2 max-w-2xl">
            Compare the physics and energy efficiency of coasting to a stop versus maintaining speed and using regenerative braking.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Controls */}
        <section className="lg:col-span-4 space-y-6">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-700 pb-4">
              <Settings className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-semibold text-white">Simulation Parameters</h2>
            </div>
            
            <div className="space-y-1">
              <InputControl
                label="Initial Speed"
                value={params.initialSpeed}
                min={20}
                max={150}
                step={5}
                unit="km/h"
                onChange={(v) => handleParamChange('initialSpeed', v)}
              />
              <InputControl
                label="Target Distance"
                value={params.distance}
                min={100}
                max={2000}
                step={50}
                unit="m"
                onChange={(v) => handleParamChange('distance', v)}
                description="Distance to the traffic light/stop sign."
              />
              <InputControl
                label="Vehicle Mass"
                value={params.mass}
                min={1000}
                max={3000}
                step={50}
                unit="kg"
                onChange={(v) => handleParamChange('mass', v)}
              />
              <InputControl
                label="Drag Coefficient (Cd)"
                value={params.dragCoefficient}
                min={0.15}
                max={0.45}
                step={0.01}
                unit=""
                onChange={(v) => handleParamChange('dragCoefficient', v)}
              />
              <InputControl
                label="Regen Efficiency"
                value={Math.round(params.regenEfficiency * 100)}
                min={40}
                max={95}
                step={5}
                unit="%"
                onChange={(v) => handleParamChange('regenEfficiency', v / 100)}
              />
              <hr className="border-slate-700 my-4" />
              <InputControl
                label="Braking Distance"
                value={params.brakingDistance}
                min={10}
                max={300}
                step={10}
                unit="m"
                onChange={(v) => handleParamChange('brakingDistance', v)}
                description="Distance to apply regen at the end."
              />
              
              <ToggleControl
                label="Enable Regen for Strategy A"
                checked={params.applyRegenToStrategyA}
                onChange={(v) => handleParamChange('applyRegenToStrategyA', v)}
                description="If enabled, Strategy A will also use regen from the braking distance point if it hasn't stopped yet."
              />
            </div>
          </div>

          {/* Analysis Button */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
             <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-purple-400" />
                AI Insights
             </h2>
             
             {!isAiAvailable && (
                <div className="mb-4 p-3 bg-amber-900/30 border border-amber-800 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <p className="text-xs text-amber-200">
                    AI Analysis is only available when running in <strong>Google AI Studio</strong>. 
                  </p>
                </div>
             )}

             <p className="text-sm text-slate-400 mb-4">
               Get an expert analysis of these simulation results using Gemini.
             </p>
             
             {analysis ? (
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-600 text-sm leading-relaxed text-slate-300 animate-in fade-in duration-500">
                  <div className="font-mono text-xs text-purple-400 mb-2">GEMINI ANALYSIS:</div>
                  {analysis}
                  <button 
                    onClick={() => setAnalysis(null)} 
                    className="mt-3 text-xs text-slate-500 hover:text-white underline"
                  >
                    Clear
                  </button>
                </div>
             ) : (
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !isAiAvailable}
                  className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                    (isAnalyzing || !isAiAvailable)
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed grayscale' 
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-900/20'
                  }`}
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze with Gemini'}
                  {!isAnalyzing && <Zap className="w-4 h-4" />}
                </button>
             )}
          </div>
        </section>

        {/* Right Column: Results */}
        <section className="lg:col-span-8 space-y-6">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className={`p-5 rounded-xl border shadow-lg transition-all ${isCoastingShort ? 'bg-red-900/20 border-red-800' : 'bg-slate-800 border-slate-700'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-200 flex items-center gap-2">
                    <Wind className="w-4 h-4 text-cyan-400" /> 
                    Strategy A: Coast {params.applyRegenToStrategyA ? '+ Regen' : ''}
                  </h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300">Baseline</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-sm">Net Energy Used:</span>
                    <span className={`font-mono font-bold ${results.summary.energyA < 0 ? 'text-green-400' : 'text-cyan-400'}`}>
                        {results.summary.energyA.toFixed(2)} Wh
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-sm">Time:</span>
                    <span className="text-slate-200 font-mono">{results.summary.timeA.toFixed(1)} s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-sm">Distance:</span>
                    <span className={`font-mono ${isCoastingShort ? 'text-red-400 font-bold' : 'text-slate-200'}`}>
                      {results.summary.finalDistanceA.toFixed(0)} m
                    </span>
                  </div>
                  {isCoastingShort && (
                    <div className="mt-2 text-xs text-red-400 flex items-start gap-1">
                      <AlertTriangle className="w-3 h-3 mt-0.5" />
                      Stops short of target!
                    </div>
                  )}
                  {params.applyRegenToStrategyA && results.summary.energyA < -0.1 && (
                      <div className="mt-2 text-xs text-green-400 flex items-start gap-1">
                        <Zap className="w-3 h-3 mt-0.5" />
                        Reclaimed {Math.abs(results.summary.energyA).toFixed(2)} Wh via regen!
                      </div>
                  )}
                </div>
             </div>

             <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-200 flex items-center gap-2">
                    <PlayCircle className="w-4 h-4 text-purple-400" /> Strategy B: Regen
                  </h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-900/50 text-purple-200 border border-purple-700/50">Aggressive</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-sm">Net Energy Used:</span>
                    <span className="text-purple-400 font-mono font-bold">{results.summary.energyB.toFixed(2)} Wh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-sm">Time:</span>
                    <span className="text-slate-200 font-mono">{results.summary.timeB.toFixed(1)} s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-sm">Energy Comparison:</span>
                    <span className={`font-mono font-bold ${netSave > 0 ? 'text-red-400' : 'text-green-400'}`}>
                       {netSave > 0 ? `+${netSave.toFixed(2)} Wh more used` : `${netSave.toFixed(2)} Wh saved`}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-purple-300/70">
                     Uses energy to maintain speed, then recovers {(results.strategyB[results.strategyB.length - 1].energyNet - Math.min(...results.strategyB.map(s => s.energyNet))).toFixed(1)} J via regen.
                  </div>
                </div>
             </div>
          </div>

          <Charts results={results} targetDistance={params.distance} />
          
          <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-800/50 text-sm text-blue-200 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Physics Note:</strong> Strategy A (Coasting) is almost always more efficient because converting Kinetic Energy to Electricity and back to Chemical Energy involves losses. Coasting uses the Kinetic Energy directly to overcome drag (100% mechanical efficiency). Strategy B trades energy for time.
            </p>
          </div>

        </section>
      </main>
      
      <footer className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
        <p>Built for GitHub Pages with Vite. Physics simulation calculates aero drag, rolling resistance, and regen recovery.</p>
      </footer>
    </div>
  );
};

export default App;