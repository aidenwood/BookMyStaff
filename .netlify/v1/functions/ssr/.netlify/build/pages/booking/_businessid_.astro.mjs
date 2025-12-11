/* empty css                                                     */
import { c as createComponent, a as createAstro, d as renderComponent, r as renderTemplate } from '../../chunks/astro/server_ceWcd7n_.mjs';
import 'kleur/colors';
import 'html-escaper';
import { $ as $$Layout } from '../../chunks/Layout_D5iQCTfD.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format, addMinutes, addDays, isBefore, startOfDay, subHours } from 'date-fns';
import { ChevronRight, ChevronLeft, Zap, Calendar as Calendar$1, Clock, User, Mail, Phone, MessageSquare, FileText, Download, Share, MapPin, CheckCircle } from 'lucide-react';
import { c as cn, b as buttonVariants, s as supabase, B as Button } from '../../chunks/supabase_B9jxI0EJ.mjs';
import { DayPicker } from 'react-day-picker';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { A as Alert, b as AlertTitle, a as AlertDescription } from '../../chunks/alert_C9-gHp3U.mjs';
import clsx from 'clsx';
/* empty css                                           */
export { renderers } from '../../renderers.mjs';

const initialBusinessSetup = {
  currentStep: 1,
  businessInfo: {},
  staffInvites: [],
  regions: [],
  services: []
};
const initialAppointmentData = {
  selectedDate: null,
  selectedTime: null,
  staffMember: null,
  appointmentType: {
    id: "",
    businessId: "",
    name: "Consultation",
    duration: 60,
    color: "#4ECDC4",
    isActive: true
  },
  duration: 60,
  customerInfo: {
    name: "",
    email: "",
    phone: ""
  }
};
const useAppStore = create()(
  persist(
    (set, get) => ({
      // Business Setup
      businessSetup: initialBusinessSetup,
      updateBusinessSetup: (updates) => set((state) => ({
        businessSetup: { ...state.businessSetup, ...updates }
      })),
      setBusinessSetupStep: (step) => set((state) => ({
        businessSetup: { ...state.businessSetup, currentStep: step }
      })),
      resetBusinessSetup: () => set({ businessSetup: initialBusinessSetup }),
      // Current Business
      currentBusiness: null,
      setCurrentBusiness: (business) => set({ currentBusiness: business }),
      // Staff Management
      staff: [],
      setStaff: (staff) => set({ staff }),
      addStaffMember: (staff) => set((state) => ({ staff: [...state.staff, staff] })),
      updateStaffMember: (id, updates) => set((state) => ({
        staff: state.staff.map((s) => s.id === id ? { ...s, ...updates } : s)
      })),
      removeStaffMember: (id) => set((state) => ({ staff: state.staff.filter((s) => s.id !== id) })),
      // Regions
      regions: [],
      setRegions: (regions) => set({ regions }),
      addRegion: (region) => set((state) => ({ regions: [...state.regions, region] })),
      updateRegion: (id, updates) => set((state) => ({
        regions: state.regions.map((r) => r.id === id ? { ...r, ...updates } : r)
      })),
      // Customer Booking
      customerBooking: initialAppointmentData,
      updateCustomerBooking: (updates) => set((state) => ({
        customerBooking: { ...state.customerBooking, ...updates }
      })),
      resetCustomerBooking: () => set({ customerBooking: initialAppointmentData }),
      // Bookings
      bookings: [],
      setBookings: (bookings) => set({ bookings }),
      addBooking: (booking) => set((state) => ({ bookings: [...state.bookings, booking] })),
      updateBooking: (id, updates) => set((state) => ({
        bookings: state.bookings.map((b) => b.id === id ? { ...b, ...updates } : b)
      })),
      // UI State
      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),
      selectedRegion: null,
      setSelectedRegion: (region) => set({ selectedRegion: region })
    }),
    {
      name: "bookmystaff-storage",
      partialize: (state) => ({
        businessSetup: state.businessSetup,
        currentBusiness: state.currentBusiness,
        selectedRegion: state.selectedRegion
      })
    }
  )
);

function ServiceSelection({
  appointmentTypes,
  onNext,
  businessName
}) {
  const { customerBooking, updateCustomerBooking } = useAppStore();
  const handleServiceSelect = (service) => {
    updateCustomerBooking({
      appointmentType: service,
      duration: service.duration
    });
    onNext();
  };
  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };
  const formatPrice = (price) => {
    if (!price) return "Contact for pricing";
    return `$${price.toFixed(0)}`;
  };
  return /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-12", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-4xl font-black text-charcoal mb-4 tracking-tight", children: "Choose Your Service" }),
      /* @__PURE__ */ jsxs("p", { className: "text-xl text-darkgray font-medium", children: [
        "Select the service you'd like to book with ",
        businessName
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: appointmentTypes.map((service) => /* @__PURE__ */ jsxs(
      "div",
      {
        onClick: () => handleServiceSelect(service),
        className: "bg-lightgray/30 rounded-3xl p-8 hover:bg-lightgray/50 transition-all duration-300 cursor-pointer group hover:-translate-y-2 border-2 border-transparent hover:border-orange/20 hover:shadow-2xl",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-6", children: [
            /* @__PURE__ */ jsx("div", { className: "w-16 h-16 bg-orange/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200", children: /* @__PURE__ */ jsx("div", { className: "w-8 h-8 bg-orange rounded-xl" }) }),
            /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsx("p", { className: "text-3xl font-black text-charcoal", children: formatPrice(service.price) }),
              /* @__PURE__ */ jsx("p", { className: "text-base text-darkgray font-medium", children: formatDuration(service.duration) })
            ] })
          ] }),
          /* @__PURE__ */ jsx("h3", { className: "text-2xl font-black text-charcoal mb-3 group-hover:text-orange transition-colors", children: service.name }),
          service.description && /* @__PURE__ */ jsx("p", { className: "text-darkgray text-base mb-6 leading-relaxed", children: service.description }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center text-base text-darkgray font-medium", children: [
              /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
              formatDuration(service.duration)
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center text-orange group-hover:text-orange/80 transition-colors", children: [
              /* @__PURE__ */ jsx("span", { className: "text-base font-bold mr-2", children: "Book now" }),
              /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 group-hover:translate-x-1 transition-transform", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })
            ] })
          ] })
        ]
      },
      service.id
    )) }),
    appointmentTypes.length === 0 && /* @__PURE__ */ jsxs("div", { className: "text-center py-16", children: [
      /* @__PURE__ */ jsx("div", { className: "w-24 h-24 bg-lightgray rounded-3xl flex items-center justify-center mx-auto mb-6", children: /* @__PURE__ */ jsx("svg", { className: "w-12 h-12 text-darkgray", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" }) }) }),
      /* @__PURE__ */ jsx("h3", { className: "text-2xl font-black text-charcoal mb-3", children: "No Services Available" }),
      /* @__PURE__ */ jsx("p", { className: "text-lg text-darkgray", children: "This business hasn't set up their services yet. Please contact them directly." })
    ] }),
    appointmentTypes.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-12 bg-lightgray/20 rounded-3xl p-8 border border-lightgray/30", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center text-center", children: [
      /* @__PURE__ */ jsx("svg", { className: "w-10 h-10 text-orange mr-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h4", { className: "text-xl font-bold text-charcoal", children: "Easy Booking Process" }),
        /* @__PURE__ */ jsx("p", { className: "text-base text-darkgray mt-2", children: "Choose your service → Enter location → Pick date & time → Confirm details" })
      ] })
    ] }) }) })
  ] });
}

const DEFAULT_REGIONS = [
  {
    name: "Brisbane North",
    color: "#FF6B6B",
    postcodes: ["4000", "4006", "4010", "4011", "4012", "4013", "4014"],
    isActive: true,
    description: "Brisbane North including CBD and northern suburbs"
  },
  {
    name: "Brisbane South",
    color: "#4ECDC4",
    postcodes: ["4101", "4102", "4103", "4104", "4105", "4106", "4107"],
    isActive: true,
    description: "Brisbane South including southern suburbs"
  },
  {
    name: "Gold Coast",
    color: "#45B7D1",
    postcodes: ["4215", "4217", "4220", "4223", "4225", "4227", "4230"],
    isActive: true,
    description: "Gold Coast region"
  },
  {
    name: "Logan",
    color: "#96CEB4",
    postcodes: ["4114", "4116", "4118", "4119", "4120", "4121", "4123"],
    isActive: true,
    description: "Logan area"
  },
  {
    name: "Ipswich",
    color: "#FECA57",
    postcodes: ["4300", "4301", "4302", "4303", "4304", "4305", "4306"],
    isActive: true,
    description: "Ipswich and surrounding areas"
  }
];

DEFAULT_REGIONS.map((region, index) => ({
  ...region,
  id: `region_${index + 1}`,
  businessId: "default"
}));
const WORKING_HOURS = {
  start: "09:00",
  end: "17:00",
  slotDuration: 60};

function LocationInput({ regions, onNext, onBack }) {
  const { customerBooking, updateCustomerBooking, setSelectedRegion } = useAppStore();
  const [address, setAddress] = useState(customerBooking.customerInfo.address || "");
  const [postcode, setPostcode] = useState(customerBooking.customerInfo.postcode || "");
  const [detectedRegion, setDetectedRegion] = useState(null);
  const [error, setError] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const inputRef = useRef(null);
  const validateLocation = async () => {
    if (!address.trim() || !postcode.trim()) {
      setError("Please enter both address and postcode");
      return false;
    }
    setIsValidating(true);
    setError(null);
    try {
      const region = regions.find(
        (r) => r.postcodes.includes(postcode.trim()) && r.isActive
      );
      if (!region) {
        setError(`Sorry, we don't service the ${postcode} area yet. Available regions: ${regions.map((r) => r.name).join(", ")}`);
        setIsValidating(false);
        return false;
      }
      setDetectedRegion(region);
      setIsValidating(false);
      return true;
    } catch (error2) {
      setError("Unable to validate location. Please check your address.");
      setIsValidating(false);
      return false;
    }
  };
  const handleNext = async () => {
    const isValid = await validateLocation();
    if (!isValid) return;
    updateCustomerBooking({
      customerInfo: {
        ...customerBooking.customerInfo,
        address: address.trim(),
        postcode: postcode.trim()
      }
    });
    if (detectedRegion) {
      setSelectedRegion(detectedRegion.id);
    }
    onNext();
  };
  const handleAddressChange = (value) => {
    setAddress(value);
    setError(null);
    setDetectedRegion(null);
  };
  const handlePostcodeChange = (value) => {
    setPostcode(value);
    setError(null);
    setDetectedRegion(null);
    if (value.length >= 4) {
      const region = regions.find(
        (r) => r.postcodes.some((pc) => pc.startsWith(value.trim())) && r.isActive
      );
      if (region) {
        setDetectedRegion(region);
      }
    }
  };
  const sampleAddresses = [
    { address: "123 Queen Street, Brisbane City", postcode: "4000", region: "Brisbane North" },
    { address: "456 Logan Road, South Brisbane", postcode: "4101", region: "Brisbane South" },
    { address: "789 Surfers Paradise Blvd, Surfers Paradise", postcode: "4217", region: "Gold Coast" }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-gray-900 mb-2", children: "Where should we come?" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-lg", children: "Enter your address so we can find available staff in your area" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "card", children: /* @__PURE__ */ jsx("div", { className: "card-body p-8", children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { className: "form-label text-lg", children: "Street Address *" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            ref: inputRef,
            type: "text",
            className: "form-input text-lg py-4",
            value: address,
            onChange: (e) => handleAddressChange(e.target.value),
            placeholder: "e.g., 123 Queen Street, Brisbane City",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { className: "form-label text-lg", children: "Postcode *" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            className: "form-input text-lg py-4",
            value: postcode,
            onChange: (e) => handlePostcodeChange(e.target.value),
            placeholder: "e.g., 4000",
            maxLength: 4,
            required: true
          }
        )
      ] }),
      detectedRegion && !error && /* @__PURE__ */ jsxs("div", { className: "flex items-center p-4 bg-green-50 border border-green-200 rounded-xl", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "w-4 h-4 rounded-full mr-3",
            style: { backgroundColor: detectedRegion.color }
          }
        ),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-green-800", children: "Great! We service your area" }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-green-600", children: [
            "Service Region: ",
            detectedRegion.name
          ] })
        ] }),
        /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 text-green-600 ml-auto", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) })
      ] }),
      error && /* @__PURE__ */ jsx("div", { className: "p-4 bg-red-50 border border-red-200 rounded-xl", children: /* @__PURE__ */ jsxs("div", { className: "flex", children: [
        /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 text-red-600 mr-3 mt-0.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-red-800", children: "Service Area Notice" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 mt-1", children: error })
        ] })
      ] }) })
    ] }) }) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-gray-700 mb-3", children: "Example addresses in our service areas:" }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3", children: sampleAddresses.slice(0, 3).map((sample, index) => /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => {
            setAddress(sample.address);
            setPostcode(sample.postcode);
            handlePostcodeChange(sample.postcode);
          },
          className: "text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border transition-colors",
          children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900", children: sample.address }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
              sample.postcode,
              " • ",
              sample.region
            ] })
          ]
        },
        index
      )) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-3", children: "Our Service Areas" }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: regions.map((region) => /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "w-3 h-3 rounded-full mr-2",
            style: { backgroundColor: region.color }
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-700", children: region.name })
      ] }, region.id)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between mt-8 pt-6 border-t", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onBack,
          className: "btn btn-secondary btn-lg",
          children: "← Back to Services"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleNext,
          disabled: !address || !postcode || isValidating,
          className: "btn btn-primary btn-lg",
          children: isValidating ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" }),
            "Checking..."
          ] }) : "Continue to Date & Time →"
        }
      )
    ] })
  ] });
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  doubleMonth = false,
  availableDates = [],
  unavailableDates = [],
  ...props
}) {
  const modifiers = React.useMemo(() => ({
    available: availableDates,
    unavailable: unavailableDates,
    ...props.modifiers
  }), [availableDates, unavailableDates, props.modifiers]);
  const numberOfMonths = doubleMonth ? 2 : 1;
  return /* @__PURE__ */ jsx(
    DayPicker,
    {
      numberOfMonths,
      showOutsideDays,
      className: cn("p-3", doubleMonth && "max-w-fit", className),
      classNames: {
        months: cn(
          "flex space-y-4",
          doubleMonth ? "flex-col lg:flex-row lg:space-x-4 lg:space-y-0" : "flex-col"
        ),
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-slate-500 rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-slate-100/50 [&:has([aria-selected])]:bg-slate-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected: "bg-primary-600 text-slate-50 hover:bg-primary-600 hover:text-slate-50 focus:bg-primary-600 focus:text-slate-50",
        day_today: "bg-slate-100 text-slate-900 font-semibold",
        day_outside: "day-outside text-slate-500 opacity-50 aria-selected:bg-slate-100/50 aria-selected:text-slate-500 aria-selected:opacity-30",
        day_disabled: "text-slate-500 opacity-50",
        day_range_middle: "aria-selected:bg-slate-100 aria-selected:text-slate-900",
        day_hidden: "invisible",
        ...classNames
      },
      modifiersClassNames: {
        available: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300 font-medium",
        unavailable: "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50",
        ...props.modifiersClassNames
      },
      modifiers,
      components: {
        IconLeft: ({ ...props2 }) => /* @__PURE__ */ jsx(ChevronLeft, { className: "h-4 w-4" }),
        IconRight: ({ ...props2 }) => /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" })
      },
      ...props
    }
  );
}
Calendar.displayName = "Calendar";

const PopoverContent = React.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(PopoverPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  PopoverPrimitive.Content,
  {
    ref,
    align,
    sideOffset,
    className: cn(
      "z-50 w-72 rounded-md border border-slate-200 bg-white p-4 text-slate-950 shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  }
) }));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

const Avatar = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AvatarPrimitive.Root,
  {
    ref,
    className: cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    ),
    ...props
  }
));
Avatar.displayName = AvatarPrimitive.Root.displayName;
const AvatarImage = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AvatarPrimitive.Image,
  {
    ref,
    className: cn("aspect-square h-full w-full", className),
    ...props
  }
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;
const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AvatarPrimitive.Fallback,
  {
    ref,
    className: cn(
      "flex h-full w-full items-center justify-center rounded-full bg-slate-100",
      className
    ),
    ...props
  }
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

const generateTimeSlots = (date, startTime = WORKING_HOURS.start, endTime = WORKING_HOURS.end, slotDuration = WORKING_HOURS.slotDuration) => {
  const slots = [];
  let currentTime = /* @__PURE__ */ new Date(`${date}T${startTime}:00`);
  const endDateTime = /* @__PURE__ */ new Date(`${date}T${endTime}:00`);
  while (currentTime < endDateTime) {
    slots.push(format(currentTime, "HH:mm"));
    currentTime = addMinutes(currentTime, slotDuration);
  }
  return slots;
};

class AvailabilityService {
  // Get staff availability for a specific date range
  async getStaffAvailability(staffId, startDate, endDate) {
    try {
      const { data, error } = await supabase.from("availability_slots").select(`
          *,
          regions (id, name, color)
        `).eq("staff_id", staffId).gte("date", startDate).lte("date", endDate).order("date", { ascending: true }).order("start_time", { ascending: true });
      if (error) throw error;
      return data.map(this.mapRowToAvailabilitySlot);
    } catch (error) {
      console.error("Error fetching staff availability:", error);
      return [];
    }
  }
  // Set availability for a specific date and time range
  async setAvailability(staffId, businessId, date, startTime, endTime, regionId) {
    try {
      const timeSlots = generateTimeSlots(date, startTime, endTime);
      const availabilityInserts = timeSlots.map((time, index) => ({
        staff_id: staffId,
        business_id: businessId,
        date,
        start_time: time,
        end_time: timeSlots[index + 1] || endTime,
        region_id: regionId,
        is_available: true
      }));
      if (availabilityInserts.length > 0) {
        availabilityInserts.pop();
      }
      const { error } = await supabase.from("availability_slots").upsert(availabilityInserts, {
        onConflict: "staff_id,date,start_time,region_id"
      });
      return !error;
    } catch (error) {
      console.error("Error setting availability:", error);
      return false;
    }
  }
  // Remove availability for specific slots
  async removeAvailability(staffId, date, startTime, regionId) {
    try {
      let query = supabase.from("availability_slots").delete().eq("staff_id", staffId).eq("date", date).eq("start_time", startTime);
      if (regionId) {
        query = query.eq("region_id", regionId);
      }
      const { error } = await query;
      return !error;
    } catch (error) {
      console.error("Error removing availability:", error);
      return false;
    }
  }
  // Get recurring availability patterns for staff
  async getRecurringAvailability(staffId) {
    try {
      const { data, error } = await supabase.from("recurring_availability").select("*").eq("staff_id", staffId).eq("is_active", true).order("day_of_week", { ascending: true });
      if (error) throw error;
      return data.map(this.mapRowToRecurringAvailability);
    } catch (error) {
      console.error("Error fetching recurring availability:", error);
      return [];
    }
  }
  // Set recurring availability pattern
  async setRecurringAvailability(staffId, businessId, dayOfWeek, startTime, endTime, regions) {
    try {
      const recurringInsert = {
        staff_id: staffId,
        business_id: businessId,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        regions,
        is_active: true
      };
      const { error } = await supabase.from("recurring_availability").upsert(recurringInsert, {
        onConflict: "staff_id,day_of_week"
      });
      return !error;
    } catch (error) {
      console.error("Error setting recurring availability:", error);
      return false;
    }
  }
  // Generate availability slots from recurring patterns
  async generateFromRecurringPattern(staffId, startDate, endDate) {
    try {
      const patterns = await this.getRecurringAvailability(staffId);
      if (patterns.length === 0) return true;
      const { data: staff } = await supabase.from("staff_members").select("business_id").eq("id", staffId).single();
      if (!staff) return false;
      const availabilitySlots = [];
      let currentDate = new Date(startDate);
      const endDateObj = new Date(endDate);
      while (currentDate <= endDateObj) {
        const dayOfWeek = currentDate.getDay();
        const dateStr = currentDate.toISOString().split("T")[0];
        const pattern = patterns.find((p) => p.dayOfWeek === dayOfWeek);
        if (pattern) {
          for (const regionId of pattern.regions) {
            const timeSlots = generateTimeSlots(
              dateStr,
              pattern.startTime,
              pattern.endTime
            );
            timeSlots.forEach((time, index) => {
              if (index < timeSlots.length - 1) {
                availabilitySlots.push({
                  staff_id: staffId,
                  business_id: staff.business_id,
                  date: dateStr,
                  start_time: time,
                  end_time: timeSlots[index + 1],
                  region_id: regionId,
                  is_available: true
                });
              }
            });
          }
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      if (availabilitySlots.length > 0) {
        const { error } = await supabase.from("availability_slots").upsert(availabilitySlots, {
          onConflict: "staff_id,date,start_time,region_id"
        });
        return !error;
      }
      return true;
    } catch (error) {
      console.error("Error generating availability from patterns:", error);
      return false;
    }
  }
  // Get available slots for booking in a region
  async getAvailableSlots(businessId, regionId, date, duration = 60) {
    try {
      const { data, error } = await supabase.from("availability_slots").select(`
          start_time,
          staff_id,
          staff_members!inner (
            id,
            name,
            avatar,
            regions
          )
        `).eq("business_id", businessId).eq("region_id", regionId).eq("date", date).eq("is_available", true).order("start_time", { ascending: true });
      if (error) throw error;
      const { data: bookings } = await supabase.from("bookings").select("time, staff_id").eq("business_id", businessId).eq("date", date).in("status", ["pending", "confirmed"]);
      const bookedSlots = new Set(
        bookings?.map((b) => `${b.staff_id}-${b.time}`) || []
      );
      return data.filter((slot) => !bookedSlots.has(`${slot.staff_id}-${slot.start_time}`)).map((slot) => ({
        time: slot.start_time,
        staffId: slot.staff_id,
        staffName: slot.staff_members.name,
        staffAvatar: slot.staff_members.avatar
      }));
    } catch (error) {
      console.error("Error fetching available slots:", error);
      return [];
    }
  }
  // Get availability overview for a business
  async getBusinessAvailabilityOverview(businessId, startDate, endDate) {
    try {
      const { data, error } = await supabase.from("availability_slots").select(`
          date,
          region_id,
          is_available,
          regions (id, name)
        `).eq("business_id", businessId).gte("date", startDate).lte("date", endDate);
      if (error) throw error;
      const groupedData = data.reduce((acc, slot) => {
        if (!acc[slot.date]) {
          acc[slot.date] = {
            date: slot.date,
            totalSlots: 0,
            availableSlots: 0,
            regions: /* @__PURE__ */ new Map()
          };
        }
        acc[slot.date].totalSlots++;
        if (slot.is_available) {
          acc[slot.date].availableSlots++;
        }
        const regionKey = slot.region_id;
        if (!acc[slot.date].regions.has(regionKey)) {
          acc[slot.date].regions.set(regionKey, {
            id: slot.regions.id,
            name: slot.regions.name,
            slots: 0
          });
        }
        if (slot.is_available) {
          acc[slot.date].regions.get(regionKey).slots++;
        }
        return acc;
      }, {});
      return Object.values(groupedData).map((day) => ({
        ...day,
        regions: Array.from(day.regions.values())
      }));
    } catch (error) {
      console.error("Error fetching availability overview:", error);
      return [];
    }
  }
  mapRowToAvailabilitySlot(row) {
    return {
      id: row.id,
      date: row.date,
      time: row.start_time,
      staffId: row.staff_id,
      region: row.regions?.name || "",
      isBooked: !row.is_available,
      isAvailable: row.is_available,
      duration: 60
      // Assuming 60-minute slots
    };
  }
  mapRowToRecurringAvailability(row) {
    return {
      id: row.id,
      staffId: row.staff_id,
      dayOfWeek: row.day_of_week,
      startTime: row.start_time,
      endTime: row.end_time,
      regions: row.regions,
      isActive: row.is_active
    };
  }
  // Real-time subscriptions
  subscribeToAvailabilityChanges(staffId, callback) {
    return supabase.channel(`availability_${staffId}`).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "availability_slots",
      filter: `staff_id=eq.${staffId}`
    }, callback).subscribe();
  }
  subscribeToBusinessAvailability(businessId, callback) {
    return supabase.channel(`business_availability_${businessId}`).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "availability_slots",
      filter: `business_id=eq.${businessId}`
    }, callback).subscribe();
  }
}

function DateTimeSelection({
  businessId,
  regions,
  onNext,
  onBack
}) {
  const { customerBooking, updateCustomerBooking, selectedRegion } = useAppStore();
  const [selectedDate, setSelectedDate] = useState();
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [staffWithSlots, setStaffWithSlots] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isQuickBooking, setIsQuickBooking] = useState(false);
  const availabilityService = new AvailabilityService();
  useEffect(() => {
    if (selectedRegion) {
      loadAvailableDates();
    }
  }, [selectedRegion]);
  useEffect(() => {
    if (selectedDate && selectedRegion) {
      loadAvailableSlots();
    }
  }, [selectedDate, selectedRegion]);
  const loadAvailableDates = async () => {
    if (!selectedRegion) return;
    try {
      const endDate = addDays(/* @__PURE__ */ new Date(), 60);
      const dates = [];
      for (let date = /* @__PURE__ */ new Date(); date <= endDate; date = addDays(date, 1)) {
        if (!isBefore(date, startOfDay(/* @__PURE__ */ new Date()))) {
          const dateStr = format(date, "yyyy-MM-dd");
          const slots = await availabilityService.getAvailableSlots(
            businessId,
            selectedRegion,
            dateStr
          );
          if (slots.length > 0) {
            dates.push(new Date(date));
          }
        }
      }
      setAvailableDates(dates);
    } catch (error) {
      console.error("Error loading available dates:", error);
      setAvailableDates([]);
    }
  };
  const loadAvailableSlots = async () => {
    if (!selectedDate || !selectedRegion) return;
    setIsLoading(true);
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const slots = await availabilityService.getAvailableSlots(
        businessId,
        selectedRegion,
        dateStr
      );
      setAvailableSlots(slots);
      groupSlotsByStaff(slots);
    } catch (error) {
      console.error("Error loading available slots:", error);
      setAvailableSlots([]);
      setStaffWithSlots([]);
    } finally {
      setIsLoading(false);
    }
  };
  const groupSlotsByStaff = (slots) => {
    const staffMap = /* @__PURE__ */ new Map();
    slots.forEach((slot) => {
      if (!staffMap.has(slot.staffId)) {
        staffMap.set(slot.staffId, {
          staff: {
            id: slot.staffId,
            name: slot.staffName,
            avatar: slot.staffAvatar,
            rating: 4.8
            // Mock rating for now
          },
          slots: []
        });
      }
      staffMap.get(slot.staffId).slots.push(slot.time);
    });
    Array.from(staffMap.values()).forEach((staffWithSlot) => {
      staffWithSlot.slots.sort();
    });
    setStaffWithSlots(Array.from(staffMap.values()));
  };
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime("");
    setSelectedStaff("");
  };
  const handleTimeSelect = (time, staffId) => {
    setSelectedTime(time);
    setSelectedStaff(staffId);
    const staffMember = staffWithSlots.find((s) => s.staff.id === staffId)?.staff;
    updateCustomerBooking({
      selectedDate: selectedDate ? format(selectedDate, "yyyy-MM-dd") : null,
      selectedTime: time,
      staffMember: staffMember ? {
        id: staffMember.id,
        name: staffMember.name,
        email: "",
        // Will be populated later
        phone: "",
        businessId,
        role: "staff",
        regions: [selectedRegion || ""],
        avatar: staffMember.avatar,
        rating: staffMember.rating,
        isActive: true,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      } : null
    });
  };
  const handleQuickBook = async () => {
    if (!selectedRegion || availableDates.length === 0) return;
    setIsQuickBooking(true);
    try {
      const earliestDate = availableDates[0];
      if (earliestDate) {
        const dateStr = format(earliestDate, "yyyy-MM-dd");
        const slots = await availabilityService.getAvailableSlots(
          businessId,
          selectedRegion,
          dateStr
        );
        if (slots.length > 0) {
          const sortedSlots = slots.sort((a, b) => a.time.localeCompare(b.time));
          const earliestSlot = sortedSlots[0];
          setSelectedDate(earliestDate);
          handleTimeSelect(earliestSlot.time, earliestSlot.staffId);
          setTimeout(() => {
            setIsQuickBooking(false);
          }, 1e3);
        }
      }
    } catch (error) {
      console.error("Error during quick booking:", error);
      setIsQuickBooking(false);
    }
  };
  const canProceed = selectedDate && selectedTime && selectedStaff;
  const formatTime = (time) => {
    const [hours, minutes] = time.split(":");
    const date = /* @__PURE__ */ new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return format(date, "h:mm a");
  };
  const selectedRegionData = regions.find((r) => r.id === selectedRegion);
  return /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-gray-900 mb-2", children: "Pick Your Date & Time" }),
      /* @__PURE__ */ jsxs("p", { className: "text-gray-600 text-lg", children: [
        "Select when you'd like your appointment in ",
        selectedRegionData?.name
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mb-8", children: /* @__PURE__ */ jsx("div", { className: "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-blue-900 mb-2", children: "📅 Book Next Available Appointment" }),
        /* @__PURE__ */ jsx("p", { className: "text-blue-700", children: "Need an appointment ASAP? We'll find and book the earliest available slot for you." })
      ] }),
      /* @__PURE__ */ jsx(
        Button,
        {
          onClick: handleQuickBook,
          disabled: isQuickBooking || availableDates.length === 0,
          className: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105",
          children: isQuickBooking ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" }),
            "Booking..."
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Zap, { className: "h-4 w-4 mr-2" }),
            "Quick Book"
          ] })
        }
      )
    ] }) }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-gray-900 mb-4", children: "Select Date" }),
          /* @__PURE__ */ jsx("div", { className: "bg-white border border-gray-200 rounded-xl p-6 shadow-sm", children: /* @__PURE__ */ jsx(
            Calendar,
            {
              mode: "single",
              selected: selectedDate,
              onSelect: handleDateSelect,
              disabled: (date) => isBefore(date, startOfDay(/* @__PURE__ */ new Date())),
              doubleMonth: true,
              availableDates,
              className: "w-full",
              initialFocus: true
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center space-x-6 text-sm text-gray-600", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
              /* @__PURE__ */ jsx("div", { className: "w-3 h-3 rounded bg-emerald-100 border border-emerald-300 mr-2" }),
              /* @__PURE__ */ jsx("span", { children: "Available dates" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
              /* @__PURE__ */ jsx("div", { className: "w-3 h-3 rounded bg-primary-600 mr-2" }),
              /* @__PURE__ */ jsx("span", { children: "Selected date" })
            ] })
          ] })
        ] }),
        selectedDate && /* @__PURE__ */ jsx("div", { className: "p-6 bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-xl", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
          /* @__PURE__ */ jsx(Calendar$1, { className: "h-6 w-6 text-primary-600 mr-3" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-semibold text-primary-800 text-lg", children: format(selectedDate, "EEEE, MMMM do, yyyy") }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-primary-600", children: isLoading ? /* @__PURE__ */ jsxs("span", { className: "flex items-center", children: [
              /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-3 w-3 border-b border-primary-600 mr-2" }),
              "Loading availability..."
            ] }) : `${availableSlots.length} time slot${availableSlots.length !== 1 ? "s" : ""} available` })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-gray-900", children: "Choose Staff & Time" }),
        selectedDate ? isLoading ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" }) }) : staffWithSlots.length > 0 ? /* @__PURE__ */ jsx("div", { className: "space-y-4", children: staffWithSlots.map((staffWithSlot) => /* @__PURE__ */ jsxs("div", { className: "border border-gray-200 rounded-lg p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center mb-4", children: [
            /* @__PURE__ */ jsxs(Avatar, { className: "h-12 w-12 mr-3", children: [
              /* @__PURE__ */ jsx(AvatarImage, { src: staffWithSlot.staff.avatar }),
              /* @__PURE__ */ jsx(AvatarFallback, { children: staffWithSlot.staff.name.charAt(0) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx("h4", { className: "font-semibold text-gray-900", children: staffWithSlot.staff.name }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center text-sm text-gray-600", children: [
                /* @__PURE__ */ jsxs("span", { className: "flex items-center", children: [
                  "⭐ ",
                  staffWithSlot.staff.rating
                ] }),
                /* @__PURE__ */ jsx("span", { className: "mx-2", children: "•" }),
                /* @__PURE__ */ jsxs("span", { children: [
                  staffWithSlot.slots.length,
                  " slots available"
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-2", children: staffWithSlot.slots.map((time) => /* @__PURE__ */ jsxs(
            Button,
            {
              variant: selectedTime === time && selectedStaff === staffWithSlot.staff.id ? "primary" : "outline",
              size: "sm",
              className: "justify-center",
              onClick: () => handleTimeSelect(time, staffWithSlot.staff.id),
              children: [
                /* @__PURE__ */ jsx(Clock, { className: "h-3 w-3 mr-1" }),
                formatTime(time)
              ]
            },
            time
          )) })
        ] }, staffWithSlot.staff.id)) }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
          /* @__PURE__ */ jsx(Calendar$1, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }),
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "No availability" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "No staff available on this date. Please try another date." })
        ] }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
          /* @__PURE__ */ jsx(Calendar$1, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "Select a date to see available times" })
        ] })
      ] })
    ] }),
    canProceed && /* @__PURE__ */ jsxs("div", { className: "mt-8 p-6 bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-xl", children: [
      /* @__PURE__ */ jsx("h4", { className: "font-semibold text-gray-900 mb-4", children: "Your Selection" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
          /* @__PURE__ */ jsx(Calendar$1, { className: "h-4 w-4 text-primary-600 mr-2" }),
          /* @__PURE__ */ jsx("span", { children: format(selectedDate, "EEEE, MMM do") })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
          /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4 text-primary-600 mr-2" }),
          /* @__PURE__ */ jsx("span", { children: formatTime(selectedTime) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
          /* @__PURE__ */ jsx(User, { className: "h-4 w-4 text-primary-600 mr-2" }),
          /* @__PURE__ */ jsx("span", { children: staffWithSlots.find((s) => s.staff.id === selectedStaff)?.staff.name })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between mt-8 pt-6 border-t", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", size: "lg", onClick: onBack, children: "← Back to Location" }),
      /* @__PURE__ */ jsx(
        Button,
        {
          size: "lg",
          disabled: !canProceed,
          onClick: onNext,
          children: "Continue to Details →"
        }
      )
    ] })
  ] });
}

function CustomerDetails({
  onNext,
  onBack,
  businessName
}) {
  const { customerBooking, updateCustomerBooking } = useAppStore();
  const [formData, setFormData] = useState({
    name: customerBooking.customerInfo.name || "",
    email: customerBooking.customerInfo.email || "",
    phone: customerBooking.customerInfo.phone || "",
    notes: customerBooking.notes || ""
  });
  const [errors, setErrors] = useState({});
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[\d\s\-\+\(\)]{10,}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid phone number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleNext = () => {
    if (!validateForm()) return;
    updateCustomerBooking({
      customerInfo: {
        ...customerBooking.customerInfo,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim()
      },
      notes: formData.notes.trim()
    });
    onNext();
  };
  const formatTime = (time) => {
    const [hours, minutes] = time.split(":");
    const date = /* @__PURE__ */ new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return format(date, "h:mm a");
  };
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-gray-900 mb-2", children: "Your Details" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-lg", children: "Tell us how to reach you about your appointment" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-8 p-6 bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-xl", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900 mb-4", children: "Appointment Summary" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Service:" }),
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: customerBooking.appointmentType.name })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Date:" }),
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: customerBooking.selectedDate && format(new Date(customerBooking.selectedDate), "EEEE, MMMM do, yyyy") })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Time:" }),
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: customerBooking.selectedTime && formatTime(customerBooking.selectedTime) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Staff:" }),
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: customerBooking.staffMember?.name })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Location:" }),
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: customerBooking.customerInfo.address })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "card", children: /* @__PURE__ */ jsx("div", { className: "card-body p-8", children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsxs("label", { className: "form-label text-lg flex items-center", children: [
          /* @__PURE__ */ jsx(User, { className: "h-4 w-4 mr-2 text-gray-500" }),
          "Full Name *"
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            className: `form-input text-lg py-4 ${errors.name ? "border-red-500" : ""}`,
            value: formData.name,
            onChange: (e) => handleInputChange("name", e.target.value),
            placeholder: "John Smith",
            required: true
          }
        ),
        errors.name && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 mt-1", children: errors.name })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsxs("label", { className: "form-label text-lg flex items-center", children: [
          /* @__PURE__ */ jsx(Mail, { className: "h-4 w-4 mr-2 text-gray-500" }),
          "Email Address *"
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "email",
            className: `form-input text-lg py-4 ${errors.email ? "border-red-500" : ""}`,
            value: formData.email,
            onChange: (e) => handleInputChange("email", e.target.value),
            placeholder: "john@example.com",
            required: true
          }
        ),
        errors.email && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 mt-1", children: errors.email }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mt-1", children: "We'll send your confirmation and reminders here" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsxs("label", { className: "form-label text-lg flex items-center", children: [
          /* @__PURE__ */ jsx(Phone, { className: "h-4 w-4 mr-2 text-gray-500" }),
          "Phone Number *"
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "tel",
            className: `form-input text-lg py-4 ${errors.phone ? "border-red-500" : ""}`,
            value: formData.phone,
            onChange: (e) => handleInputChange("phone", e.target.value),
            placeholder: "+61 XXX XXX XXX",
            required: true
          }
        ),
        errors.phone && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 mt-1", children: errors.phone }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mt-1", children: "In case we need to contact you about your appointment" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsxs("label", { className: "form-label text-lg flex items-center", children: [
          /* @__PURE__ */ jsx(MessageSquare, { className: "h-4 w-4 mr-2 text-gray-500" }),
          "Special Requests (Optional)"
        ] }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            className: "form-input text-lg py-4",
            rows: 4,
            value: formData.notes,
            onChange: (e) => handleInputChange("notes", e.target.value),
            placeholder: "Any special requirements or notes for our team..."
          }
        )
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxs(Alert, { className: "mt-6", children: [
      /* @__PURE__ */ jsx(AlertTitle, { children: "Privacy Notice" }),
      /* @__PURE__ */ jsxs(AlertDescription, { children: [
        "Your information will only be used to manage your appointment and will be shared with ",
        businessName,
        ". We won't send you marketing emails unless you opt in."
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between mt-8 pt-6 border-t", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", size: "lg", onClick: onBack, children: "← Back to Date & Time" }),
      /* @__PURE__ */ jsx(
        Button,
        {
          size: "lg",
          onClick: handleNext,
          children: "Review Booking →"
        }
      )
    ] })
  ] });
}

class NotificationService {
  async getNotificationConfig(businessId) {
    try {
      const { data, error } = await supabase.from("notification_configs").select("*").eq("business_id", businessId).single();
      if (error && error.code !== "PGRST116") throw error;
      return data ? {
        emailEnabled: data.email_enabled,
        smsEnabled: data.sms_enabled,
        pushEnabled: data.push_enabled,
        reminder24hEnabled: data.reminder_24h_enabled,
        reminder2hEnabled: data.reminder_2h_enabled,
        businessEmail: data.business_email,
        businessPhone: data.business_phone,
        sendGridApiKey: data.sendgrid_api_key,
        twilioAccountSid: data.twilio_account_sid,
        twilioAuthToken: data.twilio_auth_token,
        twilioPhoneNumber: data.twilio_phone_number
      } : null;
    } catch (error) {
      console.error("Error fetching notification config:", error);
      return null;
    }
  }
  async updateNotificationConfig(businessId, config) {
    try {
      const { error } = await supabase.from("notification_configs").upsert({
        business_id: businessId,
        email_enabled: config.emailEnabled,
        sms_enabled: config.smsEnabled,
        push_enabled: config.pushEnabled,
        reminder_24h_enabled: config.reminder24hEnabled,
        reminder_2h_enabled: config.reminder2hEnabled,
        business_email: config.businessEmail,
        business_phone: config.businessPhone,
        sendgrid_api_key: config.sendGridApiKey,
        twilio_account_sid: config.twilioAccountSid,
        twilio_auth_token: config.twilioAuthToken,
        twilio_phone_number: config.twilioPhoneNumber,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error updating notification config:", error);
      throw error;
    }
  }
  async getNotificationTemplates(businessId) {
    try {
      const { data, error } = await supabase.from("notification_templates").select("*").eq("business_id", businessId).eq("is_active", true);
      if (error) throw error;
      return (data || []).map((template) => ({
        id: template.id,
        name: template.name,
        type: template.type,
        trigger: template.trigger,
        subject: template.subject,
        content: template.content,
        isActive: template.is_active,
        businessId: template.business_id
      }));
    } catch (error) {
      console.error("Error fetching notification templates:", error);
      return [];
    }
  }
  async createNotificationTemplate(template) {
    try {
      const { data, error } = await supabase.from("notification_templates").insert({
        name: template.name,
        type: template.type,
        trigger: template.trigger,
        subject: template.subject,
        content: template.content,
        is_active: template.isActive,
        business_id: template.businessId,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      }).select().single();
      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error("Error creating notification template:", error);
      throw error;
    }
  }
  async scheduleBookingNotifications(bookingId) {
    try {
      const { data: booking, error: bookingError } = await supabase.from("bookings").select(`
          *,
          customers (first_name, last_name, email, phone),
          staff (first_name, last_name),
          appointment_types (name),
          businesses (name, email, phone)
        `).eq("id", bookingId).single();
      if (bookingError) throw bookingError;
      const appointmentDateTime = /* @__PURE__ */ new Date(`${booking.date}T${booking.time}`);
      const now = /* @__PURE__ */ new Date();
      const config = await this.getNotificationConfig(booking.business_id);
      if (!config) return;
      await this.scheduleNotification({
        bookingId,
        notificationType: "booking_created",
        scheduledFor: now.toISOString(),
        recipientEmail: booking.customers.email,
        recipientPhone: booking.customers.phone,
        content: this.generateBookingConfirmationContent(booking),
        subject: `Booking Confirmation - ${booking.businesses.name}`
      });
      if (config.reminder24hEnabled) {
        const reminder24h = subHours(appointmentDateTime, 24);
        if (isBefore(now, reminder24h)) {
          await this.scheduleNotification({
            bookingId,
            notificationType: "reminder_24h",
            scheduledFor: reminder24h.toISOString(),
            recipientEmail: booking.customers.email,
            recipientPhone: booking.customers.phone,
            content: this.generate24HourReminderContent(booking),
            subject: `Reminder: Appointment Tomorrow - ${booking.businesses.name}`
          });
        }
      }
      if (config.reminder2hEnabled) {
        const reminder2h = subHours(appointmentDateTime, 2);
        if (isBefore(now, reminder2h)) {
          await this.scheduleNotification({
            bookingId,
            notificationType: "reminder_2h",
            scheduledFor: reminder2h.toISOString(),
            recipientEmail: booking.customers.email,
            recipientPhone: booking.customers.phone,
            content: this.generate2HourReminderContent(booking),
            subject: `Reminder: Appointment Today - ${booking.businesses.name}`
          });
        }
      }
    } catch (error) {
      console.error("Error scheduling booking notifications:", error);
      throw error;
    }
  }
  async scheduleNotification(notification) {
    try {
      const { error } = await supabase.from("scheduled_notifications").insert({
        booking_id: notification.bookingId,
        notification_type: notification.notificationType,
        scheduled_for: notification.scheduledFor,
        status: "pending",
        recipient_email: notification.recipientEmail,
        recipient_phone: notification.recipientPhone,
        content: notification.content,
        subject: notification.subject,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error scheduling notification:", error);
      throw error;
    }
  }
  async processPendingNotifications() {
    try {
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const { data: notifications, error } = await supabase.from("scheduled_notifications").select(`
          *,
          bookings (
            business_id,
            customers (first_name, last_name),
            businesses (name)
          )
        `).eq("status", "pending").lte("scheduled_for", now);
      if (error) throw error;
      for (const notification of notifications || []) {
        try {
          await this.sendNotification(notification);
          await supabase.from("scheduled_notifications").update({
            status: "sent",
            sent_at: (/* @__PURE__ */ new Date()).toISOString()
          }).eq("id", notification.id);
        } catch (sendError) {
          console.error(`Failed to send notification ${notification.id}:`, sendError);
          await supabase.from("scheduled_notifications").update({
            status: "failed",
            error_message: sendError instanceof Error ? sendError.message : "Unknown error"
          }).eq("id", notification.id);
        }
      }
    } catch (error) {
      console.error("Error processing pending notifications:", error);
    }
  }
  async sendNotification(notification) {
    const businessId = notification.bookings.business_id;
    const config = await this.getNotificationConfig(businessId);
    if (!config) {
      throw new Error("No notification configuration found");
    }
    if (config.emailEnabled && notification.recipient_email) {
      await this.sendEmail({
        to: notification.recipient_email,
        subject: notification.subject,
        content: notification.content,
        businessId
      });
    }
    if (config.smsEnabled && notification.recipient_phone) {
      await this.sendSMS({
        to: notification.recipient_phone,
        content: this.stripHtmlFromContent(notification.content),
        businessId
      });
    }
  }
  async sendEmail({ to, subject, content, businessId }) {
    const config = await this.getNotificationConfig(businessId);
    if (!config?.sendGridApiKey) {
      console.log("SendGrid not configured, logging email instead:", { to, subject });
      return;
    }
    console.log("Sending email:", {
      to,
      subject,
      content: content.substring(0, 100) + "..."
    });
  }
  async sendSMS({ to, content, businessId }) {
    const config = await this.getNotificationConfig(businessId);
    if (!config?.twilioAccountSid) {
      console.log("Twilio not configured, logging SMS instead:", { to, content });
      return;
    }
    console.log("Sending SMS:", {
      to,
      content: content.substring(0, 100) + "..."
    });
  }
  generateBookingConfirmationContent(booking) {
    const appointmentDate = format(new Date(booking.date), "EEEE, MMMM do, yyyy");
    const appointmentTime = format(/* @__PURE__ */ new Date(`${booking.date}T${booking.time}`), "h:mm a");
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Booking Confirmed!</h2>
        <p>Hi ${booking.customers.first_name},</p>
        <p>Your appointment with <strong>${booking.businesses.name}</strong> has been confirmed.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Appointment Details</h3>
          <p><strong>Service:</strong> ${booking.appointment_types.name}</p>
          <p><strong>Date:</strong> ${appointmentDate}</p>
          <p><strong>Time:</strong> ${appointmentTime}</p>
          <p><strong>Staff Member:</strong> ${booking.staff.first_name} ${booking.staff.last_name}</p>
          ${booking.location ? `<p><strong>Location:</strong> ${booking.location.address}</p>` : ""}
        </div>
        
        <p>We'll send you a reminder 24 hours before your appointment.</p>
        <p>If you need to reschedule or cancel, please contact us at ${booking.businesses.phone} or ${booking.businesses.email}</p>
        
        <p>Thank you for choosing ${booking.businesses.name}!</p>
      </div>
    `;
  }
  generate24HourReminderContent(booking) {
    const appointmentDate = format(new Date(booking.date), "EEEE, MMMM do, yyyy");
    const appointmentTime = format(/* @__PURE__ */ new Date(`${booking.date}T${booking.time}`), "h:mm a");
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Appointment Reminder</h2>
        <p>Hi ${booking.customers.first_name},</p>
        <p>This is a friendly reminder that you have an appointment scheduled for <strong>tomorrow</strong>.</p>
        
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h3 style="margin-top: 0; color: #92400e;">Tomorrow's Appointment</h3>
          <p><strong>Date:</strong> ${appointmentDate}</p>
          <p><strong>Time:</strong> ${appointmentTime}</p>
          <p><strong>Staff Member:</strong> ${booking.staff.first_name} ${booking.staff.last_name}</p>
          <p><strong>Service:</strong> ${booking.appointment_types.name}</p>
        </div>
        
        <p>Please make sure you're available at the scheduled time. If you need to reschedule, please contact us as soon as possible.</p>
        <p>Contact: ${booking.businesses.phone} or ${booking.businesses.email}</p>
        
        <p>See you tomorrow!</p>
        <p>- ${booking.businesses.name}</p>
      </div>
    `;
  }
  generate2HourReminderContent(booking) {
    const appointmentTime = format(/* @__PURE__ */ new Date(`${booking.date}T${booking.time}`), "h:mm a");
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Appointment Starting Soon!</h2>
        <p>Hi ${booking.customers.first_name},</p>
        <p>Your appointment with <strong>${booking.businesses.name}</strong> starts in approximately 2 hours.</p>
        
        <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="margin-top: 0; color: #991b1b;">Today's Appointment</h3>
          <p><strong>Time:</strong> ${appointmentTime}</p>
          <p><strong>Staff Member:</strong> ${booking.staff.first_name} ${booking.staff.last_name}</p>
          ${booking.location ? `<p><strong>Location:</strong> ${booking.location.address}</p>` : ""}
        </div>
        
        <p>Please ensure you're ready for your appointment. If you're running late or need to reschedule, please contact us immediately.</p>
        <p><strong>Contact:</strong> ${booking.businesses.phone}</p>
        
        <p>Thank you!</p>
        <p>- ${booking.businesses.name}</p>
      </div>
    `;
  }
  stripHtmlFromContent(content) {
    return content.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  }
  async cancelNotificationsForBooking(bookingId) {
    try {
      await supabase.from("scheduled_notifications").update({
        status: "cancelled",
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("booking_id", bookingId).eq("status", "pending");
    } catch (error) {
      console.error("Error cancelling notifications:", error);
    }
  }
  async rescheduleNotificationsForBooking(bookingId, newDate, newTime) {
    try {
      await this.cancelNotificationsForBooking(bookingId);
      await this.scheduleBookingNotifications(bookingId);
    } catch (error) {
      console.error("Error rescheduling notifications:", error);
    }
  }
}

class BookingService {
  availabilityService = new AvailabilityService();
  notificationService = new NotificationService();
  async createBooking(booking) {
    try {
      const isAvailable = await this.isSlotAvailable(
        booking.businessId,
        booking.staffId,
        booking.date,
        booking.time
      );
      if (!isAvailable) {
        throw new Error("This time slot is no longer available");
      }
      const customerId = await this.ensureCustomer(booking.customer, booking.businessId);
      const bookingData = {
        business_id: booking.businessId,
        customer_id: customerId,
        staff_id: booking.staffId,
        appointment_type_id: booking.serviceId,
        date: booking.date,
        time: booking.time,
        duration: booking.duration,
        location: booking.location,
        status: booking.status || "pending",
        notes: booking.notes,
        price: booking.price,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      const { data, error } = await supabase.from("bookings").insert(bookingData).select().single();
      if (error) throw error;
      await this.markSlotAsBooked(
        booking.staffId,
        booking.date,
        booking.time,
        booking.location.region
      );
      await this.notificationService.scheduleBookingNotifications(data.id);
      return data.id;
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  }
  async getBookings(filters = {}) {
    try {
      let query = supabase.from("bookings").select(`
          *,
          customers (
            first_name,
            last_name,
            email,
            phone
          ),
          staff (
            first_name,
            last_name,
            email,
            phone
          ),
          appointment_types (
            name,
            description,
            duration,
            price
          )
        `);
      if (filters.businessId) {
        query = query.eq("business_id", filters.businessId);
      }
      if (filters.staffId) {
        query = query.eq("staff_id", filters.staffId);
      }
      if (filters.customerId) {
        query = query.eq("customer_id", filters.customerId);
      }
      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.dateFrom) {
        query = query.gte("date", filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte("date", filters.dateTo);
      }
      query = query.order("date", { ascending: true }).order("time", { ascending: true });
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching bookings:", error);
      throw error;
    }
  }
  async updateBookingStatus(bookingId, status) {
    try {
      const { data, error } = await supabase.from("bookings").update({ status, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", bookingId).select().single();
      if (error) throw error;
      if (status === "cancelled") {
        await this.freeAvailabilitySlot(bookingId);
        await this.notificationService.cancelNotificationsForBooking(bookingId);
      }
      return data;
    } catch (error) {
      console.error("Error updating booking status:", error);
      throw error;
    }
  }
  async rescheduleBooking(bookingId, newDate, newTime, newStaffId) {
    try {
      const { data: currentBooking, error: fetchError } = await supabase.from("bookings").select("*").eq("id", bookingId).single();
      if (fetchError) throw fetchError;
      const staffId = newStaffId || currentBooking.staff_id;
      const isAvailable = await this.isSlotAvailable(
        currentBooking.business_id,
        staffId,
        newDate,
        newTime
      );
      if (!isAvailable) {
        throw new Error("The new time slot is not available");
      }
      await this.freeAvailabilitySlot(bookingId);
      const { data, error } = await supabase.from("bookings").update({
        date: newDate,
        time: newTime,
        staff_id: staffId,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", bookingId).select().single();
      if (error) throw error;
      await this.markSlotAsBooked(
        staffId,
        newDate,
        newTime,
        currentBooking.location.region
      );
      await this.notificationService.rescheduleNotificationsForBooking(bookingId, newDate, newTime);
      return data;
    } catch (error) {
      console.error("Error rescheduling booking:", error);
      throw error;
    }
  }
  async isSlotAvailable(businessId, staffId, date, time) {
    try {
      const availability = await this.availabilityService.getStaffAvailability(
        staffId,
        date,
        date
      );
      const hasAvailability = availability.some(
        (slot) => slot.date === date && slot.time === time
      );
      if (!hasAvailability) return false;
      const { data: existingBooking } = await supabase.from("bookings").select("id").eq("staff_id", staffId).eq("date", date).eq("time", time).eq("status", "confirmed").maybeSingle();
      return !existingBooking;
    } catch (error) {
      console.error("Error checking slot availability:", error);
      return false;
    }
  }
  async ensureCustomer(customerData, businessId) {
    try {
      const { data: existingCustomer } = await supabase.from("customers").select("id").eq("email", customerData.email).eq("business_id", businessId).maybeSingle();
      if (existingCustomer) {
        return existingCustomer.id;
      }
      const { data: newCustomer, error } = await supabase.from("customers").insert({
        business_id: businessId,
        first_name: customerData.firstName,
        last_name: customerData.lastName,
        email: customerData.email,
        phone: customerData.phone,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      }).select("id").single();
      if (error) throw error;
      return newCustomer.id;
    } catch (error) {
      console.error("Error ensuring customer:", error);
      throw error;
    }
  }
  async markSlotAsBooked(staffId, date, time, region) {
    try {
      await supabase.from("staff_availability").update({
        is_booked: true,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("staff_id", staffId).eq("date", date).eq("time", time).eq("region", region);
    } catch (error) {
      console.error("Error marking slot as booked:", error);
    }
  }
  async freeAvailabilitySlot(bookingId) {
    try {
      const { data: booking } = await supabase.from("bookings").select("staff_id, date, time, location").eq("id", bookingId).single();
      if (booking) {
        await supabase.from("staff_availability").update({
          is_booked: false,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("staff_id", booking.staff_id).eq("date", booking.date).eq("time", booking.time).eq("region", booking.location.region);
      }
    } catch (error) {
      console.error("Error freeing availability slot:", error);
    }
  }
  async sendBookingNotifications(bookingId, type) {
    try {
      const { data: booking } = await supabase.from("bookings").select(`
          *,
          customers (first_name, last_name, email),
          staff (first_name, last_name, email),
          appointment_types (name)
        `).eq("id", bookingId).single();
      if (!booking) return;
      console.log(`Sending ${type} notification for booking:`, {
        bookingId,
        customer: booking.customers,
        staff: booking.staff,
        date: booking.date,
        time: booking.time,
        service: booking.appointment_types?.name
      });
    } catch (error) {
      console.error("Error sending notifications:", error);
    }
  }
  async findBooking(searchQuery) {
    try {
      let query = supabase.from("bookings").select(`
          *,
          customers (
            first_name,
            last_name,
            email,
            phone
          ),
          staff (
            first_name,
            last_name,
            email,
            phone,
            avatar_url
          ),
          appointment_types (
            name,
            description,
            duration,
            price
          ),
          businesses (
            name,
            phone,
            email
          )
        `);
      if (searchQuery.length <= 8) {
        query = query.ilike("id", `%${searchQuery}`);
      } else {
        const { data: customers } = await supabase.from("customers").select("id").eq("email", searchQuery.toLowerCase());
        if (!customers || customers.length === 0) {
          return null;
        }
        const customerIds = customers.map((c) => c.id);
        query = query.in("customer_id", customerIds);
      }
      const { data, error } = await query.single();
      if (error || !data) return null;
      return {
        id: data.id,
        confirmationCode: data.id.slice(-8).toUpperCase(),
        status: data.status,
        serviceName: data.appointment_types?.name || "",
        servicePrice: data.appointment_types?.price,
        duration: data.appointment_types?.duration || data.duration,
        date: data.date,
        time: data.time,
        staffMember: {
          id: data.staff_id,
          name: `${data.staff?.first_name} ${data.staff?.last_name}`,
          avatar: data.staff?.avatar_url
        },
        customer: {
          name: `${data.customers?.first_name} ${data.customers?.last_name}`,
          email: data.customers?.email || "",
          phone: data.customers?.phone || "",
          address: data.location?.address || "",
          postcode: data.location?.postcode || ""
        },
        business: {
          name: data.businesses?.name || "",
          phone: data.businesses?.phone || "",
          email: data.businesses?.email || ""
        },
        notes: data.notes,
        createdAt: data.created_at
      };
    } catch (error) {
      console.error("Error finding booking:", error);
      return null;
    }
  }
  async cancelBooking(bookingId, reason) {
    try {
      const { data, error } = await supabase.from("bookings").update({
        status: "cancelled",
        cancellation_reason: reason,
        cancelled_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", bookingId).select().single();
      if (error) throw error;
      await this.freeAvailabilitySlot(bookingId);
      await this.sendBookingNotifications(bookingId, "status_changed");
      return data;
    } catch (error) {
      console.error("Error cancelling booking:", error);
      throw error;
    }
  }
  async getBookingStats(businessId, staffId) {
    try {
      const filters = { business_id: businessId };
      if (staffId) filters.staff_id = staffId;
      const { data: statusCounts } = await supabase.from("bookings").select("status").match(filters);
      const { data: revenueData } = await supabase.from("bookings").select("price, date").match(filters).eq("status", "completed");
      const stats = {
        total: statusCounts?.length || 0,
        pending: statusCounts?.filter((b) => b.status === "pending").length || 0,
        confirmed: statusCounts?.filter((b) => b.status === "confirmed").length || 0,
        completed: statusCounts?.filter((b) => b.status === "completed").length || 0,
        cancelled: statusCounts?.filter((b) => b.status === "cancelled").length || 0,
        totalRevenue: revenueData?.reduce((sum, b) => sum + (b.price || 0), 0) || 0,
        monthlyRevenue: revenueData?.filter((b) => {
          const bookingDate = new Date(b.date);
          const now = /* @__PURE__ */ new Date();
          return bookingDate.getMonth() === now.getMonth() && bookingDate.getFullYear() === now.getFullYear();
        }).reduce((sum, b) => sum + (b.price || 0), 0) || 0
      };
      return stats;
    } catch (error) {
      console.error("Error getting booking stats:", error);
      throw error;
    }
  }
}

function BookingReceipt({
  bookingId,
  confirmationCode,
  businessData,
  bookingDetails
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const formatTime = (time) => {
    const [hours, minutes] = time.split(":");
    const date = /* @__PURE__ */ new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return format(date, "h:mm a");
  };
  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours} hour${hours > 1 ? "s" : ""}`;
  };
  const generateCalendarEvent = () => {
    const startDate = /* @__PURE__ */ new Date(`${bookingDetails.selectedDate}T${bookingDetails.selectedTime}`);
    const endDate = new Date(startDate.getTime() + bookingDetails.duration * 60 * 1e3);
    const eventData = {
      title: `${bookingDetails.serviceName} - ${businessData?.name}`,
      start: startDate.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""),
      end: endDate.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""),
      description: `Appointment with ${bookingDetails.staffMember.name}\\n${bookingDetails.customerInfo.address}\\nConfirmation: ${confirmationCode}`,
      location: bookingDetails.customerInfo.address
    };
    const googleCalendarUrl2 = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventData.title)}&dates=${eventData.start}/${eventData.end}&details=${encodeURIComponent(eventData.description)}&location=${encodeURIComponent(eventData.location)}`;
    const outlookCalendarUrl2 = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(eventData.title)}&startdt=${eventData.start}&enddt=${eventData.end}&body=${encodeURIComponent(eventData.description)}&location=${encodeURIComponent(eventData.location)}`;
    return { googleCalendarUrl: googleCalendarUrl2, outlookCalendarUrl: outlookCalendarUrl2 };
  };
  const handleDownloadReceipt = async () => {
    setIsDownloading(true);
    try {
      const receiptContent = generateReceiptHTML();
      const blob = new Blob([receiptContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `booking-receipt-${confirmationCode}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading receipt:", error);
    } finally {
      setIsDownloading(false);
    }
  };
  const handleShareBooking = async () => {
    setIsSharing(true);
    try {
      const shareData = {
        title: `Booking Confirmation - ${businessData?.name}`,
        text: `My appointment is confirmed for ${format(new Date(bookingDetails.selectedDate), "EEEE, MMMM do")} at ${formatTime(bookingDetails.selectedTime)}. Confirmation: ${confirmationCode}`,
        url: window.location.href
      };
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`);
        alert("Booking details copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing booking:", error);
    } finally {
      setIsSharing(false);
    }
  };
  const generateReceiptHTML = () => {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Booking Receipt - ${confirmationCode}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
    .confirmation { font-size: 24px; font-weight: bold; color: #3b82f6; }
    .detail-section { margin-bottom: 20px; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .print-only { display: block; }
    @media screen { .print-only { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${businessData?.name}</h1>
    <div class="confirmation">${confirmationCode}</div>
    <p>Booking Confirmation</p>
  </div>
  
  <div class="detail-section">
    <h3>Service Details</h3>
    <div class="detail-row"><span>Service:</span><span>${bookingDetails.serviceName}</span></div>
    <div class="detail-row"><span>Duration:</span><span>${formatDuration(bookingDetails.duration)}</span></div>
    ${bookingDetails.servicePrice ? `<div class="detail-row"><span>Price:</span><span>$${bookingDetails.servicePrice}</span></div>` : ""}
  </div>

  <div class="detail-section">
    <h3>Appointment Details</h3>
    <div class="detail-row"><span>Date:</span><span>${format(new Date(bookingDetails.selectedDate), "EEEE, MMMM do, yyyy")}</span></div>
    <div class="detail-row"><span>Time:</span><span>${formatTime(bookingDetails.selectedTime)}</span></div>
    <div class="detail-row"><span>Staff Member:</span><span>${bookingDetails.staffMember.name}</span></div>
  </div>

  <div class="detail-section">
    <h3>Location</h3>
    <div class="detail-row"><span>Address:</span><span>${bookingDetails.customerInfo.address}</span></div>
    <div class="detail-row"><span>Postcode:</span><span>${bookingDetails.customerInfo.postcode}</span></div>
  </div>

  <div class="detail-section">
    <h3>Contact Information</h3>
    <div class="detail-row"><span>Name:</span><span>${bookingDetails.customerInfo.name}</span></div>
    <div class="detail-row"><span>Email:</span><span>${bookingDetails.customerInfo.email}</span></div>
    <div class="detail-row"><span>Phone:</span><span>${bookingDetails.customerInfo.phone}</span></div>
  </div>

  <div class="print-only">
    <p><strong>Business Contact:</strong><br>
    Phone: ${businessData?.phone}<br>
    Email: ${businessData?.email}</p>
  </div>
</body>
</html>`;
  };
  const { googleCalendarUrl, outlookCalendarUrl } = generateCalendarEvent();
  return /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto bg-white", children: [
    /* @__PURE__ */ jsx("div", { className: "border-b-2 border-primary-600 pb-6 mb-8", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx(FileText, { className: "w-8 h-8 text-primary-600" }) }),
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Digital Receipt" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "Your booking confirmation and receipt" })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-8", children: [
      /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "outline",
          onClick: handleDownloadReceipt,
          disabled: isDownloading,
          className: "flex items-center justify-center",
          children: [
            isDownloading ? /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2" }) : /* @__PURE__ */ jsx(Download, { className: "w-4 h-4 mr-2" }),
            "Download"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "outline",
          onClick: () => window.print(),
          className: "flex items-center justify-center",
          children: [
            /* @__PURE__ */ jsx(FileText, { className: "w-4 h-4 mr-2" }),
            "Print"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "outline",
          onClick: handleShareBooking,
          disabled: isSharing,
          className: "flex items-center justify-center",
          children: [
            isSharing ? /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2" }) : /* @__PURE__ */ jsx(Share, { className: "w-4 h-4 mr-2" }),
            "Share"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "outline",
          onClick: () => window.open(googleCalendarUrl, "_blank"),
          className: "flex items-center justify-center",
          children: [
            /* @__PURE__ */ jsx(Calendar$1, { className: "w-4 h-4 mr-2" }),
            "Add to Calendar"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-xl p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900", children: businessData?.name }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: businessData?.address })
          ] }),
          businessData?.logo && /* @__PURE__ */ jsx("img", { src: businessData.logo, alt: businessData.name, className: "h-12 w-auto" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold text-primary-600 mb-1", children: confirmationCode }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: "Confirmation Code" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "border border-gray-200 rounded-xl p-6", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-gray-900 mb-4", children: "Service Details" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Service:" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: bookingDetails.serviceName })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Duration:" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: formatDuration(bookingDetails.duration) })
            ] }),
            bookingDetails.servicePrice && /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between border-t pt-3", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Price:" }),
              /* @__PURE__ */ jsxs("span", { className: "font-semibold text-lg", children: [
                "$",
                bookingDetails.servicePrice
              ] })
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border border-gray-200 rounded-xl p-6", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-gray-900 mb-4", children: "Appointment" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
              /* @__PURE__ */ jsx(Calendar$1, { className: "h-4 w-4 text-gray-400 mr-2" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "font-medium", children: format(new Date(bookingDetails.selectedDate), "EEEE, MMMM do, yyyy") }),
                /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600", children: formatTime(bookingDetails.selectedTime) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
              /* @__PURE__ */ jsx(User, { className: "h-4 w-4 text-gray-400 mr-2" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
                /* @__PURE__ */ jsxs(Avatar, { className: "h-6 w-6 mr-2", children: [
                  /* @__PURE__ */ jsx(AvatarImage, { src: bookingDetails.staffMember.avatar }),
                  /* @__PURE__ */ jsx(AvatarFallback, { className: "text-xs", children: bookingDetails.staffMember.name.charAt(0) })
                ] }),
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: bookingDetails.staffMember.name })
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "border border-gray-200 rounded-xl p-6", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-gray-900 mb-4", children: "Service Location" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start", children: [
            /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4 text-gray-400 mr-2 mt-0.5" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "font-medium", children: bookingDetails.customerInfo.address }),
              /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600", children: bookingDetails.customerInfo.postcode })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border border-gray-200 rounded-xl p-6", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-gray-900 mb-4", children: "Contact Details" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center text-sm", children: [
              /* @__PURE__ */ jsx(User, { className: "h-4 w-4 text-gray-400 mr-2" }),
              /* @__PURE__ */ jsx("span", { children: bookingDetails.customerInfo.name })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center text-sm", children: [
              /* @__PURE__ */ jsx(Mail, { className: "h-4 w-4 text-gray-400 mr-2" }),
              /* @__PURE__ */ jsx("span", { children: bookingDetails.customerInfo.email })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center text-sm", children: [
              /* @__PURE__ */ jsx(Phone, { className: "h-4 w-4 text-gray-400 mr-2" }),
              /* @__PURE__ */ jsx("span", { children: bookingDetails.customerInfo.phone })
            ] })
          ] })
        ] })
      ] }),
      bookingDetails.notes && /* @__PURE__ */ jsxs("div", { className: "border border-gray-200 rounded-xl p-6", children: [
        /* @__PURE__ */ jsx("h4", { className: "font-semibold text-gray-900 mb-3", children: "Special Instructions" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-700", children: bookingDetails.notes })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-xl p-6", children: [
        /* @__PURE__ */ jsx("h4", { className: "font-semibold text-blue-900 mb-4", children: "=� Add to Calendar" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "outline",
              onClick: () => window.open(googleCalendarUrl, "_blank"),
              className: "justify-start",
              children: [
                /* @__PURE__ */ jsx(Calendar$1, { className: "w-4 h-4 mr-2" }),
                "Google Calendar"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "outline",
              onClick: () => window.open(outlookCalendarUrl, "_blank"),
              className: "justify-start",
              children: [
                /* @__PURE__ */ jsx(Calendar$1, { className: "w-4 h-4 mr-2" }),
                "Outlook Calendar"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "border-t pt-6 text-center text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("p", { className: "font-medium text-gray-900 mb-2", children: [
          "Need to contact ",
          businessData?.name,
          "?"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-center space-x-6", children: [
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: `tel:${businessData?.phone}`,
              className: "flex items-center text-primary-600 hover:underline",
              children: [
                /* @__PURE__ */ jsx(Phone, { className: "w-4 h-4 mr-1" }),
                businessData?.phone
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: `mailto:${businessData?.email}`,
              className: "flex items-center text-primary-600 hover:underline",
              children: [
                /* @__PURE__ */ jsx(Mail, { className: "w-4 h-4 mr-1" }),
                businessData?.email
              ]
            }
          )
        ] })
      ] })
    ] })
  ] });
}

function BookingConfirmation({
  businessId,
  businessData,
  onBack,
  onComplete
}) {
  const { customerBooking, resetCustomerBooking } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [error, setError] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const bookingService = new BookingService();
  const formatTime = (time) => {
    const [hours, minutes] = time.split(":");
    const date = /* @__PURE__ */ new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return format(date, "h:mm a");
  };
  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours} hour${hours > 1 ? "s" : ""}`;
  };
  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (!customerBooking.customerInfo || !customerBooking.selectedDate || !customerBooking.selectedTime || !customerBooking.staffMember || !customerBooking.appointmentType) {
        throw new Error("Missing required booking information");
      }
      const bookingRequest = {
        businessId,
        staffId: customerBooking.staffMember.id,
        serviceId: customerBooking.appointmentType.id,
        date: customerBooking.selectedDate,
        time: customerBooking.selectedTime,
        duration: customerBooking.appointmentType.duration || 60,
        location: {
          address: customerBooking.customerInfo.address,
          postcode: customerBooking.customerInfo.postcode,
          region: customerBooking.selectedRegion || ""
        },
        customer: {
          firstName: customerBooking.customerInfo.name.split(" ")[0] || customerBooking.customerInfo.name,
          lastName: customerBooking.customerInfo.name.split(" ").slice(1).join(" ") || "",
          email: customerBooking.customerInfo.email,
          phone: customerBooking.customerInfo.phone
        },
        notes: customerBooking.notes,
        price: customerBooking.appointmentType.price || 0,
        status: "pending"
      };
      const newBookingId = await bookingService.createBooking(bookingRequest);
      setBookingId(newBookingId);
      setConfirmationCode(newBookingId.slice(-8).toUpperCase());
      setIsConfirmed(true);
      resetCustomerBooking();
      onComplete?.(newBookingId);
    } catch (error2) {
      console.error("Error confirming booking:", error2);
      setError(error2 instanceof Error ? error2.message : "Failed to confirm booking. Please try again or contact us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };
  if (isConfirmed) {
    if (showReceipt) {
      return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "outline",
              onClick: () => setShowReceipt(false),
              children: "← Back to Confirmation"
            }
          ),
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Booking Receipt" }),
          /* @__PURE__ */ jsx("div", {})
        ] }),
        /* @__PURE__ */ jsx(
          BookingReceipt,
          {
            bookingId,
            confirmationCode,
            businessData,
            bookingDetails: {
              serviceName: customerBooking.appointmentType?.name || "",
              servicePrice: customerBooking.appointmentType?.price,
              duration: customerBooking.duration || 60,
              selectedDate: customerBooking.selectedDate || "",
              selectedTime: customerBooking.selectedTime || "",
              staffMember: {
                id: customerBooking.staffMember?.id || "",
                name: customerBooking.staffMember?.name || "",
                avatar: customerBooking.staffMember?.avatar
              },
              customerInfo: {
                name: customerBooking.customerInfo?.name || "",
                email: customerBooking.customerInfo?.email || "",
                phone: customerBooking.customerInfo?.phone || "",
                address: customerBooking.customerInfo?.address || "",
                postcode: customerBooking.customerInfo?.postcode || ""
              },
              notes: customerBooking.notes
            }
          }
        )
      ] });
    }
    return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8", children: /* @__PURE__ */ jsx(CheckCircle, { className: "w-12 h-12 text-green-600" }) }),
      /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-gray-900 mb-4", children: "Booking Confirmed!" }),
      /* @__PURE__ */ jsxs("p", { className: "text-lg text-gray-600 mb-8", children: [
        "Your appointment has been successfully booked with ",
        businessData?.name,
        "."
      ] }),
      /* @__PURE__ */ jsx("div", { className: "card", children: /* @__PURE__ */ jsxs("div", { className: "card-body p-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold text-primary-600 mb-2", children: confirmationCode }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: "Confirmation Code" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4 text-left", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
            /* @__PURE__ */ jsx(Calendar$1, { className: "h-5 w-5 text-gray-400 mr-3" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium", children: customerBooking.selectedDate && format(new Date(customerBooking.selectedDate), "EEEE, MMMM do, yyyy") }),
              /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-600", children: [
                customerBooking.selectedTime && formatTime(customerBooking.selectedTime),
                " • ",
                formatDuration(customerBooking.duration)
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
            /* @__PURE__ */ jsx(User, { className: "h-5 w-5 text-gray-400 mr-3" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
              /* @__PURE__ */ jsxs(Avatar, { className: "h-8 w-8 mr-2", children: [
                /* @__PURE__ */ jsx(AvatarImage, { src: customerBooking.staffMember?.avatar }),
                /* @__PURE__ */ jsx(AvatarFallback, { children: customerBooking.staffMember?.name.charAt(0) })
              ] }),
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: customerBooking.staffMember?.name })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start", children: [
            /* @__PURE__ */ jsx(MapPin, { className: "h-5 w-5 text-gray-400 mr-3 mt-0.5" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium", children: customerBooking.customerInfo.address }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: customerBooking.customerInfo.postcode })
            ] })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl text-left", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-blue-900 mb-3", children: "What happens next?" }),
        /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-blue-800", children: [
          /* @__PURE__ */ jsxs("li", { className: "flex items-center", children: [
            /* @__PURE__ */ jsx(Mail, { className: "h-4 w-4 mr-2" }),
            "You'll receive a confirmation email shortly"
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-center", children: [
            /* @__PURE__ */ jsx(Phone, { className: "h-4 w-4 mr-2" }),
            "Our team may call to confirm details"
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-center", children: [
            /* @__PURE__ */ jsx(Calendar$1, { className: "h-4 w-4 mr-2" }),
            "You'll get a reminder 24 hours before"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-8 text-center text-sm text-gray-600", children: [
        /* @__PURE__ */ jsx("p", { children: "Questions about your booking?" }),
        /* @__PURE__ */ jsxs("p", { children: [
          "Contact ",
          businessData?.name,
          " at",
          " ",
          /* @__PURE__ */ jsx("a", { href: `tel:${businessData?.phone}`, className: "text-primary-600 hover:underline", children: businessData?.phone }),
          " ",
          "or",
          " ",
          /* @__PURE__ */ jsx("a", { href: `mailto:${businessData?.email}`, className: "text-primary-600 hover:underline", children: businessData?.email })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8", children: [
        /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "outline",
            size: "lg",
            onClick: () => setShowReceipt(true),
            className: "flex items-center justify-center",
            children: [
              /* @__PURE__ */ jsx(FileText, { className: "w-4 h-4 mr-2" }),
              "View Receipt"
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "outline",
            size: "lg",
            onClick: () => window.print(),
            className: "flex items-center justify-center",
            children: "Print Confirmation"
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            size: "lg",
            onClick: () => window.location.href = "/",
            children: "Book Another"
          }
        )
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-gray-900 mb-2", children: "Review & Confirm" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-lg", children: "Please review your booking details before confirming" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "card", children: [
        /* @__PURE__ */ jsx("div", { className: "card-header", children: /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: "Appointment Details" }) }),
        /* @__PURE__ */ jsxs("div", { className: "card-body space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Service:" }),
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: customerBooking.appointmentType.name })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Duration:" }),
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: formatDuration(customerBooking.duration) })
          ] }),
          customerBooking.appointmentType.price && /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Price:" }),
            /* @__PURE__ */ jsxs("span", { className: "font-medium text-lg", children: [
              "$",
              customerBooking.appointmentType.price
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "card", children: [
        /* @__PURE__ */ jsx("div", { className: "card-header", children: /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: "When & Who" }) }),
        /* @__PURE__ */ jsxs("div", { className: "card-body space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
            /* @__PURE__ */ jsx(Calendar$1, { className: "h-5 w-5 text-gray-400 mr-3" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium", children: customerBooking.selectedDate && format(new Date(customerBooking.selectedDate), "EEEE, MMMM do, yyyy") }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: customerBooking.selectedTime && formatTime(customerBooking.selectedTime) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
            /* @__PURE__ */ jsx(User, { className: "h-5 w-5 text-gray-400 mr-3" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
              /* @__PURE__ */ jsxs(Avatar, { className: "h-10 w-10 mr-3", children: [
                /* @__PURE__ */ jsx(AvatarImage, { src: customerBooking.staffMember?.avatar }),
                /* @__PURE__ */ jsx(AvatarFallback, { children: customerBooking.staffMember?.name.charAt(0) })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "font-medium", children: customerBooking.staffMember?.name }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center text-sm text-gray-600", children: [
                  "⭐ ",
                  customerBooking.staffMember?.rating
                ] })
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "card", children: [
        /* @__PURE__ */ jsx("div", { className: "card-header", children: /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: "Location" }) }),
        /* @__PURE__ */ jsx("div", { className: "card-body", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start", children: [
          /* @__PURE__ */ jsx(MapPin, { className: "h-5 w-5 text-gray-400 mr-3 mt-0.5" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium", children: customerBooking.customerInfo.address }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: customerBooking.customerInfo.postcode })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "card", children: [
        /* @__PURE__ */ jsx("div", { className: "card-header", children: /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: "Contact Information" }) }),
        /* @__PURE__ */ jsxs("div", { className: "card-body space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
            /* @__PURE__ */ jsx(User, { className: "h-5 w-5 text-gray-400 mr-3" }),
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: customerBooking.customerInfo.name })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
            /* @__PURE__ */ jsx(Mail, { className: "h-5 w-5 text-gray-400 mr-3" }),
            /* @__PURE__ */ jsx("span", { children: customerBooking.customerInfo.email })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
            /* @__PURE__ */ jsx(Phone, { className: "h-5 w-5 text-gray-400 mr-3" }),
            /* @__PURE__ */ jsx("span", { children: customerBooking.customerInfo.phone })
          ] }),
          customerBooking.notes && /* @__PURE__ */ jsxs("div", { className: "flex items-start", children: [
            /* @__PURE__ */ jsx(MessageSquare, { className: "h-5 w-5 text-gray-400 mr-3 mt-0.5" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-700", children: customerBooking.notes })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-8 p-4 bg-gray-50 rounded-lg", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: "By confirming this booking, you agree to our terms of service and cancellation policy. You can cancel or reschedule up to 24 hours before your appointment." }) }),
    error && /* @__PURE__ */ jsx(Alert, { variant: "destructive", className: "mt-6", children: /* @__PURE__ */ jsx(AlertDescription, { children: error }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between mt-8 pt-6 border-t", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", size: "lg", onClick: onBack, disabled: isSubmitting, children: "← Back to Details" }),
      /* @__PURE__ */ jsx(
        Button,
        {
          size: "lg",
          onClick: handleConfirmBooking,
          disabled: isSubmitting,
          children: isSubmitting ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" }),
            "Confirming..."
          ] }) : "Confirm Booking"
        }
      )
    ] })
  ] });
}

function BookingProgress({
  currentStep,
  totalSteps,
  onStepClick
}) {
  const steps = [
    { id: 1, name: "Service", description: "Choose your service" },
    { id: 2, name: "Location", description: "Enter your address" },
    { id: 3, name: "Date & Time", description: "Pick your slot" },
    { id: 4, name: "Details", description: "Your information" },
    { id: 5, name: "Confirm", description: "Review & book" }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
    /* @__PURE__ */ jsx("div", { className: "hidden md:block", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: steps.map((step, index) => /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          onClick: () => onStepClick?.(step.id),
          className: clsx(
            "flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold transition-all duration-300",
            {
              "bg-orange text-cream": step.id === currentStep,
              "bg-charcoal text-cream": step.id < currentStep,
              "bg-lightgray text-darkgray": step.id > currentStep,
              "cursor-pointer hover:bg-orange/80": onStepClick && step.id < currentStep,
              "cursor-default": !onStepClick || step.id >= currentStep
            }
          ),
          children: step.id < currentStep ? /* @__PURE__ */ jsx("svg", { className: "w-6 h-6", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx(
            "path",
            {
              fillRule: "evenodd",
              d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
              clipRule: "evenodd"
            }
          ) }) : step.id
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "ml-4", children: [
        /* @__PURE__ */ jsx("p", { className: clsx(
          "text-base font-bold transition-colors",
          {
            "text-charcoal": step.id <= currentStep,
            "text-darkgray/60": step.id > currentStep
          }
        ), children: step.name }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-darkgray/80", children: step.description })
      ] }),
      index < steps.length - 1 && /* @__PURE__ */ jsx(
        "div",
        {
          className: clsx(
            "flex-1 h-1 mx-6 transition-colors rounded-full",
            {
              "bg-orange": step.id < currentStep,
              "bg-lightgray": step.id >= currentStep
            }
          )
        }
      )
    ] }, step.id)) }) }),
    /* @__PURE__ */ jsxs("div", { className: "md:hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-lg font-bold text-charcoal", children: [
          "Step ",
          currentStep,
          " of ",
          totalSteps
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-base font-medium text-darkgray", children: [
          Math.round(currentStep / totalSteps * 100),
          "% Complete"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "w-full bg-lightgray rounded-full h-3 mb-6", children: /* @__PURE__ */ jsx(
        "div",
        {
          className: "bg-orange h-3 rounded-full transition-all duration-500 ease-out",
          style: { width: `${currentStep / totalSteps * 100}%` }
        }
      ) }),
      /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-2xl font-black text-charcoal", children: steps[currentStep - 1]?.name }),
        /* @__PURE__ */ jsx("p", { className: "text-base text-darkgray mt-2", children: steps[currentStep - 1]?.description })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-center mt-8 space-x-3", children: steps.map((step) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => onStepClick?.(step.id),
          disabled: !onStepClick || step.id >= currentStep,
          className: clsx(
            "w-3 h-3 rounded-full transition-colors duration-200",
            {
              "bg-orange": step.id <= currentStep,
              "bg-lightgray": step.id > currentStep
            }
          )
        },
        step.id
      )) })
    ] })
  ] });
}

function BookingFlow({
  businessId,
  businessData,
  embedded = false,
  onComplete
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [business, setBusiness] = useState(businessData || null);
  const [regions, setRegions] = useState([]);
  const [appointmentTypes, setAppointmentTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(!businessData);
  const [error, setError] = useState(null);
  const { customerBooking, updateCustomerBooking, resetCustomerBooking } = useAppStore();
  useEffect(() => {
    if (businessId && !businessData) {
      loadBusinessData();
    } else if (businessData) {
      loadRegionsAndServices();
    }
  }, [businessId, businessData]);
  useEffect(() => {
    resetCustomerBooking();
  }, []);
  const loadBusinessData = async () => {
    try {
      setIsLoading(true);
      const { data, error: error2 } = await supabase.from("businesses").select(`
          *,
          regions (*),
          appointment_types (*)
        `).eq("id", businessId).single();
      if (error2) throw error2;
      setBusiness({
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        website: data.website,
        description: data.description,
        logo: data.logo,
        ownerId: data.owner_id,
        industry: {
          id: data.industry_id,
          name: data.industry_id,
          category: "other",
          defaultServices: [],
          fieldMapping: {}
        },
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        settings: data.settings || {},
        integrations: data.integrations || {}
      });
      setRegions(data.regions.map((r) => ({
        id: r.id,
        businessId: r.business_id,
        name: r.name,
        color: r.color,
        postcodes: r.postcodes,
        isActive: r.is_active,
        description: r.description
      })));
      setAppointmentTypes(data.appointment_types.filter((t) => t.is_active));
    } catch (error2) {
      console.error("Error loading business data:", error2);
      setError("Unable to load booking information. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const loadRegionsAndServices = async () => {
    if (!businessData) return;
    try {
      const [regionsResponse, servicesResponse] = await Promise.all([
        supabase.from("regions").select("*").eq("business_id", businessData.id).eq("is_active", true),
        supabase.from("appointment_types").select("*").eq("business_id", businessData.id).eq("is_active", true)
      ]);
      if (regionsResponse.data) {
        setRegions(regionsResponse.data.map((r) => ({
          id: r.id,
          businessId: r.business_id,
          name: r.name,
          color: r.color,
          postcodes: r.postcodes,
          isActive: r.is_active,
          description: r.description
        })));
      }
      if (servicesResponse.data) {
        setAppointmentTypes(servicesResponse.data);
      }
    } catch (error2) {
      console.error("Error loading regions and services:", error2);
    }
  };
  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };
  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };
  const handleStepClick = (step) => {
    if (step < currentStep) {
      setCurrentStep(step);
    }
  };
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return /* @__PURE__ */ jsx(
          ServiceSelection,
          {
            appointmentTypes,
            onNext: handleNext,
            businessName: business?.name || ""
          }
        );
      case 2:
        return /* @__PURE__ */ jsx(
          LocationInput,
          {
            regions,
            onNext: handleNext,
            onBack: handleBack
          }
        );
      case 3:
        return /* @__PURE__ */ jsx(
          DateTimeSelection,
          {
            businessId,
            regions,
            onNext: handleNext,
            onBack: handleBack
          }
        );
      case 4:
        return /* @__PURE__ */ jsx(
          CustomerDetails,
          {
            onNext: handleNext,
            onBack: handleBack,
            businessName: business?.name || ""
          }
        );
      case 5:
        return /* @__PURE__ */ jsx(
          BookingConfirmation,
          {
            businessId,
            businessData: business,
            onBack: handleBack,
            onComplete
          }
        );
      default:
        return null;
    }
  };
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-cream flex items-center justify-center px-6", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-20 w-20 border-4 border-lightgray border-t-orange mx-auto mb-8" }),
      /* @__PURE__ */ jsx("p", { className: "text-2xl text-charcoal font-bold", children: "Loading your booking experience" }),
      /* @__PURE__ */ jsx("p", { className: "text-lg text-darkgray mt-3", children: "This will just take a moment" })
    ] }) });
  }
  if (error) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-cream flex items-center justify-center px-6", children: /* @__PURE__ */ jsxs("div", { className: "text-center max-w-md mx-auto", children: [
      /* @__PURE__ */ jsx("div", { className: "w-24 h-24 bg-lightgray rounded-3xl flex items-center justify-center mx-auto mb-8", children: /* @__PURE__ */ jsx("svg", { className: "w-12 h-12 text-orange", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }),
      /* @__PURE__ */ jsx("h2", { className: "text-3xl font-black text-charcoal mb-4", children: "Booking Unavailable" }),
      /* @__PURE__ */ jsx("p", { className: "text-lg text-darkgray mb-10 leading-relaxed", children: error }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => window.location.reload(),
          className: "inline-flex items-center justify-center px-10 py-5 bg-orange hover:bg-orange/90 text-cream font-bold text-lg rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg",
          children: "Try Again"
        }
      )
    ] }) });
  }
  const containerClass = embedded ? "max-w-2xl mx-auto" : "min-h-screen bg-cream";
  return /* @__PURE__ */ jsxs("div", { className: containerClass, children: [
    !embedded && /* @__PURE__ */ jsx("div", { className: "bg-cream", children: /* @__PURE__ */ jsx("div", { className: "max-w-4xl mx-auto px-6 py-8", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h1", { className: "text-5xl font-black text-charcoal leading-tight tracking-tight", children: [
          "Book with ",
          business?.name
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-lg text-darkgray mt-4 font-medium", children: "Schedule your appointment in just a few steps" })
      ] }),
      business?.logo && /* @__PURE__ */ jsx(
        "img",
        {
          src: business.logo,
          alt: business.name,
          className: "h-16 w-auto"
        }
      )
    ] }) }) }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto px-6 py-12", children: [
      /* @__PURE__ */ jsx(
        BookingProgress,
        {
          currentStep,
          totalSteps: 5,
          onStepClick: handleStepClick
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "mt-12 step-container", children: renderStep() })
    ] })
  ] });
}

const $$Astro = createAstro();
const prerender = false;
async function getStaticPaths() {
  return [];
}
const $$businessId = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$businessId;
  const { businessId } = Astro2.params;
  if (!businessId) {
    return Astro2.redirect("/404");
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Book Appointment" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "BookingFlow", BookingFlow, { "businessId": businessId, "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/aidenwood/Desktop/00 - Aidxn/BookMyStaff/src/components/Booking/BookingFlow", "client:component-export": "default" })} ` })}`;
}, "/Users/aidenwood/Desktop/00 - Aidxn/BookMyStaff/src/pages/booking/[businessId].astro", void 0);

const $$file = "/Users/aidenwood/Desktop/00 - Aidxn/BookMyStaff/src/pages/booking/[businessId].astro";
const $$url = "/booking/[businessId]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$businessId,
  file: $$file,
  getStaticPaths,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
