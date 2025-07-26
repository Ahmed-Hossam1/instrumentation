export interface DeviceBase {
  id: string;
  tag: string;
  deviceType: string;
  type: string;
  location: string;
  status: string | "يعمل" | "لا يعمل" | "تالف" | "يحتاج إلى معايرة";
  image: string | File;
  video: string | File;
  needs_scaffold: boolean;
  needs_isolation: boolean;
  isSpareExist: boolean;
  howManySpares: number;
  description: string;
  created_at: string;
  range: string;
}

// Transmitter device
export interface Transmitter extends DeviceBase {
  last_calibration: string; // date as string
}

// Switch device
export interface SwitchDevice extends DeviceBase {
  last_calibration: string;
  set_point: string;
}

// Valve device
export interface ValveDevice extends Omit<DeviceBase, "range"> {
  valve_type: string;
  action_type: string;
  is_control: boolean;
  last_maintenance: string;
  size: string;
}

export interface Indicators extends DeviceBase {
  last_calibration: string;
}

// Union Type لكل الأجهزة
export type DeviceUnion = Transmitter | SwitchDevice | ValveDevice;

export interface MalfunctionData {
  id: number;
  title: string;
  description: string;
  severity: string;
  importance: string;
  created_at: string;
}

export interface thumbnail {
  id: string | number;
  image_url: string;
}

export interface calibration {
  id: string;
  image: string;
  video: string;
  name: string;
  type: string;
}

export interface users {
  uuid: string;
  name: string;
  email: string;
  password: string;
  image: string | File;
}

export type Field = {
  name: string;
  label: string;
  type: "text" | "date" | "select" | "checkbox" | "file";
  options?: string[]; // للـ select
  placeholder?: string;
};

export const formConfig: Record<string, Field[]> = {
  transmitters: [
    {
      name: "id",
      label: "🆔 ID",
      type: "text",
      placeholder: "اكتب رقم الجهاز (مثلاً PT-1001)",
    },
    {
      name: "tag",
      label: "🏷️ Tag",
      type: "text",
      placeholder: "اكتب التاج بتاع الجهاز",
    },
    {
      name: "deviceType",
      label: "📟  الجهاز",
      type: "select",
      options: ["transmitters"],
    },
    {
      name: "type",
      label: "🧪 اختار  النوع ",
      type: "select",
      options: [
        "Pressure Transmitter",
        "Temperature Transmitter",
        "Level Transmitter",
        "Flow Transmitter",
      ],
      placeholder: "اختار نوع الترانسمتر",
    },
    {
      name: "location",
      label: "📍 المكان",
      type: "text",
      placeholder: "اكتب المكان (مثلاً عند Tank 4)",
    },
    {
      name: "status",
      label: "🔧 الحالة",
      type: "select",
      options: ["يعمل", "لا يعمل", "تالف", "يحتاج إلى معايرة"],
      placeholder: "اختار حالة الجهاز",
    },
    {
      name: "image",
      label: "🖼️ صورة",
      type: "file",
      placeholder: "ارفع صورة للجهاز",
    },
    {
      name: "video",
      label: "🎥 فيديو",
      type: "file",
      placeholder: "ارفع فيديو لو متاح",
    },
    {
      name: "needs_scaffold",
      label: "🪜 محتاج سقالة؟",
      type: "checkbox",
      placeholder: "هل الجهاز محتاج سقالة للوصول؟",
    },
    {
      name: "last_calibration",
      label: "📅 آخر معايرة",
      type: "date",
      placeholder: "اختار آخر تاريخ معايرة",
    },
    {
      name: "range",
      label: "🔁 النطاق",
      type: "text",
      placeholder: "اكتب مدى التشغيل (زي 0-10 بار)",
    },
    {
      name: "needs_isolation",
      label: "🔒 محتاج عزل؟",
      type: "checkbox",
      placeholder: "هل محتاج تعزل الخط؟",
    },
    {
      name: "isSpareExist",
      label: "📦 فيه قطع غيار؟",
      type: "checkbox",
      placeholder: "هل فيه قطع غيار متاحة؟",
    },
    {
      name: "howManySpares",
      label: "🔢 عدد قطع الغيار",
      type: "text",
      placeholder: "اكتب العدد (مثلاً 2)",
    },
    {
      name: "description",
      label: "📝 ملاحظات",
      type: "text",
      placeholder: "اكتب وصف أو ملاحظات عن الجهاز",
    },
    {
      name: "created_at",
      label: "🗓️ تاريخ الإضافة",
      type: "date",
      placeholder: "اختار تاريخ إضافة الجهاز",
    },
  ],

  switches: [
    {
      name: "id",
      label: "🆔 ID",
      type: "text",
      placeholder: "اكتب ID بتاع الجهاز",
    },
    { name: "tag", label: "🏷️ Tag", type: "text", placeholder: "مثال: PS-101" },
    {
      name: "deviceType",
      label: "📟  الجهاز",
      type: "select",
      options: ["switches"],
    },
    {
      name: "type",
      label: "🧪 اختار  النوع ",

      type: "select",
      options: [
        "Pressure Switch High",
        "Pressure Switch High High",
        "Pressure Switch Low",
        "Pressure Switch Low Low",
        "Pressure Deferential Switch High",
        "Pressure Deferential Switch High High",
        "Pressure Deferential Switch Low",
        "Pressure Deferential Switch Low Low",
        "Temperature Switch High",
        "Temperature Switch High High",
        "Temperature Switch Low",
        "Temperature Switch Low Low",
        "Temperature Deferential Switch High",
        "Temperature Deferential Switch High High",
        "Temperature Deferential Switch Low",
        "Temperature Deferential Switch Low Low",
        "Flow Switch High",
        "Flow Switch High High",
        "Flow Switch Low",
        "Flow Switch Low Low",
        "Flow Deferential Switch High",
        "Flow Deferential Switch High High",
        "Flow Deferential Switch Low",
        "Flow Deferential Switch Low Low",
        "Level Switch High",
        "Level Switch High High",
        "Level Switch Low",
        "Level Switch Low Low",
        "Level Deferential Switch High",
        "Level Deferential Switch High High",
        "Level Deferential Switch Low",
        "Level Deferential Switch Low Low",
      ],
      placeholder: "اختار نوع السويتش",
    },
    {
      name: "range",
      label: "📏 النطاق",
      type: "text",
      placeholder: "مثلاً: 0-10 بار",
    },
    {
      name: "set_point",
      label: "🎯 نقطة التشغيل",
      type: "text",
      placeholder: "مثلاً: 5 بار",
    },
    {
      name: "location",
      label: "📍 المكان",
      type: "text",
      placeholder: "مثلاً: Compressor Room",
    },
    {
      name: "status",
      label: "⚙️ الحالة",
      type: "select",
      options: ["يعمل", "لا يعمل", "تالف", "يحتاج إلى معايرة"],
      placeholder: "اختار حالة الجهاز",
    },
    {
      name: "image",
      label: "🖼️ صورة",
      type: "file",
      placeholder: "ارفع صورة للجهاز",
    },
    {
      name: "video",
      label: "🎥 فيديو",
      type: "file",
      placeholder: "ارفع فيديو لو متاح",
    },
    {
      name: "needs_scaffold",
      label: "🪜 محتاج سقالة؟",
      type: "checkbox",
      placeholder: "هل محتاج سقالة للوصول؟",
    },
    {
      name: "needs_isolation",
      label: "🔌 محتاج عزل؟",
      type: "checkbox",
      placeholder: "هل محتاج تعزل الخط؟",
    },
    {
      name: "isSpareExist",
      label: "♻️ فيه قطع غيار؟",
      type: "checkbox",
      placeholder: "هل متوفر قطع غيار؟",
    },
    {
      name: "howManySpares",
      label: "🔢 عدد القطع",
      type: "text",
      placeholder: "اكتب عدد قطع الغيار",
    },
    {
      name: "description",
      label: "📝 ملاحظات",
      type: "text",
      placeholder: "اكتب أي وصف أو ملاحظات",
    },
    {
      name: "last_calibration",
      label: "📆 آخر معايرة",
      type: "date",
      placeholder: "اكتب تاريخ آخر معايرة",
    },
    {
      name: "created_at",
      label: "📅 تاريخ الإضافة",
      type: "date",
      placeholder: "اختار تاريخ الإضافة",
    },
  ],

  valves: [
    {
      name: "id",
      label: "🆔 ID",
      type: "text",
      placeholder: "اكتب رقم البلف (مثلاً V-1001)",
    },
    {
      name: "tag",
      label: "🏷️ Tag",
      type: "text",
      placeholder: "اكتب التاج بتاع البلف",
    },
    {
      name: "deviceType",
      label: "📟  الجهاز",
      type: "select",
      options: ["valves"],
    },
    {
      name: "type",
      label: "🔧 النوع",
      type: "select",
      options: ["Shut-down", "Blue-down", "kv", "xv"],
      placeholder: "اختار نوع البلف",
    },
    {
      name: "valve_type",
      label: "🧰 نوع البلف",
      type: "select",
      options: [
        "Ball Valve",
        "Gate Valve",
        "Globe Valve",
        "Butterfly Valve",
        "Check Valve",
        "Needle Valve",
        "Pressure Relief Valve",
        "Control Valve",
      ],
      placeholder: "اختار نوع حركة البلف",
    },
    {
      name: "action_type",
      label: "⚙️ نوع الحركة",
      type: "select",
      options: [
        "Open/Close",
        "Modulating",
        "Fail Safe Open",
        "Fail Safe Close",
        "Manual",
        "Pneumatic",
        "Electric",
        "Hydraulic",
      ],
      placeholder: "اختار طريقة تشغيل البلف",
    },
    {
      name: "location",
      label: "📍 المكان",
      type: "text",
      placeholder: "اكتب مكان البلف (مثلاً Line 4)",
    },
    {
      name: "status",
      label: "✅ الحالة",
      type: "select",
      options: ["يعمل", "لا يعمل", "تالف", "يحتاج إلى معايرة"],
      placeholder: "اختار حالة البلف",
    },
    {
      name: "image",
      label: "🖼️ صورة",
      type: "file",
      placeholder: "ارفع صورة للبلف",
    },
    {
      name: "video",
      label: "📹 فيديو",
      type: "file",
      placeholder: "ارفع فيديو لو موجود",
    },
    {
      name: "needs_scaffold",
      label: "🪜 محتاج سقالة؟",
      type: "checkbox",
      placeholder: "هل محتاج سقالة للوصول؟",
    },
    {
      name: "needs_isolation",
      label: "🚧 محتاج عزل؟",
      type: "checkbox",
      placeholder: "هل محتاج تعزل الخط؟",
    },
    {
      name: "is_control",
      label: "🎮 بلف تحكم؟",
      type: "checkbox",
      placeholder: "هل البلف ده بلف تحكم؟",
    },
    {
      name: "last_maintenance",
      label: "📅 آخر صيانة",
      type: "date",
      placeholder: "اكتب تاريخ آخر صيانة للبلف",
    },
    {
      name: "size",
      label: "📏 المقاس",
      type: "text",
      placeholder: "اكتب مقاس البلف (مثلاً 2 إنش)",
    },
    {
      name: "isSpareExist",
      label: "🧩 فيه قطع غيار؟",
      type: "checkbox",
      placeholder: "هل فيه قطع غيار متوفرة؟",
    },
    {
      name: "howManySpares",
      label: "🔢 عدد قطع الغيار",
      type: "text",
      placeholder: "اكتب عدد قطع الغيار المتاحة",
    },
    {
      name: "description",
      label: "📝 ملاحظات",
      type: "text",
      placeholder: "اكتب أي ملاحظات أو وصف إضافي",
    },
    {
      name: "created_at",
      label: "📆 تاريخ الإضافة",
      type: "date",
      placeholder: "اختار تاريخ إضافة البلف",
    },
  ],

  indicators: [
    {
      name: "id",
      label: "🆔 ID",
      type: "text",
      placeholder: "ادخل المعرف (مثلاً PI-1001)",
    },
    {
      name: "tag",
      label: "🏷️ Tag",
      type: "text",
      placeholder: "ادخل التاج (مثلاً PI-204)",
    },
    {
      name: "deviceType",
      label: "📦 Device ",
      type: "select",
      options: ["indicators"],
    },
    {
      name: "type",
      label: "📘 Type",
      type: "select",
      options: ["Pressure  indicators ", "Temperature indicators "],
      placeholder: "نوع المؤشر (مثلاً Pressure, Temperature)",
    },
    {
      name: "location",
      label: "📍 Location",
      type: "text",
      placeholder: "ادخل موقع الجهاز",
    },
    {
      name: "status",
      label: "🔧 الحالة",
      type: "select",
      options: ["يعمل", "لا يعمل", "تالف", "يحتاج إلى معايرة"],
      placeholder: "اختر حالة الجهاز",
    },
    {
      name: "image",
      label: "🖼️ صورة الجهاز",
      type: "file",
      placeholder: "ارفع صورة للجهاز",
    },
    {
      name: "video",
      label: "🎥 فيديو للجهاز",
      type: "file",
      placeholder: "ارفع فيديو توضيحي",
    },
    {
      name: "needs_scaffold",
      label: "🪜 يحتاج سقالة؟",
      type: "checkbox",
      placeholder: "",
    },
    {
      name: "needs_isolation",
      label: "🔌 يحتاج عزل؟",
      type: "checkbox",
      placeholder: "",
    },
    {
      name: "isSpareExist",
      label: "🧩 هل يوجد قطع غيار؟",
      type: "checkbox",
      placeholder: "",
    },
    {
      name: "howManySpares",
      label: "🔢 عدد قطع الغيار",
      type: "text",
      placeholder: "ادخل عدد القطع المتاحة",
    },
    {
      name: "description",
      label: "📝 الوصف",
      type: "text",
      placeholder: "اكتب ملاحظات أو وصف عن الجهاز",
    },
    {
      name: "last_calibration",
      label: "🛠️ آخر معايرة",
      type: "date",
      placeholder: "تاريخ آخر معايرة",
    },
    {
      name: "created_at",
      label: "🗓️ تاريخ الإضافة",
      type: "date",
      placeholder: "ادخل تاريخ الإضافة",
    },
  ],

  calibration: [
    { name: "name", label: "🏷️ Name", type: "text", placeholder: "اسم الجهاز" },
    { name: "type", label: "📟 Type", type: "text", placeholder: "نوع الجهاز" },
    { name: "image", label: "🖼️ Image", type: "file" },
    { name: "video", label: "🎥 Video", type: "file" },
  ],

  malfunctions: [
    { name: "title", label: "🏷️ عنوان العطل", type: "text" },
    { name: "description", label: "📝 الوصف", type: "text" },
    {
      name: "severity",
      label: "🔥 درجة الخطورة",
      type: "select",
      options: ["خطير", "متكرر", "متوسط", "بسيط"],
    },
    {
      name: "importance",
      label: "⚠️ مستوى الأهمية",
      type: "select",
      options: ["مهم", "متوسط", "بسيط"],
    },
  ],
};
