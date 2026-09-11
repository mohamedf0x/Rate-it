const ar = {
  header: {
    browse: "استكشف",
    login: "تسجيل الدخول",
    signup: "إنشاء حساب",
    logout: "تسجيل الخروج",
    xp: "نقطة خبرة",
  },
  home: {
    title: "Rate It",
    subtitle:
      "قيّم المحلات والمطاعم والصيدليات وصالات الألعاب وملاعب البادل والكورة — وكمان المنتجات والخدمات اللي جواها. اكسب نقاط خبرة ورُتب وأوسمة كمراجع، والأماكن نفسها بتترقى في تصنيفها مع كل تقييم حقيقي.",
  },
  auth: {
    login: {
      title: "تسجيل الدخول",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      submit: "تسجيل الدخول",
      submitting: "جاري تسجيل الدخول…",
      noAccount: "معندكش حساب؟",
      signupLink: "أنشئ حساب",
      genericError: "حصل خطأ، حاول تاني",
    },
    signup: {
      title: "إنشاء حساب",
      displayName: "الاسم الظاهر",
      username: "اسم المستخدم",
      usernameHint: "من ٣ لـ ٢٤ حرف إنجليزي أو رقم أو شرطة سفلية",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      passwordHint: "٨ أحرف على الأقل",
      submit: "إنشاء حساب",
      submitting: "جاري إنشاء الحساب…",
      haveAccount: "عندك حساب بالفعل؟",
      loginLink: "سجّل دخولك",
      genericError: "حصل خطأ، حاول تاني",
    },
  },
} as const;

export default ar;

type Stringify<T> = { [K in keyof T]: T[K] extends string ? string : Stringify<T[K]> };

/** Shape every locale dictionary must match — same keys, plain strings as values. */
export type Dictionary = Stringify<typeof ar>;
