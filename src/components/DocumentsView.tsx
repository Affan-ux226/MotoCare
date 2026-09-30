import React, { useState } from 'react';
import { MotorcycleProfile, VehicleDocument, DocumentType } from '../types';
import { calculateDocumentStatus } from '../utils/calculations';
import {
  FileText,
  Plus,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Clock,
  Trash2,
  ExternalLink,
  Upload,
  CheckCircle,
  Building,
} from 'lucide-react';

interface DocumentsViewProps {
  bike: MotorcycleProfile;
  documents: VehicleDocument[];
  onAddDocument: (doc: Omit<VehicleDocument, 'id'>) => void;
  onDeleteDocument: (id: string) => void;
  onRenewDocument: (id: string, newExpiryDate: string, cost: number) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  bike,
  documents,
  onAddDocument,
  onDeleteDocument,
  onRenewDocument,
}) => {
  const bikeDocs = documents.filter((d) => d.bikeId === bike.id || !d.bikeId);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [renewingDoc, setRenewingDoc] = useState<VehicleDocument | null>(null);
  const [renewExpiryDate, setRenewExpiryDate] = useState('');
  const [renewCost, setRenewCost] = useState('324');

  // Form states for new document
  const [type, setType] = useState<DocumentType>('prb');
  const [title, setTitle] = useState('พ.ร.บ. คุ้มครองผู้ประสบภัยจากรถ');
  const [expiryDate, setExpiryDate] = useState('2027-02-15');
  const [policyNumber, setPolicyNumber] = useState('');
  const [provider, setProvider] = useState('บมจ.วิริยะประกันภัย');
  const [cost, setCost] = useState('324');
  const [notes, setNotes] = useState('');

  const handleTypeSelect = (selectedType: DocumentType) => {
    setType(selectedType);
    if (selectedType === 'prb') {
      setTitle('พ.ร.บ. คุ้มครองผู้ประสบภัยจากรถ');
      setCost('324');
    } else if (selectedType === 'tax') {
      setTitle('ภาษีประจำปี (ป้ายวงกลม)');
      setCost('100');
    } else if (selectedType === 'insurance') {
      setTitle('ประกันภัยรถมอเตอร์ไซค์ ภาคสมัครใจ 2+');
      setCost('1690');
    } else {
      setTitle('เอกสารอื่นๆ');
      setCost('0');
    }
  };

  const handleSubmitNewDoc = (e: React.FormEvent) => {
    e.preventDefault();
    onAddDocument({
      bikeId: bike.id,
      type,
      title,
      expiryDate,
      policyNumber,
      provider,
      cost: Number(cost) || 0,
      notes,
    });
    setIsAddModalOpen(false);
  };

  const handleConfirmRenew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewingDoc) return;
    onRenewDocument(renewingDoc.id, renewExpiryDate, Number(renewCost) || 0);
    setRenewingDoc(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#15191E] p-6 rounded-3xl border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              เอกสารเกี่ยวกับรถ & การแจ้งเตือน
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            บันทึกวันหมดอายุ พ.ร.บ., ภาษีประจำปี (ป้ายวงกลม) และกรมธรรม์ประกันภัย พร้อมแจ้งเตือนล่วงหน้า
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 transition cursor-pointer self-start sm:self-center shrink-0"
          title="เพิ่มเอกสารใหม่ (＋)"
          aria-label="เพิ่มเอกสารใหม่"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Documents Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bikeDocs.map((doc) => {
          const docStatus = calculateDocumentStatus(doc);
          const isExpired = docStatus.status === 'expired';
          const isWarning = docStatus.status === 'warning';

          return (
            <div
              key={doc.id}
              className={`p-5 rounded-3xl bg-[#15191E] border transition shadow-md flex flex-col justify-between ${
                isExpired
                  ? 'border-rose-500/50 hover:border-rose-400'
                  : isWarning
                  ? 'border-amber-500/50 hover:border-amber-400'
                  : 'border-slate-800 hover:border-blue-500/40'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-slate-850 flex items-center justify-center border border-slate-800 shrink-0">
                      <FileText className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">{doc.title}</h3>
                      <span className="text-[11px] text-slate-400 block">
                        {doc.provider || 'กรมการขนส่งทางบก'}
                      </span>
                    </div>
                  </div>

                  {isExpired ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[11px] font-bold border border-rose-500/40">
                      🔴 หมดอายุแล้ว
                    </span>
                  ) : isWarning ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/40">
                      🟡 ใกล้หมดอายุ
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/40">
                      🟢 ใช้งานได้
                    </span>
                  )}
                </div>

                {/* Expiry Box */}
                <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 mb-3 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">วันหมดอายุ:</span>
                    <strong className="text-white font-mono">{docStatus.formattedDate}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">สถานะคงเหลือ:</span>
                    <strong
                      className={`font-semibold ${
                        isExpired
                          ? 'text-rose-400'
                          : isWarning
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {docStatus.label}
                    </strong>
                  </div>
                  {doc.policyNumber && (
                    <div className="flex justify-between items-center text-slate-500 text-[11px]">
                      <span>เลขที่กรมธรรม์:</span>
                      <span className="font-mono text-slate-300 truncate max-w-[130px]">
                        {doc.policyNumber}
                      </span>
                    </div>
                  )}
                  {doc.cost && (
                    <div className="flex justify-between items-center text-slate-500 text-[11px]">
                      <span>ค่าธรรมเนียม:</span>
                      <span className="font-mono text-slate-300">฿{doc.cost.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {doc.notes && (
                  <p className="text-[11px] text-slate-400 mb-3">{doc.notes}</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setRenewingDoc(doc);
                    // default 1 year later
                    const nextYear = new Date(doc.expiryDate);
                    nextYear.setFullYear(nextYear.getFullYear() + 1);
                    setRenewExpiryDate(nextYear.toISOString().split('T')[0]);
                    setRenewCost(String(doc.cost || 324));
                  }}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-600/30 transition cursor-pointer shrink-0"
                  title="ต่ออายุเอกสาร"
                  aria-label="ต่ออายุเอกสาร"
                >
                  <Calendar className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteDocument(doc.id)}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-slate-850 hover:bg-[#EF4444]/20 text-[#EF4444] border border-slate-700/80 flex items-center justify-center transition cursor-pointer shrink-0"
                  title="ลบเอกสารนี้ (🗑️)"
                  aria-label="ลบเอกสารนี้"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* RENEW MODAL */}
      {renewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <form
            onSubmit={handleConfirmRenew}
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                ต่ออายุ: {renewingDoc.title}
              </h3>
              <button
                type="button"
                onClick={() => setRenewingDoc(null)}
                className="text-slate-400 hover:text-white text-lg p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  วันหมดอายุรอบใหม่ *
                </label>
                <input
                  type="date"
                  required
                  value={renewExpiryDate}
                  onChange={(e) => setRenewExpiryDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  ค่าใช้จ่ายในการต่ออายุ (บาท)
                </label>
                <input
                  type="number"
                  required
                  value={renewCost}
                  onChange={(e) => setRenewCost(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setRenewingDoc(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
              >
                บันทึกการต่ออายุ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD DOCUMENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSubmitNewDoc}
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">เพิ่มเอกสารรถ</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">ประเภทเอกสาร</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleTypeSelect('prb')}
                    className={`py-2 px-2 rounded-xl border text-center font-medium transition cursor-pointer ${
                      type === 'prb'
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-950 border-slate-700 text-slate-300'
                    }`}
                  >
                    พ.ร.บ.
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeSelect('tax')}
                    className={`py-2 px-2 rounded-xl border text-center font-medium transition cursor-pointer ${
                      type === 'tax'
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-950 border-slate-700 text-slate-300'
                    }`}
                  >
                    ภาษี (ป้ายวงกลม)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeSelect('insurance')}
                    className={`py-2 px-2 rounded-xl border text-center font-medium transition cursor-pointer ${
                      type === 'insurance'
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-950 border-slate-700 text-slate-300'
                    }`}
                  >
                    ประกันภัย
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">ชื่อเอกสาร *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">วันหมดอายุ *</label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">บริษัท / ผู้ให้บริการ</label>
                  <input
                    type="text"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ค่าต่ออายุ (บาท)</label>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">เลขที่กรมธรรม์ / หมายเหตุ</label>
                <input
                  type="text"
                  placeholder="เช่น เลขที่ PRB-xxxx"
                  value={policyNumber}
                  onChange={(e) => setPolicyNumber(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
              >
                บันทึกเอกสาร
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
