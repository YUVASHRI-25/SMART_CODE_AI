import React, { useState } from 'react';
import { AppSettings } from '../types/debugger';
import { Settings, X, Check, Cpu, Key, Shield, HelpCircle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-800 text-sm">System & AI Settings</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
          {/* AI Provider Section */}
          <div className="space-y-2">
            <label className="block font-bold uppercase tracking-wider text-slate-700 text-[11px]">
              AI Reasoning Engine
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-lg border cursor-pointer flex flex-col gap-1 transition-all ${
                  formData.aiProvider === 'openrouter'
                    ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">OpenRouter</span>
                  <input
                    type="radio"
                    name="aiProvider"
                    checked={formData.aiProvider === 'openrouter'}
                    onChange={() => setFormData({ ...formData, aiProvider: 'openrouter' })}
                    className="text-blue-600"
                  />
                </div>
                <span className="text-[11px] text-slate-500">
                  Qwen2.5 Coder 32B Instruct through OpenRouter API
                </span>
                <span className="text-[10px] text-slate-400 font-mono mt-1">
                  Env Key: {formData.hasOpenRouterKey ? 'Configured' : 'Needs OPENROUTER_API_KEY'}
                </span>
              </label>

              <label
                className={`p-3 rounded-lg border cursor-pointer flex flex-col gap-1 transition-all ${
                  formData.aiProvider === 'gemini'
                    ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Google Gemini</span>
                  <input
                    type="radio"
                    name="aiProvider"
                    checked={formData.aiProvider === 'gemini'}
                    onChange={() => setFormData({ ...formData, aiProvider: 'gemini' })}
                    className="text-blue-600"
                  />
                </div>
                <span className="text-[11px] text-slate-500">
                  Gemini 3.8 Flash with structured schema extraction
                </span>
                <span className="text-[10px] text-emerald-600 font-medium mt-1">
                  Available in AI Studio
                </span>
              </label>
            </div>
          </div>

          {/* Model ID */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              OpenRouter Target Model ID
            </label>
            <input
              type="text"
              value={formData.openRouterModel}
              onChange={(e) => setFormData({ ...formData, openRouterModel: e.target.value })}
              placeholder="qwen/qwen-2.5-coder-32b-instruct"
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Default: <code className="font-mono">qwen/qwen-2.5-coder-32b-instruct</code>
            </p>
          </div>

          {/* Preferences */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-800">Automated Validation</div>
                <div className="text-[11px] text-slate-500">
                  Run syntax AST checks & unit test simulations immediately upon receiving fixes
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.autoValidateOnFix}
                onChange={(e) => setFormData({ ...formData, autoValidateOnFix: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Monaco Editor Default Font Size ({formData.editorFontSize}px)
              </label>
              <input
                type="range"
                min="12"
                max="20"
                value={formData.editorFontSize}
                onChange={(e) =>
                  setFormData({ ...formData, editorFontSize: parseInt(e.target.value, 10) })
                }
                className="w-full accent-blue-600"
              />
            </div>
          </div>

          {/* Key Notice */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2 text-[11px] text-slate-600">
            <Shield className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <span>
              Security Note: API keys are maintained strictly in server-side environment variables
              and are never exposed to the client bundle or saved in session history.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium flex items-center gap-1.5 shadow-xs"
            >
              {savedNotice ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Settings</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
