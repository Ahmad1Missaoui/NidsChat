import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      common: {
        back_home: "Back to Home",
        back_login: "Back to Login",
        or: "or",
        loading: "Loading..."
      },
      nav: {
        features: "Features",
        download: "Download",
        login: "Log In",
        signup: "Sign Up"
      },
      hero: {
        version_badge: "Version 2.0 Now Live",
        title_prefix: "End-to-End Encrypted.",
        title_highlight: "Zero Ads.",
        description: "Tired of noisy platforms? Nids Chat offers a dedicated space for meaningful interactions. Whether you're building a community or catching up with friends, we provide the tools to keep you connected.",
        cta_start: "Start Chatting",
        cta_signin: "Sign in",
        stats_users: "Users",
        stats_uptime: "Uptime"
      },
      mockup: {
        msg1: "You seeing this sunset right now?",
        msg2: "Unreal. We definitely picked the right trail.",
        msg3: "Totally. Same time next week?",
        typing: "typing...",
        placeholder: "Type a message..."
      },
      features: {
        title: "Why users love NIDS",
        subtitle: "Premium features standard in every conversation.",
        real_time_chat: {
          title: "Real-Time Chat",
          desc: "Instant delivery with typing indicators."
        },
        video_calls: {
          title: "HD Video Calls",
          desc: "Crystal clear communications."
        },
        secure: {
          title: "End-to-End Encryption",
          desc: "Your conversations stay private. Always."
        },
        fast: {
           title: "Zero Ads",
           desc: "No distractions. No data mining. Just chat."
        }
      },
      login: {
        title: "Welcome Back",
        subtitle: "Sign in to continue to NIDSChat",
        email_username_label: "Email or Username",
        email_username_placeholder: "you@example.com or username",
        password_label: "Password",
        password_placeholder: "••••••••",
        signin_button: "Sign In",
        google_button: "Continue with Google",
        no_account: "Don't have an account?",
        signup_link: "Sign Up"
      },
      signup: {
        title: "Create Account",
        subtitle: "Join NIDSChat today",
        fullname_label: "Full Name",
        fullname_placeholder: "John Doe",
        username_label: "Username",
        username_placeholder: "john_doe",
        email_label: "Email",
        email_placeholder: "you@example.com",
        password_label: "Password",
        password_placeholder: "••••••••",
        gender_label: "Gender",
        gender_select: "Select",
        gender_male: "Male",
        gender_female: "Female",
        gender_other: "Other",
        birthday_label: "Birthday",
        country_label: "Country",
        country_placeholder: "Select your country",
        signup_button: "Create Account",
        google_button: "Sign up with Google",
        have_account: "Already have an account?",
        login_link: "Sign In",
        terms_privacy: "By signing up, you agree to our Terms and Privacy Policy"
      },
      chats: {
        title: "All Chats",
        search_placeholder: "Search conversations...",
        filter_all: "All",
        filter_unread: "Unread",
        filter_groups: "Groups",
        no_chats: "No conversations yet",
        no_chats_desc: "Start a new conversation",
        new_chat: "New Chat"
      },
      user_search: {
        title: "Find Friends",
        subtitle: "Search by username or name",
        search_placeholder: "Search by username or name...",
        search_button: "Search",
        no_results: "No users found",
        no_results_desc: "Try searching with a different username or name",
        start_search: "Search for Friends",
        start_search_desc: "Use the search bar above to find and connect with friends",
        add_friend: "Add Friend",
        request_sent: "Request Sent",
        already_friends: "Friends",
        request_pending: "Pending"
      },
      friend_requests: {
        title: "Friend Requests",
        pending: "pending",
        request: "request",
        requests: "requests",
        search_placeholder: "Search requests...",
        no_requests: "No Friend Requests",
        no_requests_desc: "When someone sends you a friend request, it will appear here",
        no_results: "No requests found",
        no_results_desc: "Try searching with a different name",
        accept: "Accept",
        reject: "Reject"
      },
      settings: {
        title: "Settings",
        profile: "Profile",
        password: "Password",
        notifications: "Notifications",
        privacy: "Privacy",
        appearance: "Appearance",
        profile_info: "Profile Information",
        change_photo: "Change Photo",
        full_name: "Full Name",
        username: "Username",
        email: "Email",
        bio: "Bio",
        edit_profile: "Edit Profile",
        save_changes: "Save Changes",
        cancel: "Cancel",
        change_password: "Change Password",
        current_password: "Current Password",
        new_password: "New Password",
        confirm_password: "Confirm Password",
        update_password: "Update Password",
        notification_settings: "Notification Settings",
        message_notifications: "Message Notifications",
        call_notifications: "Call Notifications",
        group_notifications: "Group Notifications",
        sound_enabled: "Sound Enabled",
        privacy_settings: "Privacy Settings",
        profile_photo_visibility: "Profile Photo Visibility",
        last_seen_visibility: "Last Seen Visibility",
        read_receipts: "Read Receipts",
        online_status: "Show Online Status",
        everyone: "Everyone",
        friends: "Friends Only",
        nobody: "Nobody",
        theme_settings: "Theme Settings",
        dark_mode: "Dark Mode",
        light_mode: "Light Mode",
        logout: "Logout",
        logout_confirm: "Are you sure you want to logout?",
        profile_updated: "Profile updated successfully!",
        profile_update_failed: "Failed to update profile",
        password_mismatch: "Passwords do not match",
        password_length: "Password must be at least 6 characters",
        password_updated: "Password updated successfully!",
        password_update_failed: "Failed to update password"
      },
      sidebar: {
        all_chats: "All chats",
        friend_requests: "Friend Requests",
        calls: "Calls",
        groups: "Groups",
        ai_chat: "AI Chat",
        settings: "Settings",
        logout_confirm: "Are you sure you want to logout?"
      },
      calls: {
        title: "Calls",
        subtitle: "Recent call history",
        search_placeholder: "Search calls...",
        filter_all: "all",
        filter_missed: "missed",
        filter_incoming: "incoming",
        filter_outgoing: "outgoing",
        no_calls: "No Calls Found",
        no_calls_adjust: "Try adjusting your filters",
        no_calls_start: "Start a call with your friends from the chat screen",
        yesterday: "Yesterday",
        voice_call: "Voice Call",
        video_call: "Video Call",
        delete_log: "Delete Log"
      },
      groups: {
        title: "Groups",
        create_new: "Create New Group",
        search_placeholder: "Search groups...",
        no_groups: "No groups found",
        no_groups_desc: "Create a group to start chatting with friends.",
        select_group: "Select a Group",
        select_group_desc: "Choose a group from the list to view details or start chatting.",
        members: "members"
      },
      create_group: {
        title: "Create Group",
        subtitle: "Start a new group chat",
        group_name_label: "Group Name",
        group_name_placeholder: "Enter group name...",
        group_avatar_label: "Group Avatar (Optional)",
        choose_photo: "Choose Photo",
        max_size: "Max size: 5MB",
        description_label: "Description (Optional)",
        description_placeholder: "What's this group about?",
        add_members_label: "Add Members",
        search_friends_placeholder: "Search friends...",
        members_selected: "member(s) selected",
        no_friends: "No friends yet",
        no_friends_found: "No friends found",
        cancel: "Cancel",
        create: "Create Group",
        creating: "Creating...",
        error_name: "Please enter a group name",
        error_members: "Please select at least one member",
        error_image_size: "Image must be less than 5MB"
      },
      footer: {
        rights: "© 2026 NIDS Chat Inc."
      }
    }
  },
  fr: {
    translation: {
      common: {
        back_home: "Retour à l'accueil",
        back_login: "Retour à la connexion",
        or: "ou",
        loading: "Chargement..."
      },
       nav: {
        features: "Fonctionnalités",
        download: "Télécharger",
        login: "Connexion",
        signup: "S'inscrire"
      },
      hero: {
        version_badge: "Version 2.0 Disponible",
        title_prefix: "Cryptage de bout en bout.",
        title_highlight: "Zéro publicité.",
        description: "Fatigué des plateformes bruyantes ? Nids Chat offre un espace dédié aux interactions significatives. Que vous construisiez une communauté ou que vous rattrapiez le temps avec des amis, nous fournissons les outils pour vous garder connecté.",
        cta_start: "Commencer",
        cta_signin: "Se connecter",
        stats_users: "Utilisateurs",
        stats_uptime: "Disponibilité"
      },
      mockup: {
        msg1: "Tu vois ce coucher de soleil ?",
        msg2: "Incroyable. On a vraiment choisi le bon sentier.",
        msg3: "Carrément. Pareil la semaine prochaine ?",
        typing: "écrit...",
        placeholder: "Écrivez un message..."
      },
      features: {
        title: "Pourquoi aimer NIDS",
        subtitle: "Fonctionnalités premium standard dans chaque conversation.",
        real_time_chat: {
          title: "Chat en temps réel",
          desc: "Livraison instantanée avec indicateurs de frappe."
        },
        video_calls: {
          title: "Appels vidéo HD",
          desc: "Communications cristallines."
        },
        secure: {
          title: "Cryptage de bout en bout",
          desc: "Vos conversations restent privées. Toujours."
        },
        fast: {
           title: "Zéro publicité",
           desc: "Aucune distraction. Aucune exploitation de données. Juste discuter."
        }
      },
      login: {
        title: "Bon Retour",
        subtitle: "Connectez-vous pour continuer sur NIDSChat",
        email_username_label: "Email ou Nom d'utilisateur",
        email_username_placeholder: "vous@exemple.com ou username",
        password_label: "Mot de passe",
        password_placeholder: "••••••••",
        signin_button: "Se connecter",
        google_button: "Continuer avec Google",
        no_account: "Vous n'avez pas de compte?",
        signup_link: "S'inscrire"
      },
      signup: {
        title: "Créer un Compte",
        subtitle: "Rejoignez NIDSChat aujourd'hui",
        fullname_label: "Nom Complet",
        fullname_placeholder: "Jean Dupont",
        username_label: "Nom d'utilisateur",
        username_placeholder: "jean_dupont",
        email_label: "Email",
        email_placeholder: "vous@exemple.com",
        password_label: "Mot de passe",
        password_placeholder: "••••••••",
        gender_label: "Genre",
        gender_select: "Sélectionner",
        gender_male: "Homme",
        gender_female: "Femme",
        gender_other: "Autre",
        birthday_label: "Date de naissance",
        country_label: "Pays",
        country_placeholder: "Sélectionnez votre pays",
        signup_button: "Créer un compte",
        google_button: "S'inscrire avec Google",
        have_account: "Vous avez déjà un compte?",
        login_link: "Se connecter",
        terms_privacy: "En vous inscrivant, vous acceptez nos Conditions et notre Politique de confidentialité"
      },
      chats: {
        title: "Toutes les Discussions",
        search_placeholder: "Rechercher conversations...",
        filter_all: "Tous",
        filter_unread: "Non lus",
        filter_groups: "Groupes",
        no_chats: "Aucune conversation",
        no_chats_desc: "Commencer une nouvelle conversation",
        new_chat: "Nouvelle Discussion"
      },
      user_search: {
        title: "Trouver des Amis",
        subtitle: "Rechercher par nom d'utilisateur ou nom",
        search_placeholder: "Rechercher par nom d'utilisateur ou nom...",
        search_button: "Rechercher",
        no_results: "Aucun utilisateur trouvé",
        no_results_desc: "Essayez avec un autre nom d'utilisateur ou nom",
        start_search: "Rechercher des Amis",
        start_search_desc: "Utilisez la barre de recherche ci-dessus pour trouver et vous connecter avec des amis",
        add_friend: "Ajouter Ami",
        request_sent: "Demande Envoyée",
        already_friends: "Amis",
        request_pending: "En Attente"
      },
      friend_requests: {
        title: "Demandes d'Amis",
        pending: "en attente",
        request: "demande",
        requests: "demandes",
        search_placeholder: "Rechercher demandes...",
        no_requests: "Aucune Demande d'Ami",
        no_requests_desc: "Lorsque quelqu'un vous envoie une demande d'ami, elle apparaîtra ici",
        no_results: "Aucune demande trouvée",
        no_results_desc: "Essayez avec un autre nom",
        accept: "Accepter",
        reject: "Refuser"
      },
      settings: {
        title: "Paramètres",
        profile: "Profil",
        password: "Mot de passe",
        notifications: "Notifications",
        privacy: "Confidentialité",
        appearance: "Apparence",
        profile_info: "Informations du Profil",
        change_photo: "Changer la Photo",
        full_name: "Nom Complet",
        username: "Nom d'utilisateur",
        email: "Email",
        bio: "Bio",
        edit_profile: "Modifier le Profil",
        save_changes: "Enregistrer",
        cancel: "Annuler",
        change_password: "Changer le Mot de Passe",
        current_password: "Mot de Passe Actuel",
        new_password: "Nouveau Mot de Passe",
        confirm_password: "Confirmer le Mot de Passe",
        update_password: "Mettre à Jour",
        notification_settings: "Paramètres de Notification",
        message_notifications: "Notifications de Messages",
        call_notifications: "Notifications d'Appels",
        group_notifications: "Notifications de Groupes",
        sound_enabled: "Son Activé",
        privacy_settings: "Paramètres de Confidentialité",
        profile_photo_visibility: "Visibilité de la Photo de Profil",
        last_seen_visibility: "Visibilité de Dernière Connexion",
        read_receipts: "Accusés de Lecture",
        online_status: "Afficher le Statut en Ligne",
        everyone: "Tout le Monde",
        friends: "Amis Seulement",
        nobody: "Personne",
        theme_settings: "Paramètres de Thème",
        dark_mode: "Mode Sombre",
        light_mode: "Mode Clair",
        logout: "Déconnexion",
        logout_confirm: "Êtes-vous sûr de vouloir vous déconnecter?",
        profile_updated: "Profil mis à jour avec succès!",
        profile_update_failed: "Échec de la mise à jour du profil",
        password_mismatch: "Les mots de passe ne correspondent pas",
        password_length: "Le mot de passe doit contenir au moins 6 caractères",
        password_updated: "Mot de passe mis à jour avec succès!",
        password_update_failed: "Échec de la mise à jour du mot de passe"
      },
      sidebar: {
        all_chats: "Toutes les discussions",
        friend_requests: "Demandes d'amis",
        calls: "Appels",
        groups: "Groupes",
        ai_chat: "Chat IA",
        settings: "Paramètres",
        logout_confirm: "Êtes-vous sûr de vouloir vous déconnecter?"
      },      calls: {
        title: "Appels",
        subtitle: "Historique des appels récents",
        search_placeholder: "Rechercher des appels...",
        filter_all: "tous",
        filter_missed: "manqués",
        filter_incoming: "entrants",
        filter_outgoing: "sortants",
        no_calls: "Aucun appel trouvé",
        no_calls_adjust: "Essayez d'ajuster vos filtres",
        no_calls_start: "Démarrez un appel avec vos amis depuis l'écran de chat",
        yesterday: "Hier",
        voice_call: "Appel vocal",
        video_call: "Appel vidéo",
        delete_log: "Supprimer l'historique"
      },
      groups: {
        title: "Groupes",
        create_new: "Créer un nouveau groupe",
        search_placeholder: "Rechercher des groupes...",
        no_groups: "Aucun groupe trouvé",
        no_groups_desc: "Créez un groupe pour commencer à discuter avec vos amis.",
        select_group: "Sélectionnez un groupe",
        select_group_desc: "Choisissez un groupe dans la liste pour afficher les détails ou commencer à discuter.",
        members: "membres"
      },
      create_group: {
        title: "Créer un groupe",
        subtitle: "Démarrer une nouvelle discussion de groupe",
        group_name_label: "Nom du groupe",
        group_name_placeholder: "Entrez le nom du groupe...",
        group_avatar_label: "Avatar du groupe (Optionnel)",
        choose_photo: "Choisir une photo",
        max_size: "Taille max : 5 Mo",
        description_label: "Description (Optionnel)",
        description_placeholder: "De quoi parle ce groupe ?",
        add_members_label: "Ajouter des membres",
        search_friends_placeholder: "Rechercher des amis...",
        members_selected: "membre(s) sélectionné(s)",
        no_friends: "Pas encore d'amis",
        no_friends_found: "Aucun ami trouvé",
        cancel: "Annuler",
        create: "Créer le groupe",
        creating: "Création...",
        error_name: "Veuillez entrer un nom de groupe",
        error_members: "Veuillez sélectionner au moins un membre",
        error_image_size: "L'image doit faire moins de 5 Mo"
      },
      footer: {
        rights: "© 2026 NIDS Chat Inc."
      }
    }
  },
  ar: {
    translation: {
      common: {
        back_home: "العودة للصفحة الرئيسية",
        back_login: "العودة لتسجيل الدخول",
        or: "أو",
        loading: "جاري التحميل..."
      },
      nav: {
        features: "المميزات",
        download: "تحميل",
        login: "دخول",
        signup: "تسجيل"
      },
      hero: {
        version_badge: "الإصدار 2.0 متاح الآن",
        title_prefix: "تشفير شامل.",
        title_highlight: "بدون إعلانات.",
        description: "سئمت من المنصات الصاخبة؟ يقدم Nids Chat مساحة مخصصة للتفاعلات الهادفة. سواء كنت تبني مجتمعًا أو تتابع مع الأصدقاء، نحن نوفر الأدوات للحفاظ على اتصالك.",
        cta_start: "ابدأ الدردشة",
        cta_signin: "تسجيل الدخول",
        stats_users: "مستخدم",
        stats_uptime: "وقت التشغيل"
      },
      mockup: {
        msg1: "هل ترى هذا الغروب الآن؟",
        msg2: "خياااال. لقد اخترنا الطريق الصحيح بالتأكيد.",
        msg3: "بالتأكيد. نفس الوقت الأسبوع القادم؟",
        typing: "يكتب...",
        placeholder: "اكتب رسالة..."
      },
      features: {
        title: "لماذا يحب المستخدمون NIDS",
        subtitle: "ميزات مميزة قياسية في كل محادثة.",
        real_time_chat: {
          title: "محادثة فورية",
          desc: "توصيل فوري مع مؤشرات الكتابة."
        },
        video_calls: {
          title: "مكالمات فيديو HD",
          desc: "اتصالات فائقة الوضوح."
        },
        secure: {
          title: "تشفير شامل",
          desc: "محادثاتك تبقى خاصة. دائماً."
        },
        fast: {
           title: "بدون إعلانات",
           desc: "لا إلهاء. لا استغلال للبيانات. مجرد دردشة."
        }
      },
      login: {
        title: "مرحباً بعودتك",
        subtitle: "سجل الدخول للمتابعة إلى NIDSChat",
        email_username_label: "البريد الإلكتروني أو اسم المستخدم",
        email_username_placeholder: "you@example.com أو اسم المستخدم",
        password_label: "كلمة المرور",
        password_placeholder: "••••••••",
        signin_button: "تسجيل الدخول",
        google_button: "المتابعة باستخدام Google",
        no_account: "ليس لديك حساب؟",
        signup_link: "إنشاء حساب"
      },
      signup: {
        title: "إنشاء حساب",
        subtitle: "انضم إلى NIDSChat اليوم",
        fullname_label: "الاسم الكامل",
        fullname_placeholder: "أحمد محمد",
        username_label: "اسم المستخدم",
        username_placeholder: "ahmad_mohamed",
        email_label: "البريد الإلكتروني",
        email_placeholder: "you@example.com",
        password_label: "كلمة المرور",
        password_placeholder: "••••••••",
        gender_label: "الجنس",
        gender_select: "اختر",
        gender_male: "ذكر",
        gender_female: "أنثى",
        gender_other: "آخر",
        birthday_label: "تاريخ الميلاد",
        country_label: "البلد",
        country_placeholder: "اختر بلدك",
        signup_button: "إنشاء حساب",
        google_button: "التسجيل باستخدام Google",
        have_account: "هل لديك حساب بالفعل؟",
        login_link: "تسجيل الدخول",
        terms_privacy: "بالتسجيل، أنت توافق على الشروط وسياسة الخصوصية"
      },
      chats: {
        title: "جميع المحادثات",
        search_placeholder: "البحث في المحادثات...",
        filter_all: "الكل",
        filter_unread: "غير مقروءة",
        filter_groups: "المجموعات",
        no_chats: "لا توجد محادثات بعد",
        no_chats_desc: "ابدأ محادثة جديدة",
        new_chat: "محادثة جديدة"
      },
      user_search: {
        title: "البحث عن الأصدقاء",
        subtitle: "البحث باسم المستخدم أو الاسم",
        search_placeholder: "البحث باسم المستخدم أو الاسم...",
        search_button: "بحث",
        no_results: "لم يتم العثور على مستخدمين",
        no_results_desc: "جرب البحث باسم مستخدم أو اسم مختلف",
        start_search: "ابحث عن الأصدقاء",
        start_search_desc: "استخدم شريط البحث أعلاه للعثور على الأصدقاء والتواصل معهم",
        add_friend: "إضافة صديق",
        request_sent: "تم الإرسال",
        already_friends: "أصدقاء",
        request_pending: "قيد الانتظار"
      },
      friend_requests: {
        title: "طلبات الصداقة",
        pending: "قيد الانتظار",
        request: "طلب",
        requests: "طلبات",
        search_placeholder: "البحث في الطلبات...",
        no_requests: "لا توجد طلبات صداقة",
        no_requests_desc: "عندما يرسل لك شخص ما طلب صداقة، سيظهر هنا",
        no_results: "لم يتم العثور على طلبات",
        no_results_desc: "جرب البحث باسم مختلف",
        accept: "قبول",
        reject: "رفض"
      },
      settings: {
        title: "الإعدادات",
        profile: "الملف الشخصي",
        password: "كلمة المرور",
        notifications: "الإشعارات",
        privacy: "الخصوصية",
        appearance: "المظهر",
        profile_info: "معلومات الملف الشخصي",
        change_photo: "تغيير الصورة",
        full_name: "الاسم الكامل",
        username: "اسم المستخدم",
        email: "البريد الإلكتروني",
        bio: "السيرة الذاتية",
        edit_profile: "تعديل الملف الشخصي",
        save_changes: "حفظ التغييرات",
        cancel: "إلغاء",
        change_password: "تغيير كلمة المرور",
        current_password: "كلمة المرور الحالية",
        new_password: "كلمة المرور الجديدة",
        confirm_password: "تأكيد كلمة المرور",
        update_password: "تحديث كلمة المرور",
        notification_settings: "إعدادات الإشعارات",
        message_notifications: "إشعارات الرسائل",
        call_notifications: "إشعارات المكالمات",
        group_notifications: "إشعارات المجموعات",
        sound_enabled: "الصوت مفعّل",
        privacy_settings: "إعدادات الخصوصية",
        profile_photo_visibility: "رؤية صورة الملف الشخصي",
        last_seen_visibility: "رؤية آخر ظهور",
        read_receipts: "إيصالات القراءة",
        online_status: "إظهار الحالة المتصلة",
        everyone: "الجميع",
        friends: "الأصدقاء فقط",
        nobody: "لا أحد",
        theme_settings: "إعدادات السمة",
        dark_mode: "الوضع الداكن",
        light_mode: "الوضع الفاتح",
        logout: "تسجيل الخروج",
        logout_confirm: "هل أنت متأكد من تسجيل الخروج؟",
        profile_updated: "تم تحديث الملف الشخصي بنجاح!",
        profile_update_failed: "فشل تحديث الملف الشخصي",
        password_mismatch: "كلمات المرور غير متطابقة",
        password_length: "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل",
        password_updated: "تم تحديث كلمة المرور بنجاح!",
        password_update_failed: "فشل تحديث كلمة المرور"
      },
      sidebar: {
        all_chats: "جميع المحادثات",
        friend_requests: "طلبات الصداقة",
        calls: "المكالمات",
        groups: "المجموعات",
        ai_chat: "دردشة الذكاء الاصطناعي",
        settings: "الإعدادات",
        logout_confirm: "هل أنت متأكد من تسجيل الخروج؟"
      },
      calls: {
        title: "المكالمات",
        subtitle: "سجل المكالمات الأخيرة",
        search_placeholder: "البحث في المكالمات...",
        filter_all: "الكل",
        filter_missed: "الفائتة",
        filter_incoming: "الواردة",
        filter_outgoing: "الصادرة",
        no_calls: "لم يتم العثور على مكالمات",
        no_calls_adjust: "جرب تعديل الفلاتر",
        no_calls_start: "ابدأ مكالمة مع أصدقائك من شاشة الدردشة",
        yesterday: "أمس",
        voice_call: "مكالمة صوتية",
        video_call: "مكالمة فيديو",
        delete_log: "حذف السجل"
      },
      groups: {
        title: "المجموعات",
        create_new: "إنشاء مجموعة جديدة",
        search_placeholder: "البحث في المجموعات...",
        no_groups: "لم يتم العثور على مجموعات",
        no_groups_desc: "أنشئ مجموعة لبدء الدردشة مع الأصدقاء.",
        select_group: "اختر مجموعة",
        select_group_desc: "اختر مجموعة من القائمة لعرض التفاصيل أو بدء الدردشة.",
        members: "أعضاء"
      },
      create_group: {
        title: "إنشاء مجموعة",
        subtitle: "بدء دردشة جماعية جديدة",
        group_name_label: "اسم المجموعة",
        group_name_placeholder: "أدخل اسم المجموعة...",
        group_avatar_label: "صورة المجموعة (اختياري)",
        choose_photo: "اختر صورة",
        max_size: "الحد الأقصى: 5 ميجابايت",
        description_label: "الوصف (اختياري)",
        description_placeholder: "ما هو موضوع هذه المجموعة؟",
        add_members_label: "إضافة أعضاء",
        search_friends_placeholder: "البحث عن الأصدقاء...",
        members_selected: "عضو (أعضاء) محدد",
        no_friends: "لا يوجد أصدقاء بعد",
        no_friends_found: "لم يتم العثور على أصدقاء",
        cancel: "إلغاء",
        create: "إنشاء المجموعة",
        creating: "جاري الإنشاء...",
        error_name: "يرجى إدخال اسم المجموعة",
        error_members: "يرجى اختيار عضو واحد على الأقل",
        error_image_size: "يجب أن تكون الصورة أقل من 5 ميجابايت"
      },
      footer: {
        rights: "© 2026 NIDS Chat Inc."
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false 
    }
  });

// Handle RTL for Arabic
i18n.on('languageChanged', (lng) => {
  document.dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
});

export default i18n;
