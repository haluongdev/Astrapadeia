import React, { useState, useEffect } from 'react';
import {
  Crown,
  Sparkles,
  Check,
  X,
  CreditCard,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Clock,
  RotateCcw,
  Receipt,
  Tag,
  Copy,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Download,
  Printer,
  ExternalLink,
  Zap,
  Building2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { INITIAL_VIP_PLANS, MOCK_PAYMENT_CONFIG } from '../data/mockData';
import { Transaction } from '../types';
import confetti from 'canvas-confetti';

interface VIPPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VIPPaymentModal: React.FC<VIPPaymentModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    purchaseVIP,
    transactions,
    requestRefund,
    createPendingQRTransaction,
    simulateScanAndPay
  } = useApp();

  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan-galaxy');
  const [paymentMethod, setPaymentMethod] = useState<'vietqr' | 'momo' | 'zalopay' | 'vnpay'>('vietqr');
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponApplied, setCouponApplied] = useState<boolean>(false);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'plans' | 'qr_checkout' | 'history' | 'invoice'>('plans');

  // Pending QR payment state
  const [activeQRTransaction, setActiveQRTransaction] = useState<Transaction | null>(null);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(900); // 15 mins
  const [isScanningSimulation, setIsScanningSimulation] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<number>(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Selected transaction for invoice view
  const [selectedInvoiceTxn, setSelectedInvoiceTxn] = useState<Transaction | null>(null);

  // Refund modal state
  const [refundTxnId, setRefundTxnId] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState<string>('');
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; text: string } | null>(null);
  const [modalNotice, setModalNotice] = useState<string | null>(null);

  // 15-minute countdown for QR
  useEffect(() => {
    if (activeTab !== 'qr_checkout' || !activeQRTransaction) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTab, activeQRTransaction]);

  if (!isOpen) return null;

  const currentPlan = INITIAL_VIP_PLANS.find(p => p.id === selectedPlanId) || INITIAL_VIP_PLANS[1];

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'SCHOLYX2026' || code === 'SCHOLYX2027' || code === 'SCHOLYXVIP') {
      const disc = Math.round(currentPlan.priceVND * 0.2);
      setDiscountAmount(disc);
      setCouponApplied(true);
      setCouponFeedback({ success: true, text: `Áp dụng mã ${code} thành công: Giảm ngay 20%!` });
    } else if (code === 'VIP50') {
      setDiscountAmount(50000);
      setCouponApplied(true);
      setCouponFeedback({ success: true, text: 'Áp dụng mã VIP50 thành công: Giảm ngay 50.000đ!' });
    } else {
      setCouponFeedback({ success: false, text: 'Mã giảm giá không hợp lệ hoặc đã hết hạn.' });
    }
  };

  const finalPrice = Math.max(0, currentPlan.priceVND - discountAmount);

  // Launch QR Code Checkout
  const handleStartQRCheckout = async () => {
    const txn = await createPendingQRTransaction(selectedPlanId, paymentMethod, couponCode);
    setActiveQRTransaction(txn);
    setTimeLeftSeconds(900);
    setActiveTab('qr_checkout');
  };

  // Simulate Instant Wallet Scan & Approval
  const handleSimulateWalletScan = async () => {
    if (!activeQRTransaction) return;
    setIsScanningSimulation(true);
    setScanStep(1); // "App MoMo/Ngân hàng đang quét mã..."

    setTimeout(() => {
      setScanStep(2); // "Xác thực thanh toán..."
    }, 700);

    setTimeout(async () => {
      setScanStep(3); // "Ngân hàng ghi nhận thành công!"
      await simulateScanAndPay(activeQRTransaction.id);
      setIsScanningSimulation(false);
      setScanStep(0);

      try {
        confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
      } catch (e) {}

      // Find updated transaction for invoice
      const updatedTxn = {
        ...activeQRTransaction,
        status: 'success' as const,
        completedAt: new Date().toLocaleString('vi-VN')
      };
      setSelectedInvoiceTxn(updatedTxn);
      setActiveTab('invoice');
    }, 1700);
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleViewInvoice = (txn: Transaction) => {
    setSelectedInvoiceTxn(txn);
    setActiveTab('invoice');
  };

  const handleConfirmRefund = () => {
    if (!refundTxnId || !refundReason.trim()) return;
    requestRefund(refundTxnId, refundReason);
    setModalNotice('Yêu cầu hoàn tiền đã được gửi đến ban quản trị QTV xét duyệt theo chính sách!');
    setRefundTxnId(null);
    setRefundReason('');
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-4xl p-6 sm:p-8 rounded-3xl cosmic-card border border-amber-500/40 relative animate-fadeIn my-auto max-h-[92vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition interactive-bounce"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Sandbox Simulation Disclaimer Banner */}
        <div className="mb-5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-left">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200 leading-relaxed">
            <span className="font-bold text-amber-300 uppercase tracking-wide">Môi Trường Thử Nghiệm Sandbox (Demo):</span>{' '}
            Tất cả gói đăng ký, mã VietQR và mô phỏng giao dịch tại đây chỉ phục vụ kiểm thử và nghiệm thu chức năng thanh toán của Scholyx. Hệ thống <span className="underline font-bold text-white">không thực hiện trừ tiền thật</span> và không yêu cầu thông tin thẻ ngân hàng thật.
          </div>
        </div>

        {/* Modal Header */}
        <div className="text-center max-w-xl mx-auto space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Đặc Quyền Vũ Trụ SCHOLYX VIP</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-space">
            Nâng Tầm Điểm Số Với Gói VIP Chuyên Nghiệp
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Mở khóa toàn bộ ngân hàng đề THPT chuẩn chương trình GDPT 2018, Trợ lý AI Cosmos không giới hạn, và nhận ngay +1,500 Điểm Chiến Lực!
          </p>

          {/* Navigation Tabs in Modal */}
          <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'plans'
                  ? 'bg-amber-400 text-slate-950 font-extrabold shadow-lg shadow-amber-400/20'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              Chọn Gói VIP
            </button>
            {activeQRTransaction && (
              <button
                onClick={() => setActiveTab('qr_checkout')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'qr_checkout'
                    ? 'bg-cyan-400 text-slate-950 font-extrabold shadow-lg shadow-cyan-400/20'
                    : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Mã QR Thanh Toán</span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              </button>
            )}
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'history'
                  ? 'bg-amber-400 text-slate-950 font-extrabold'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              Lịch Sử Giao Dịch
            </button>
            {selectedInvoiceTxn && (
              <button
                onClick={() => setActiveTab('invoice')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  activeTab === 'invoice'
                    ? 'bg-emerald-400 text-slate-950 font-extrabold'
                    : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Hóa Đơn Điện Tử</span>
              </button>
            )}
          </div>
        </div>

        {modalNotice && (
          <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between animate-fadeIn">
            <span>{modalNotice}</span>
            <button
              onClick={() => setModalNotice(null)}
              className="text-slate-400 hover:text-white text-xs ml-3 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* TAB 1: PLANS SELECTION */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            {/* VIP Status info if already active */}
            {currentUser.vipTier === 'vip' && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-300">Tài khoản của bạn đang có VIP hiệu lực</h4>
                    <p className="text-xs text-slate-300">
                      Hạn dùng đến:{' '}
                      <span className="font-semibold text-white">
                        {currentUser.vipExpiresAt
                          ? new Date(currentUser.vipExpiresAt).toLocaleDateString('vi-VN')
                          : 'Vĩnh viễn'}
                      </span>
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-400 text-slate-950">
                  Đang hoạt động
                </span>
              </div>
            )}

            {/* Plan Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {INITIAL_VIP_PLANS.map(plan => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => {
                      setSelectedPlanId(plan.id);
                      setDiscountAmount(0);
                      setCouponApplied(false);
                    }}
                    className={`p-5 rounded-2xl border transition cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/10 scale-[1.02]'
                        : 'border-white/10 bg-[#0c1024] hover:border-amber-500/30'
                    }`}
                  >
                    {plan.isPopular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-md">
                        Phổ Biến Nhất
                      </span>
                    )}

                    <div className="space-y-3">
                      <div>
                        <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                        <p className="text-xs text-slate-400">{plan.tagline}</p>
                      </div>

                      <div className="pt-1">
                        <div className="text-2xl font-black text-amber-300 font-space">
                          {plan.priceVND.toLocaleString('vi-VN')} đ
                        </div>
                        <div className="text-xs text-slate-500 line-through">
                          {plan.originalPriceVND.toLocaleString('vi-VN')} đ
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-white/5">
                        {plan.features.map((feat, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                            <Check className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4">
                      <div
                        className={`w-full py-2 rounded-xl text-center text-xs font-bold transition ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 font-extrabold'
                            : 'bg-white/5 text-slate-300 hover:text-white'
                        }`}
                      >
                        {isSelected ? 'Đã Chọn Gói Này' : 'Chọn Gói'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payment Method & Checkout Bar */}
            <div className="p-6 rounded-2xl bg-[#0a0e22] border border-white/10 space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  1. Phương thức thanh toán ví điện tử & ngân hàng:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    onClick={() => setPaymentMethod('vietqr')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                      paymentMethod === 'vietqr'
                        ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300 font-bold shadow-md shadow-cyan-500/10'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-cyan-400" />
                    <span className="text-xs font-bold">VietQR (Tất Cả NH)</span>
                    <span className="text-[10px] text-cyan-300/80">Khuyên Dùng</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('momo')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                      paymentMethod === 'momo'
                        ? 'border-pink-500 bg-pink-500/15 text-pink-300 font-bold shadow-md shadow-pink-500/10'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-pink-400" />
                    <span className="text-xs font-bold">Ví MoMo</span>
                    <span className="text-[10px] text-slate-400">Quét mã MoMo</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('zalopay')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                      paymentMethod === 'zalopay'
                        ? 'border-blue-400 bg-blue-500/15 text-blue-300 font-bold shadow-md shadow-blue-500/10'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-blue-400" />
                    <span className="text-xs font-bold">Ví ZaloPay</span>
                    <span className="text-[10px] text-slate-400">QR ZaloPay</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('vnpay')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                      paymentMethod === 'vnpay'
                        ? 'border-red-500 bg-red-500/15 text-red-300 font-bold shadow-md shadow-red-500/10'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-red-400" />
                    <span className="text-xs font-bold">VNPAY-QR</span>
                    <span className="text-[10px] text-slate-400">Thẻ ATM / Visa</span>
                  </button>
                </div>
              </div>

              {/* Coupon Code Input */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/5">
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 sm:w-64">
                      <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Mã ưu đãi (VD: SCHOLYX2026, VIP50)"
                        value={couponCode}
                        onChange={e => {
                          setCouponCode(e.target.value);
                          setCouponFeedback(null);
                        }}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white uppercase focus:border-amber-400 outline-none"
                      />
                    </div>
                    <button
                      onClick={handleApplyCoupon}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition interactive-bounce cursor-pointer"
                    >
                      Áp Dụng
                    </button>
                  </div>
                  {couponFeedback && (
                    <span
                      className={`text-[11px] font-medium ${
                        couponFeedback.success ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {couponFeedback.text}
                    </span>
                  )}
                </div>

                <div className="text-right w-full sm:w-auto">
                  <div className="text-xs text-slate-400">
                    Tổng tiền cần thanh toán:{' '}
                    {discountAmount > 0 && (
                      <span className="text-emerald-400 line-through mr-1">
                        {currentPlan.priceVND.toLocaleString('vi-VN')} đ
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-black text-amber-400 font-space">
                    {finalPrice.toLocaleString('vi-VN')} đ
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Bảo mật chuẩn ISO/IEC 27001 • Hoàn tiền trong 7 ngày nếu không hài lòng.</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleStartQRCheckout}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 hover:brightness-110 transition interactive-bounce"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Tạo Mã QR & Thanh Toán Ngay</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: QR CHECKOUT WITH LIVE SIMULATION */}
        {activeTab === 'qr_checkout' && activeQRTransaction && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-cyan-300 text-xs font-semibold">
                <Clock className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Mã QR có hiệu lực trong: <strong className="text-white font-mono text-sm">{formatTimer(timeLeftSeconds)}</strong></span>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 font-bold">
                {activeQRTransaction.paymentMethod.toUpperCase()} DYNAMIC QR
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Left Column: Realistic QR Code Box */}
              <div className="p-6 rounded-3xl bg-white text-slate-950 flex flex-col items-center justify-center space-y-4 shadow-2xl relative">
                {/* Bank / Wallet Header */}
                <div className="flex items-center justify-between w-full border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xs">
                      {activeQRTransaction.paymentMethod === 'momo' ? 'MoMo' : activeQRTransaction.paymentMethod === 'zalopay' ? 'Zalo' : 'MB'}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 leading-tight">
                        {activeQRTransaction.paymentMethod === 'momo'
                          ? 'Ví Điện Tử MoMo'
                          : activeQRTransaction.paymentMethod === 'zalopay'
                          ? 'Ví Điện Tử ZaloPay'
                          : 'VietQR - Ngân hàng MBBank'}
                      </h4>
                      <p className="text-[10px] text-slate-500">Quét bằng ứng dụng Ngân hàng hoặc Ví</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Chính Thức
                  </span>
                </div>

                {/* SVG QR Code Illustration with dynamic center badge */}
                <div className="relative p-3 rounded-2xl border-2 border-slate-900 bg-white">
                  <svg
                    viewBox="0 0 200 200"
                    className="w-56 h-56 mx-auto"
                    fill="currentColor"
                  >
                    {/* Finder Patterns top-left */}
                    <rect x="10" y="10" width="50" height="50" rx="6" fill="#090d1f" />
                    <rect x="20" y="20" width="30" height="30" rx="3" fill="#ffffff" />
                    <rect x="27" y="27" width="16" height="16" rx="2" fill="#090d1f" />

                    {/* Finder Patterns top-right */}
                    <rect x="140" y="10" width="50" height="50" rx="6" fill="#090d1f" />
                    <rect x="150" y="20" width="30" height="30" rx="3" fill="#ffffff" />
                    <rect x="157" y="27" width="16" height="16" rx="2" fill="#090d1f" />

                    {/* Finder Patterns bottom-left */}
                    <rect x="10" y="140" width="50" height="50" rx="6" fill="#090d1f" />
                    <rect x="20" y="150" width="30" height="30" rx="3" fill="#ffffff" />
                    <rect x="27" y="157" width="16" height="16" rx="2" fill="#090d1f" />

                    {/* Simulated Data Matrix Dots */}
                    <rect x="70" y="15" width="8" height="8" fill="#090d1f" />
                    <rect x="85" y="15" width="16" height="8" fill="#090d1f" />
                    <rect x="110" y="15" width="8" height="8" fill="#090d1f" />
                    <rect x="125" y="25" width="8" height="16" fill="#090d1f" />
                    <rect x="70" y="30" width="16" height="8" fill="#090d1f" />
                    <rect x="95" y="30" width="8" height="16" fill="#090d1f" />
                    <rect x="115" y="35" width="16" height="8" fill="#090d1f" />

                    <rect x="15" y="70" width="8" height="16" fill="#090d1f" />
                    <rect x="30" y="75" width="16" height="8" fill="#090d1f" />
                    <rect x="55" y="70" width="8" height="8" fill="#090d1f" />
                    <rect x="15" y="95" width="16" height="8" fill="#090d1f" />
                    <rect x="40" y="90" width="8" height="16" fill="#090d1f" />
                    <rect x="55" y="100" width="16" height="8" fill="#090d1f" />

                    <rect x="140" y="70" width="16" height="8" fill="#090d1f" />
                    <rect x="165" y="75" width="8" height="16" fill="#090d1f" />
                    <rect x="180" y="70" width="8" height="8" fill="#090d1f" />
                    <rect x="140" y="95" width="8" height="16" fill="#090d1f" />
                    <rect x="160" y="90" width="16" height="8" fill="#090d1f" />
                    <rect x="180" y="100" width="8" height="8" fill="#090d1f" />

                    <rect x="70" y="140" width="16" height="8" fill="#090d1f" />
                    <rect x="95" y="145" width="8" height="16" fill="#090d1f" />
                    <rect x="110" y="140" width="16" height="8" fill="#090d1f" />
                    <rect x="70" y="165" width="8" height="16" fill="#090d1f" />
                    <rect x="90" y="170" width="16" height="8" fill="#090d1f" />
                    <rect x="115" y="160" width="8" height="16" fill="#090d1f" />

                    <rect x="140" y="140" width="16" height="8" fill="#090d1f" />
                    <rect x="165" y="140" width="8" height="16" fill="#090d1f" />
                    <rect x="180" y="150" width="8" height="8" fill="#090d1f" />
                    <rect x="145" y="165" width="16" height="8" fill="#090d1f" />
                    <rect x="170" y="160" width="16" height="16" fill="#090d1f" />
                  </svg>

                  {/* Centered Brand Icon */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 rounded-xl bg-slate-950 border-2 border-white shadow-xl flex items-center justify-center text-cyan-400">
                      <Sparkles className="w-6 h-6 animate-pulse" />
                    </div>
                  </div>
                </div>

                <div className="text-center w-full">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Số tiền cần chuyển
                  </div>
                  <div className="text-2xl font-black text-slate-950 font-space tracking-tight">
                    {activeQRTransaction.amountVND.toLocaleString('vi-VN')} đ
                  </div>
                </div>
              </div>

              {/* Right Column: Account Details & Action Simulation */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-[#0e1329] border border-white/10 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Thông tin thanh toán ngân hàng:
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                      <span className="text-slate-400">Ngân hàng / Ví:</span>
                      <span className="font-bold text-white text-right">
                        {activeQRTransaction.bankName || MOCK_PAYMENT_CONFIG.vietqr.bankName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                      <span className="text-slate-400">Số tài khoản / SĐT:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-cyan-300">
                          {activeQRTransaction.accountNumber || MOCK_PAYMENT_CONFIG.vietqr.accountNumber}
                        </span>
                        <button
                          onClick={() => handleCopy(activeQRTransaction.accountNumber || MOCK_PAYMENT_CONFIG.vietqr.accountNumber, 'acc')}
                          className="p-1 text-slate-400 hover:text-white transition"
                          title="Sao chép số tài khoản"
                        >
                          {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                      <span className="text-slate-400">Người thụ hưởng:</span>
                      <span className="font-bold text-white text-right">
                        {MOCK_PAYMENT_CONFIG.merchantName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <div>
                        <span className="text-amber-400 font-bold block">Nội dung chuyển khoản (bắt buộc):</span>
                        <span className="font-mono font-extrabold text-white text-sm">
                          {activeQRTransaction.transferSyntax || `SCHOLYX VIP ${activeQRTransaction.id}`}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(activeQRTransaction.transferSyntax || `SCHOLYX VIP ${activeQRTransaction.id}`, 'syntax')}
                        className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 hover:brightness-110 transition interactive-bounce"
                      >
                        {copiedField === 'syntax' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === 'syntax' ? 'Đã chép' : 'Chép'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Simulation Control Box */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border border-indigo-500/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Mô Phỏng Phê Duyệt Thanh Toán Thực Tế:
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Hệ thống tích hợp cổng giả lập quét mã từ App ngân hàng/ví điện tử và cổng QTV duyệt thủ công. Bạn có thể bấm nút bên dưới để kiểm thử ngay:
                  </p>

                  <div className="space-y-2 pt-1">
                    <button
                      disabled={isScanningSimulation}
                      onClick={handleSimulateWalletScan}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 hover:brightness-110 transition interactive-bounce disabled:opacity-50"
                    >
                      {isScanningSimulation ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin" />
                          <span>
                            {scanStep === 1
                              ? '📱 App Ví MoMo/ZaloPay đang quét mã QR...'
                              : scanStep === 2
                              ? '🔐 Đang xác thực OTP & giao dịch...'
                              : '✅ Ngân hàng đã duyệt thành công!'}
                          </span>
                        </>
                      ) : (
                        <>
                          <Smartphone className="w-4 h-4 text-cyan-200" />
                          <span>🚀 Giả Lập Quét Mã & Thanh Toán Thành Công</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setModalNotice(`Giao dịch ${activeQRTransaction.id} đã được lưu ở trạng thái CHỜ DUYỆT (pending). Bạn có thể chuyển sang vai trò "Quản Trị Viên (QTV)" để phê duyệt thủ công trong tab Giao Dịch VIP!`);
                        setActiveTab('history');
                      }}
                      className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 transition cursor-pointer"
                    >
                      ⏳ Lưu Chờ QTV Duyệt Thủ Công
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TRANSACTION HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Lịch sử nạp và mua gói VIP của bạn
              </h3>
              <span className="text-xs text-slate-400">{transactions.length} giao dịch</span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0b0e24] text-slate-400 uppercase tracking-wider border-b border-white/10">
                  <tr>
                    <th className="p-3">Mã GD</th>
                    <th className="p-3">Gói VIP</th>
                    <th className="p-3">Số tiền</th>
                    <th className="p-3">Phương thức</th>
                    <th className="p-3">Trạng thái</th>
                    <th className="p-3">Thời gian</th>
                    <th className="p-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-[#070a1a]">
                  {transactions.map(txn => {
                    const isSuccess = txn.status === 'success';
                    const isPending = txn.status === 'pending';
                    const isRefunded = txn.status === 'refunded';

                    return (
                      <tr key={txn.id} className="hover:bg-white/5 transition">
                        <td className="p-3 font-mono font-bold text-cyan-300">{txn.id}</td>
                        <td className="p-3 font-semibold text-white">{txn.planName}</td>
                        <td className="p-3 font-bold text-amber-300 font-mono">
                          {txn.amountVND.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="p-3 uppercase text-[11px] font-bold text-slate-400">
                          {txn.paymentMethod}
                        </td>
                        <td className="p-3">
                          {isSuccess && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                              Thành công
                            </span>
                          )}
                          {isPending && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold animate-pulse">
                              Chờ duyệt
                            </span>
                          )}
                          {isRefunded && (
                            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-bold">
                              Đã hoàn tiền
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-400 text-[11px]">{txn.createdAt}</td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => handleViewInvoice(txn)}
                            className="px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 transition text-[11px] font-bold"
                          >
                            Hóa đơn
                          </button>
                          {isSuccess && !txn.refundReason && (
                            <button
                              onClick={() => setRefundTxnId(txn.id)}
                              className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-400 hover:text-rose-300 transition text-[11px]"
                            >
                              Hoàn tiền
                            </button>
                          )}
                          {isPending && (
                            <button
                              onClick={() => {
                                setActiveQRTransaction(txn);
                                setActiveTab('qr_checkout');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-bold transition text-[11px]"
                            >
                              Quét QR
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Refund Dialog */}
            {refundTxnId && (
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 space-y-3">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                  <RotateCcw className="w-4 h-4" />
                  <span>Yêu cầu hoàn tiền giao dịch {refundTxnId}</span>
                </div>
                <textarea
                  placeholder="Vui lòng nhập lý do yêu cầu hoàn tiền..."
                  value={refundReason}
                  onChange={e => setRefundReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-rose-500/30 text-xs text-white outline-none"
                  rows={2}
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setRefundTxnId(null)}
                    className="px-3 py-1 rounded-lg bg-white/10 text-xs text-slate-300"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleConfirmRefund}
                    className="px-4 py-1 rounded-lg bg-rose-500 text-white font-bold text-xs hover:bg-rose-600"
                  >
                    Gửi Yêu Cầu Hoàn Tiền
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ELECTRONIC INVOICE (HÓA ĐƠN ĐIỆN TỬ VAT) */}
        {activeTab === 'invoice' && selectedInvoiceTxn && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveTab('history')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                ← Quay lại danh sách
              </button>

              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5 transition interactive-bounce"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In Hóa Đơn / Lưu PDF</span>
              </button>
            </div>

            {/* Printable Invoice Paper */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white text-slate-900 shadow-2xl space-y-6 font-sans relative border border-slate-200">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black">
                      <Sparkles className="w-5 h-5 text-cyan-300" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        {MOCK_PAYMENT_CONFIG.merchantName}
                      </h3>
                      <p className="text-xs text-slate-500">Mã số thuế: 0109887766 • Hotline: 1900 6868</p>
                    </div>
                  </div>
                </div>

                <div className="text-right sm:text-right w-full sm:w-auto">
                  <h2 className="text-lg font-black text-indigo-900 uppercase">Hóa Đơn Điện Tử VAT</h2>
                  <p className="text-xs font-mono font-bold text-slate-600">
                    Số: {selectedInvoiceTxn.invoiceNumber || 'INV-2026-0042'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Ngày lập: {selectedInvoiceTxn.completedAt || selectedInvoiceTxn.createdAt}
                  </p>
                </div>
              </div>

              {/* Customer & Transaction info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="space-y-1">
                  <div className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Khách hàng</div>
                  <div className="font-bold text-slate-900 text-sm">{currentUser.name}</div>
                  <div className="text-slate-600">Email: {currentUser.email}</div>
                  <div className="text-slate-600">Trường: {currentUser.school}</div>
                </div>

                <div className="space-y-1 sm:text-right">
                  <div className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Thông tin thanh toán</div>
                  <div className="font-bold text-slate-900">
                    Mã GD: <span className="font-mono text-indigo-700">{selectedInvoiceTxn.id}</span>
                  </div>
                  <div className="text-slate-600">
                    Cổng: <span className="uppercase font-bold">{selectedInvoiceTxn.paymentMethod}</span>
                  </div>
                  <div className="text-slate-600">
                    Trạng thái:{' '}
                    <span className="font-bold text-emerald-700">ĐÃ THANH TOÁN THÀNH CÔNG</span>
                  </div>
                </div>
              </div>

              {/* Item breakdown table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-300 text-slate-500 uppercase text-[10px]">
                    <tr>
                      <th className="py-2">Mặt hàng / Dịch vụ</th>
                      <th className="py-2 text-center">Thời hạn</th>
                      <th className="py-2 text-right">Đơn giá</th>
                      <th className="py-2 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3">
                        <div className="font-bold text-slate-900">{selectedInvoiceTxn.planName}</div>
                        <div className="text-[11px] text-slate-500">
                          Bản quyền gói luyện thi tốt nghiệp THPT VIP 2026 kèm Trợ lý AI
                        </div>
                      </td>
                      <td className="py-3 text-center text-slate-600">
                        {selectedInvoiceTxn.planId === 'plan-cosmos' ? '12 Tháng' : selectedInvoiceTxn.planId === 'plan-comet' ? '1 Tháng' : '3 Tháng'}
                      </td>
                      <td className="py-3 text-right font-mono font-medium text-slate-700">
                        {selectedInvoiceTxn.amountVND.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-slate-950">
                        {selectedInvoiceTxn.amountVND.toLocaleString('vi-VN')} đ
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Financial summary */}
              <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between border-t border-slate-200 pt-4 gap-4">
                {/* Official Stamp */}
                <div className="w-40 h-20 rounded-2xl border-2 border-emerald-600/60 p-2 flex flex-col items-center justify-center text-emerald-700 rotate-[-4deg] relative">
                  <div className="text-[9px] font-bold uppercase tracking-wider">CHỨNG TỪ ĐIỆN TỬ</div>
                  <div className="text-sm font-black uppercase text-emerald-800">ĐÃ THANH TOÁN</div>
                  <div className="text-[8px] text-emerald-600">SCHOLYX EDUCATION CORP</div>
                </div>

                <div className="w-full sm:w-64 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Cộng tiền hàng:</span>
                    <span className="font-mono">
                      {(selectedInvoiceTxn.amountVND - (selectedInvoiceTxn.vatAmount || 0)).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Thuế GTGT (VAT 10%):</span>
                    <span className="font-mono">
                      {(selectedInvoiceTxn.vatAmount || Math.round(selectedInvoiceTxn.amountVND * 0.1 / 1.1)).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <div className="flex justify-between font-black text-slate-950 text-base pt-1 border-t border-slate-300">
                    <span>Tổng thanh toán:</span>
                    <span className="text-indigo-900 font-mono">
                      {selectedInvoiceTxn.amountVND.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
