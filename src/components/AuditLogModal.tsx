import React, { useState } from 'react';
import { AuditLog } from '../types';
import { History, Search, Clock, ArrowRight, Trash2 } from 'lucide-react';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLog[];
  onClearLogs?: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.title.toLowerCase().includes(term) ||
      log.description.toLowerCase().includes(term) ||
      (log.oldValue && log.oldValue.toLowerCase().includes(term)) ||
      (log.newValue && log.newValue.toLowerCase().includes(term))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">ประวัติการเปลี่ยนแปลงข้อมูล</h3>
              <p className="text-xs text-slate-400">บันทึกการแก้ไข ย้อนดูประวัติที่เคยเปลี่ยนแปลง</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="py-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาประวัติการแก้ไข..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Logs List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              ยังไม่มีประวัติการแก้ไขข้อมูล
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-semibold text-white">{log.title}</span>
                  <span className="text-[11px] font-mono text-slate-500">{log.timestamp}</span>
                </div>

                <p className="text-slate-300 text-[11px] leading-relaxed">{log.description}</p>

                {log.oldValue && log.newValue && (
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] flex items-center gap-2">
                    <span className="text-rose-400 line-through truncate max-w-[45%]">
                      {log.oldValue}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="text-emerald-400 font-bold truncate max-w-[45%]">
                      {log.newValue}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 mt-2">
          {onClearLogs && logs.length > 0 ? (
            <button
              onClick={onClearLogs}
              className="text-[11px] text-slate-400 hover:text-rose-400 transition cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>ล้างประวัติทั้งหมด</span>
            </button>
          ) : (
            <div></div>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-semibold cursor-pointer"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
