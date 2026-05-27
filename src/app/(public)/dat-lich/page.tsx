"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Calendar,
  CalendarHeart,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flower2,
  Home,
  Loader2,
  MapPin,
  Phone,
  Palette,
  Star,
  User,
  type LucideIcon,
} from "lucide-react";
import { cn, formatDuration, formatPrice } from "@/lib/utils";

type Service = {
  id: string;
  name: string;
  slug: string;
  category: string;
  basePrice: number;
  durationMin: number;
  shortDescription: string | null;
};

type Staff = {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  specialties: string | null;
  experienceYears: number;
  services?: { service: { id: string; name: string; slug: string } }[];
  user: { id: string; name: string };
};

type Slot = { time: string; available: boolean };
type BookingResult = { bookingCode: string; serviceName: string; startAt?: string; totalPrice?: number };
type StepId = 1 | 2 | 3 | 4 | 5;

const steps: Array<{ id: StepId; label: string; icon: LucideIcon }> = [
  { id: 1, label: "Dịch vụ", icon: Flower2 },
  { id: 2, label: "Chuyên viên", icon: User },
  { id: 3, label: "Ngày giờ", icon: Calendar },
  { id: 4, label: "Thông tin", icon: MapPin },
  { id: 5, label: "Xác nhận", icon: CheckCircle2 },
];

function dateToInputValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function monthToInputValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function monthInputToDate(value: string) {
  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

function getMonthDates(month: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = startOfMonth(month);
  const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const firstDate = end < today ? today : start < today ? today : start;
  const totalDays = Math.max(0, end.getDate() - firstDate.getDate() + 1);

  return Array.from({ length: totalDays }, (_, index) => {
    const date = new Date(firstDate);
    date.setDate(firstDate.getDate() + index);
    return dateToInputValue(date);
  });
}

function formatDateVN(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`);
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  return {
    day: dayNames[date.getDay()],
    date: date.getDate(),
    month: date.getMonth() + 1,
    full: date.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit" }),
  };
}

function getSpecialties(staff: Staff) {
  if (!staff.specialties) return [];
  try {
    const parsed = JSON.parse(staff.specialties);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string").slice(0, 3) : [];
  } catch {
    return [];
  }
}

export default function BookingPage() {
  const dateScrollerRef = useRef<HTMLDivElement>(null);
  const dateDragRef = useRef({ active: false, startX: 0, scrollLeft: 0, wasDragged: false, targetDate: "" });
  const [step, setStep] = useState<StepId | 6>(1);
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [bookingType, setBookingType] = useState<"STUDIO" | "HOME">("STUDIO");
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", address: "", note: "", consent: false });
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/services")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setServices(data.data);
          const slug = new URLSearchParams(window.location.search).get("service");
          const preselected = data.data.find((service: Service) => service.slug === slug);
          if (preselected) {
            setSelectedService(preselected);
            setStep(2);
          }
        }
      })
      .finally(() => setLoadingServices(false));
  }, []);

  useEffect(() => {
    if (!selectedService) return;
    let cancelled = false;

    const loadStaff = async () => {
      await Promise.resolve();
      if (cancelled) return;
      setLoadingStaff(true);
      try {
        const response = await fetch("/api/staff");
        const data = await response.json();
        if (!cancelled && data.success) setStaffList(data.data);
      } finally {
        if (!cancelled) setLoadingStaff(false);
      }
    };

    void loadStaff();
    return () => {
      cancelled = true;
    };
  }, [selectedService]);

  useEffect(() => {
    if (!selectedStaff || !selectedDate || !selectedService) {
      let cancelled = false;
      void Promise.resolve().then(() => {
        if (!cancelled) setLoadingSlots(false);
      });
      return () => {
        cancelled = true;
      };
    }
    let cancelled = false;

    const loadSlots = async () => {
      await Promise.resolve();
      if (cancelled) return;
      setLoadingSlots(true);
      try {
        const params = new URLSearchParams({
          staffId: selectedStaff.user.id,
          date: selectedDate,
          serviceId: selectedService.id,
        });
        const response = await fetch(`/api/availability?${params.toString()}`, { cache: "no-store" });
        const data = await response.json();
        if (!cancelled) setSlots(data.success ? data.data.slots : []);
      } catch {
        if (!cancelled) setSlots([]);
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    };

    void loadSlots();
    return () => {
      cancelled = true;
    };
  }, [selectedStaff, selectedDate, selectedService]);

  const availableStaff = useMemo(() => {
    if (!selectedService) return staffList;
    return staffList.filter((staff) => !staff.services?.length || staff.services.some((item) => item.service.id === selectedService.id));
  }, [selectedService, staffList]);
  const availableSlots = useMemo(() => slots.filter((slot) => slot.available), [slots]);

  const minMonth = useMemo(() => monthToInputValue(new Date()), []);
  const maxMonth = useMemo(() => monthToInputValue(addMonths(new Date(), 12)), []);
  const visibleMonthValue = monthToInputValue(visibleMonth);
  const visibleMonthLabel = visibleMonth.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });
  const canGoPrevMonth = visibleMonthValue > minMonth;
  const canGoNextMonth = visibleMonthValue < maxMonth;
  const dates = useMemo(() => getMonthDates(visibleMonth), [visibleMonth]);

  const summary = [
    { label: "Dịch vụ", value: selectedService?.name || "Chưa chọn" },
    { label: "Chuyên viên", value: selectedStaff?.displayName || "Chưa chọn" },
    { label: "Ngày giờ", value: selectedDate && selectedTime ? `${formatDateVN(selectedDate).full}, ${selectedTime}` : "Chưa chọn" },
    { label: "Hình thức", value: bookingType === "STUDIO" ? "Tại studio" : "Tại nhà" },
    { label: "Tạm tính", value: selectedService ? formatPrice(selectedService.basePrice) : "0đ" },
  ];

  const clearSelectedDate = () => {
    setSelectedDate("");
    setSelectedTime("");
    setLoadingSlots(false);
    setSlots([]);
    window.setTimeout(() => dateScrollerRef.current?.scrollTo({ left: 0, behavior: "smooth" }), 0);
  };

  const changeVisibleMonth = (offset: number) => {
    setVisibleMonth((current) => {
      const next = addMonths(current, offset);
      const nextValue = monthToInputValue(next);
      if (nextValue < minMonth) return monthInputToDate(minMonth);
      if (nextValue > maxMonth) return monthInputToDate(maxMonth);
      return next;
    });
    clearSelectedDate();
  };

  const selectVisibleMonth = (value: string) => {
    if (!value) return;
    if (value < minMonth) setVisibleMonth(monthInputToDate(minMonth));
    else if (value > maxMonth) setVisibleMonth(monthInputToDate(maxMonth));
    else setVisibleMonth(monthInputToDate(value));
    clearSelectedDate();
  };

  const scrollDateRail = (direction: -1 | 1) => {
    dateScrollerRef.current?.scrollBy({ left: direction * 360, behavior: "smooth" });
  };

  const chooseDate = (dateValue: string) => {
    if (loadingSlots || selectedDate === dateValue) return;
    setSelectedDate(dateValue);
    setSelectedTime("");
    setLoadingSlots(true);
  };

  const startDateDrag = (clientX: number, targetDate: string) => {
    const rail = dateScrollerRef.current;
    if (!rail) return;
    dateDragRef.current = { active: true, startX: clientX, scrollLeft: rail.scrollLeft, wasDragged: false, targetDate };
  };

  const moveDateDrag = (clientX: number) => {
    const rail = dateScrollerRef.current;
    const drag = dateDragRef.current;
    if (!rail || !drag.active) return;
    const distance = clientX - drag.startX;
    if (Math.abs(distance) > 6) drag.wasDragged = true;
    rail.scrollLeft = drag.scrollLeft - distance;
  };

  const stopDateDrag = () => {
    dateDragRef.current.active = false;
  };

  const goToStep = (nextStep: StepId | 6) => {
    setError("");
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const chooseService = (service: Service) => {
    setSelectedService(service);
    setSelectedStaff(null);
    setSelectedDate("");
    setSelectedTime("");
    setSlots([]);
  };

  const validateCustomer = () => {
    if (!formData.name.trim()) return "Vui lòng nhập họ và tên.";
    if (!formData.phone.trim()) return "Vui lòng nhập số điện thoại.";
    if (bookingType === "HOME" && !formData.address.trim()) return "Vui lòng nhập địa chỉ makeup tại nhà.";
    if (!formData.consent) return "Vui lòng đồng ý để studio liên hệ xác nhận lịch.";
    return "";
  };

  const handleNext = () => {
    if (step === 1 && !selectedService) return setError("Vui lòng chọn dịch vụ bạn muốn đặt.");
    if (step === 2 && !selectedStaff) return setError("Vui lòng chọn chuyên viên makeup.");
    if (step === 3 && (!selectedDate || !selectedTime)) return setError("Vui lòng chọn ngày và khung giờ còn trống.");
    if (step === 4) {
      const validation = validateCustomer();
      if (validation) return setError(validation);
    }
    if (step < 5) goToStep((step + 1) as StepId);
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedStaff || !selectedDate || !selectedTime) {
      setError("Vui lòng kiểm tra lại dịch vụ, chuyên viên và khung giờ.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService.id,
          staffId: selectedStaff.user.id,
          startAt: `${selectedDate}T${selectedTime}:00`,
          customerName: formData.name,
          customerPhone: formData.phone,
          customerEmail: formData.email || undefined,
          bookingType,
          address: bookingType === "HOME" ? formData.address : undefined,
          note: formData.note || undefined,
          consent: formData.consent,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBookingResult(data.data);
        goToStep(6);
      } else {
        setError(data.error?.message || "Có lỗi xảy ra, vui lòng thử lại.");
      }
    } catch {
      setError("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 6 && bookingResult) {
    return (
      <div className="relative -mt-20 flex min-h-screen items-center justify-center bg-[#070509] px-4 py-24 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(243,163,143,0.16),transparent_30rem)]" />
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full max-w-lg rounded-3xl border border-[#f3a38f]/18 bg-[#120d11] p-5 text-center shadow-[0_26px_90px_rgba(0,0,0,0.42)] md:p-9"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f3a38f] text-[#160c10]">
            <Check className="h-8 w-8" strokeWidth={3} />
          </div>
          <p className="mt-6 text-xs font-bold uppercase text-[#bd7b6c]">Yêu cầu đã được gửi</p>
          <h1 className="mt-2 font-heading text-3xl font-medium text-[#f7e8e2] md:text-4xl">Đặt lịch thành công</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#cdbab4]">
            Luna đã ghi nhận yêu cầu của bạn và sẽ liên hệ qua số điện thoại đã cung cấp để xác nhận lịch chính thức.
          </p>

          <div className="my-6 rounded-2xl border border-[#f3a38f]/18 bg-[#070509]/60 p-4 md:my-7 md:p-5">
            <p className="text-xs font-bold uppercase text-[#bd7b6c]">Mã đặt lịch</p>
            <p className="mt-2 text-3xl font-black text-[#ffc0ad] md:text-4xl">{bookingResult.bookingCode}</p>
            <p className="mt-3 border-t border-[#f3a38f]/10 pt-3 text-sm text-[#f7e8e2]">{bookingResult.serviceName}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <a href="https://zalo.me/0393231806" target="_blank" rel="noopener noreferrer" className="btn-primary">
              Nhắn Zalo
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link href="/" className="btn-secondary">
              Về trang chủ
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative -mt-20 min-h-screen bg-[#070509] pb-32 pt-24 text-[#f7e8e2] sm:pb-12 md:pb-16 md:pt-28">
      <div className="absolute inset-x-0 top-0 h-[360px] bg-[radial-gradient(circle_at_70%_0%,rgba(243,163,143,0.15),transparent_30rem),linear-gradient(180deg,#1a1018_0%,#070509_100%)]" />

      <div className="container-custom relative">
        <div className="mb-5 grid gap-4 lg:mb-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#f3a38f]/20 bg-[#120d11]/70 px-3 py-1.5 text-[11px] font-bold uppercase text-[#ffc0ad] md:px-4 md:py-2 md:text-xs">
              <CalendarHeart className="h-4 w-4" />
              Đặt lịch nhanh
            </span>
            <h1 className="mt-3 font-heading text-3xl font-medium leading-tight text-[#f7e8e2] md:mt-4 md:text-5xl">
              Đặt lịch makeup
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#cdbab4] md:text-base md:leading-7">
              Chọn dịch vụ, chuyên viên, ngày giờ và để lại thông tin. Studio sẽ gọi hoặc nhắn Zalo để xác nhận trước khi giữ lịch.
            </p>
          </div>
          <a href="https://zalo.me/0393231806" target="_blank" rel="noopener noreferrer" className="btn-secondary w-full text-xs uppercase sm:w-fit">
            Cần hỗ trợ? Nhắn Zalo
          </a>
        </div>

        <StepTabs step={step as StepId} goToStep={goToStep} />

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 rounded-2xl border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100"
          >
            {error}
          </motion.div>
        )}

        <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-6">
          <section className="min-w-0 rounded-3xl border border-[#f3a38f]/18 bg-[#120d11] p-4 shadow-[0_22px_70px_rgba(0,0,0,0.34)] md:p-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="service" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                  <StepHeader title="Chọn dịch vụ" description="Chọn một gói phù hợp với nhu cầu của bạn." />
                  {loadingServices ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="h-28 animate-pulse rounded-2xl bg-white/[0.04]" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                      {services.map((service) => (
                        <SelectableCard
                          key={service.id}
                          selected={selectedService?.id === service.id}
                          onClick={() => chooseService(service)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-xs font-bold uppercase text-[#bd7b6c]">{service.category}</p>
                              <h2 className="mt-1 text-base font-bold text-[#f7e8e2]">{service.name}</h2>
                              {service.shortDescription && <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#cdbab4]">{service.shortDescription}</p>}
                            </div>
                            <CheckDot checked={selectedService?.id === service.id} />
                          </div>
                          <div className="mt-4 flex items-center justify-between border-t border-[#f3a38f]/10 pt-4">
                            <span className="font-bold text-[#ffc0ad]">{formatPrice(service.basePrice)}</span>
                            <span className="inline-flex items-center gap-1.5 text-xs text-[#cdbab4]">
                              <Clock className="h-3.5 w-3.5" />
                              {formatDuration(service.durationMin)}
                            </span>
                          </div>
                        </SelectableCard>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="staff" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                  <StepHeader title="Chọn chuyên viên" description="Chọn chuyên viên bạn muốn. Nếu chưa chắc, Luna có thể tư vấn qua Zalo." />
                  {loadingStaff ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="h-36 animate-pulse rounded-2xl bg-white/[0.04]" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {availableStaff.map((staff) => (
                        <SelectableCard
                          key={staff.id}
                          selected={selectedStaff?.id === staff.id}
                          onClick={() => {
                            setSelectedStaff(staff);
                            setSelectedDate("");
                            setSelectedTime("");
                            setSlots([]);
                          }}
                          className="text-center"
                        >
                          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#f3a38f]/22 bg-[#f3a38f]/10 font-heading text-2xl text-[#ffc0ad]">
                            {staff.displayName.charAt(0)}
                          </div>
                          <h2 className="mt-3 text-base font-bold text-[#f7e8e2]">{staff.displayName}</h2>
                          <p className="mt-1 text-xs text-[#cdbab4]">{staff.experienceYears || 1}+ năm kinh nghiệm</p>
                          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                            {(getSpecialties(staff).length ? getSpecialties(staff) : ["Chuyên viên"]).map((specialty) => (
                              <span key={specialty} className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[11px] text-[#d9c7c0]">
                                {specialty}
                              </span>
                            ))}
                          </div>
                        </SelectableCard>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="time" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                  <StepHeader title="Chọn ngày giờ" description="Chọn ngày trước, sau đó chọn khung giờ còn trống." />

                  <div className="min-w-0 rounded-2xl border border-[#f3a38f]/14 bg-[#070509]/42 p-4">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <h2 className="flex items-center gap-2 text-sm font-bold text-[#f7e8e2]">
                        <Calendar className="h-4 w-4 text-[#ffc0ad]" />
                        Ngày makeup
                      </h2>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => changeVisibleMonth(-1)}
                          disabled={!canGoPrevMonth}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#f3a38f]/16 bg-[#120d11] text-[#ffc0ad] transition hover:border-[#f3a38f]/45 disabled:cursor-not-allowed disabled:opacity-35"
                          aria-label="Tháng trước"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <label htmlFor="booking-month" className="sr-only">
                          Chọn tháng
                        </label>
                        <input
                          id="booking-month"
                          type="month"
                          value={visibleMonthValue}
                          min={minMonth}
                          max={maxMonth}
                          onChange={(event) => selectVisibleMonth(event.target.value)}
                          className="h-10 min-w-[150px] rounded-full border border-[#f3a38f]/18 bg-[#120d11] px-3 text-sm font-bold text-[#f7e8e2] outline-none transition focus:border-[#f3a38f]/60"
                        />
                        <button
                          type="button"
                          onClick={() => changeVisibleMonth(1)}
                          disabled={!canGoNextMonth}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#f3a38f]/16 bg-[#120d11] text-[#ffc0ad] transition hover:border-[#f3a38f]/45 disabled:cursor-not-allowed disabled:opacity-35"
                          aria-label="Tháng sau"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase text-[#bd7b6c]">{visibleMonthLabel}</p>
                      <div className="hidden items-center gap-2 sm:flex">
                        <button
                          type="button"
                          onClick={() => scrollDateRail(-1)}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#f3a38f]/16 bg-[#120d11] text-[#ffc0ad] transition hover:border-[#f3a38f]/45"
                          aria-label="Cuộn ngày sang trái"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => scrollDateRail(1)}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#f3a38f]/16 bg-[#120d11] text-[#ffc0ad] transition hover:border-[#f3a38f]/45"
                          aria-label="Cuộn ngày sang phải"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div
                      ref={dateScrollerRef}
                      onPointerDown={(event) => {
                        if (event.pointerType !== "mouse" || event.button !== 0) return;
                        const dateButton = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-date]");
                        startDateDrag(event.clientX, dateButton?.dataset.date || "");
                      }}
                      onPointerMove={(event) => moveDateDrag(event.clientX)}
                      onPointerUp={() => stopDateDrag()}
                      onPointerCancel={() => stopDateDrag()}
                      onPointerLeave={() => stopDateDrag()}
                      className="flex w-full min-w-0 max-w-full cursor-grab snap-x snap-mandatory select-none gap-2 overflow-x-auto pb-3 pr-1 active:cursor-grabbing [scrollbar-color:rgba(243,163,143,0.45)_transparent] [scrollbar-width:thin] [touch-action:pan-x] [-webkit-overflow-scrolling:touch]"
                    >
                      {dates.length === 0 ? (
                        <div className="w-full">
                          <EmptyBox text="Tháng này không còn ngày có thể đặt lịch." />
                        </div>
                      ) : (
                        dates.map((dateValue) => {
                          const date = formatDateVN(dateValue);
                          const isSelected = selectedDate === dateValue;
                          const isToday = dateValue === dateToInputValue(new Date());
                          return (
                            <button
                              type="button"
                              key={dateValue}
                              data-date={dateValue}
                              disabled={loadingSlots}
                              onClick={() => {
                                if (!dateDragRef.current.wasDragged) {
                                  chooseDate(dateValue);
                                }
                              }}
                              className={cn(
                                "h-[86px] w-[74px] shrink-0 snap-start rounded-2xl border text-center transition disabled:pointer-events-none disabled:opacity-60",
                                isSelected
                                  ? "border-[#f3a38f] bg-[#f3a38f] text-[#160c10]"
                                  : "border-[#f3a38f]/16 bg-[#120d11] text-[#f7e8e2] hover:border-[#f3a38f]/45",
                              )}
                            >
                              <span className="block text-[11px] font-bold uppercase">{isToday ? "Hôm nay" : date.day}</span>
                              <span className="block font-heading text-3xl font-semibold leading-none">{date.date}</span>
                              <span className="block text-[11px]">Tháng {date.month}</span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-[#f3a38f]/14 bg-[#070509]/42 p-4">
                    <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#f7e8e2]">
                      <Clock className="h-4 w-4 text-[#ffc0ad]" />
                      Giờ còn trống
                    </h2>
                    <div className="relative min-h-[150px]">
                      {!selectedDate ? (
                        <EmptyBox text="Vui lòng chọn ngày trước." />
                      ) : loadingSlots && availableSlots.length === 0 ? (
                        <EmptyBox text="Đang tải khung giờ còn trống..." />
                      ) : availableSlots.length === 0 ? (
                        <EmptyBox text="Ngày này chưa có khung giờ trống." />
                      ) : (
                        <>
                          <div className={cn("grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5", loadingSlots && "pointer-events-none opacity-35")}>
                            {availableSlots.map((slot) => {
                              const isSelected = selectedTime === slot.time;
                              return (
                                <button
                                  type="button"
                                  key={slot.time}
                                  onClick={() => setSelectedTime(slot.time)}
                                  disabled={loadingSlots}
                                  className="slot-time-button"
                                  style={{
                                    backgroundColor: isSelected ? "#f3a38f" : "#120d11",
                                    borderColor: isSelected ? "#f3a38f" : "rgba(243, 163, 143, 0.16)",
                                    color: isSelected ? "#160c10" : "#f7e8e2",
                                  }}
                                >
                                  <span
                                    className="slot-time-label"
                                    style={{
                                      color: isSelected ? "#160c10" : "#f7e8e2",
                                    }}
                                  >
                                    {slot.time}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {loadingSlots && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-[#070509]/72 px-4 text-center backdrop-blur-sm" aria-live="polite">
                              <div className="inline-flex items-center gap-2 rounded-full border border-[#f3a38f]/18 bg-[#120d11]/88 px-4 py-3 text-sm font-bold text-[#ffc0ad] shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Đang tải khung giờ còn trống...
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="info" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                  <StepHeader title="Thông tin của bạn" description="Luna chỉ dùng thông tin này để liên hệ xác nhận lịch." />
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Họ và tên *" icon={User}>
                      <input
                        value={formData.name}
                        onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                        className="premium-input bg-[#070509]/70"
                        placeholder="Nguyễn Minh Anh"
                      />
                    </Field>
                    <Field label="Số điện thoại *" icon={Phone}>
                      <input
                        value={formData.phone}
                        onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                        className="premium-input bg-[#070509]/70"
                        placeholder="0912 345 678"
                        type="tel"
                      />
                    </Field>
                    <Field label="Email" icon={Bot}>
                      <input
                        value={formData.email}
                        onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                        className="premium-input bg-[#070509]/70"
                        placeholder="Email nếu có"
                        type="email"
                      />
                    </Field>
                    <Field label="Hình thức makeup" icon={Home}>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: "STUDIO", label: "Tại studio" },
                          { value: "HOME", label: "Tại nhà" },
                        ].map((item) => (
                          <button
                            type="button"
                            key={item.value}
                            onClick={() => setBookingType(item.value as "STUDIO" | "HOME")}
                            className={cn(
                              "h-[46px] rounded-2xl border text-sm font-bold transition",
                              bookingType === item.value
                                ? "border-[#f3a38f] bg-[#f3a38f] text-[#160c10]"
                                : "border-[#f3a38f]/16 bg-[#070509]/70 text-[#f7e8e2] hover:border-[#f3a38f]/45",
                            )}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </Field>
                  </div>

                  {bookingType === "HOME" && (
                    <div className="mt-4">
                      <Field label="Địa chỉ makeup tại nhà *" icon={MapPin}>
                        <input
                          value={formData.address}
                          onChange={(event) => setFormData({ ...formData, address: event.target.value })}
                          className="premium-input bg-[#070509]/70"
                          placeholder="Số nhà, tên đường, phường/xã, quận/huyện"
                        />
                      </Field>
                    </div>
                  )}

                  <div className="mt-4">
                    <Field label="Ghi chú" icon={Palette}>
                      <textarea
                        value={formData.note}
                        onChange={(event) => setFormData({ ...formData, note: event.target.value })}
                        rows={3}
                        className="premium-input min-h-24 resize-none bg-[#070509]/70"
                        placeholder="Ví dụ: muốn makeup tone Hàn, da nhạy cảm, cần hoàn tất trước 8h..."
                      />
                    </Field>
                  </div>

                  <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-[#f3a38f]/18 bg-[#070509]/45 p-4">
                    <input
                      type="checkbox"
                      checked={formData.consent}
                      onChange={(event) => setFormData({ ...formData, consent: event.target.checked })}
                      className="mt-1 h-4 w-4 accent-[#f3a38f]"
                    />
                    <span className="text-sm leading-6 text-[#d9c7c0]">
                      Tôi đồng ý để Luna liên hệ xác nhận lịch trước khi lịch chính thức được giữ.
                    </span>
                  </label>
                </motion.div>
              )}

              {step === 5 && (
                <motion.div key="confirm" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                  <StepHeader title="Xác nhận lịch hẹn" description="Kiểm tra nhanh thông tin trước khi gửi yêu cầu." />
                  <div className="rounded-2xl border border-[#f3a38f]/18 bg-[#070509]/45 p-4 md:p-5">
                    <div className="grid gap-3">
                      {summary.map((item) => (
                        <div key={item.label} className="flex items-start justify-between gap-4 border-b border-[#f3a38f]/10 pb-3 last:border-0 last:pb-0">
                          <span className="text-sm text-[#cdbab4]">{item.label}</span>
                          <span className={cn("max-w-[62%] text-right text-sm font-bold", item.label === "Tạm tính" ? "text-xl text-[#ffc0ad]" : "text-[#f7e8e2]")}>
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl border border-[#f3a38f]/14 bg-[#070509]/45 p-4">
                      <p className="text-xs font-bold uppercase text-[#bd7b6c]">Người đặt lịch</p>
                      <p className="mt-2 font-bold text-[#f7e8e2]">{formData.name}</p>
                      <p className="text-sm text-[#cdbab4]">{formData.phone}</p>
                    </div>
                    <div className="rounded-2xl border border-[#f3a38f]/14 bg-[#070509]/45 p-4 text-sm leading-7 text-[#cdbab4]">
                      Sau khi gửi, Luna sẽ gọi hoặc nhắn Zalo để xác nhận trước khi lịch chính thức được giữ.
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6 flex gap-3 border-t border-[#f3a38f]/10 pt-5 sm:flex-row sm:items-center sm:justify-between max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:z-50 max-sm:mt-0 max-sm:items-center max-sm:border-[#f3a38f]/18 max-sm:bg-[#090508]/95 max-sm:px-4 max-sm:pb-[calc(env(safe-area-inset-bottom)+0.75rem)] max-sm:pt-3 max-sm:shadow-[0_-18px_60px_rgba(0,0,0,0.42)] max-sm:backdrop-blur-2xl">
              <button
                type="button"
                onClick={() => goToStep(Math.max(1, (step as number) - 1) as StepId)}
                disabled={step === 1}
                className={cn(
                  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-bold text-[#cdbab4] transition hover:bg-white/[0.05] hover:text-[#f7e8e2] disabled:pointer-events-none disabled:opacity-30 max-sm:h-12 max-sm:w-[38%] max-sm:border max-sm:border-[#f3a38f]/18 max-sm:bg-[#120d11] max-sm:px-3 max-sm:text-[13px] max-sm:text-[#f7e8e2]",
                  step === 1 && "max-sm:hidden",
                )}
              >
                <ChevronLeft className="h-4 w-4" />
                Quay lại
              </button>

              {step === 5 ? (
                <button type="button" onClick={handleSubmit} disabled={submitting} className="btn-primary min-w-40 text-xs uppercase disabled:opacity-60 max-sm:h-12 max-sm:min-w-0 max-sm:flex-1 max-sm:px-3 max-sm:text-[13px]">
                  {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
                  <Check className="h-4 w-4" />
                </button>
              ) : (
                <button type="button" onClick={handleNext} className="btn-primary min-w-36 text-xs uppercase max-sm:h-12 max-sm:min-w-0 max-sm:flex-1 max-sm:px-3 max-sm:text-[13px]">
                  Tiếp tục
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </section>

          <aside className="hidden lg:sticky lg:top-24 lg:block">
            <BookingSummary summary={summary} selectedService={selectedService} step={step as StepId} />
          </aside>
        </div>
      </div>
    </div>
  );
}

function StepTabs({ step, goToStep }: { step: StepId; goToStep: (step: StepId) => void }) {
  return (
    <div className="mb-5 -mx-2 overflow-x-auto px-2 pb-1 hide-scrollbar sm:mx-0 sm:px-0">
      <div className="flex min-w-max gap-2">
        {steps.map((item) => {
          const isActive = step === item.id;
          const isDone = step > item.id;
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => isDone && goToStep(item.id)}
              className={cn(
                "flex h-10 items-center gap-2 rounded-full border px-3 text-xs font-bold transition sm:h-11 sm:px-3.5 sm:text-sm",
                isActive
                  ? "border-[#f3a38f] bg-[#f3a38f] text-[#160c10]"
                  : isDone
                    ? "border-[#f3a38f]/35 bg-[#120d11] text-[#ffc0ad] hover:border-[#f3a38f]"
                    : "border-[#f3a38f]/12 bg-[#120d11]/70 text-[#75656b]",
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-5">
      <h2 className="font-heading text-2xl font-medium leading-tight text-[#f7e8e2] md:text-3xl">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#cdbab4]">{description}</p>
    </div>
  );
}

function SelectableCard({
  selected,
  onClick,
  className,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border p-3.5 text-left transition hover:-translate-y-0.5 sm:p-4",
        selected
          ? "border-[#f3a38f] bg-[#f3a38f]/10 shadow-[0_18px_42px_rgba(243,163,143,0.12)]"
          : "border-[#f3a38f]/14 bg-[#070509]/45 hover:border-[#f3a38f]/45",
        className,
      )}
    >
      {children}
    </button>
  );
}

function CheckDot({ checked }: { checked: boolean }) {
  return (
    <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full border", checked ? "border-[#f3a38f] bg-[#f3a38f] text-[#160c10]" : "border-[#f3a38f]/22 text-transparent")}>
      <Check className="h-3.5 w-3.5" strokeWidth={3} />
    </span>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon: LucideIcon; children: ReactNode }) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-bold text-[#ffc0ad]">
        <Icon className="h-4 w-4" />
        {label}
      </label>
      {children}
    </div>
  );
}

function EmptyBox({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#f3a38f]/16 bg-[#120d11]/55 px-4 py-8 text-center text-sm text-[#cdbab4]">
      {text}
    </div>
  );
}

function BookingSummary({
  summary,
  selectedService,
  step,
}: {
  summary: { label: string; value: string }[];
  selectedService: Service | null;
  step: StepId;
}) {
  return (
    <div className="rounded-3xl border border-[#f3a38f]/18 bg-[#120d11] p-4 shadow-[0_22px_70px_rgba(0,0,0,0.34)] md:p-5">
      <div className="flex items-center gap-3 border-b border-[#f3a38f]/10 pb-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f3a38f]/14 text-[#ffc0ad]">
          <Star className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-heading text-2xl font-medium text-[#f7e8e2]">Tóm tắt lịch</h2>
          <p className="text-xs font-bold uppercase text-[#bd7b6c]">Bước {Math.min(step, 5)} / 5</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {summary.map((item) => {
          const isTotal = item.label === "Tạm tính";
          const empty = item.value === "Chưa chọn" || item.value === "0đ";
          return (
            <div key={item.label} className={cn("flex justify-between gap-4", isTotal && "border-t border-[#f3a38f]/10 pt-4")}>
              <span className="text-sm text-[#cdbab4]">{item.label}</span>
              <span className={cn("max-w-[62%] text-right text-sm font-bold", empty ? "text-[#75656b]" : isTotal ? "text-lg text-[#ffc0ad]" : "text-[#f7e8e2]")}>
                {item.value}
              </span>
            </div>
          );
        })}
      </div>

      {selectedService && (
        <div className="mt-5 rounded-2xl border border-[#f3a38f]/12 bg-[#070509]/55 p-4">
          <p className="flex items-center gap-2 text-xs font-bold uppercase text-[#ffc0ad]">
            <Clock className="h-3.5 w-3.5" />
            {formatDuration(selectedService.durationMin)}
          </p>
          {selectedService.shortDescription && <p className="mt-2 line-clamp-3 text-xs leading-6 text-[#cdbab4]">{selectedService.shortDescription}</p>}
        </div>
      )}

      <p className="mt-5 flex gap-2 text-xs leading-6 text-[#a9969f]">
        <Bot className="mt-1 h-3.5 w-3.5 shrink-0 text-[#ffc0ad]" />
        Studio sẽ liên hệ xác nhận trước khi lịch chính thức được giữ.
      </p>
    </div>
  );
}
