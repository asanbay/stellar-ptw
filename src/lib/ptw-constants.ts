import type { DutyTranslation, RuleItem, TimelineItem, DocumentItem, Translation } from './ptw-types'

export const ROLE_COLORS = {
  issuer: 'oklch(0.60 0.18 290)',
  supervisor: 'oklch(0.65 0.22 340)',
  foreman: 'oklch(0.70 0.18 60)',
  worker: 'oklch(0.60 0.20 270)',
} as const

export const ROLE_LABELS: Record<string, Translation> = {
  issuer: {
    ru: 'Выдающий НД',
    tr: 'İzni Veren',
    en: 'PTW Issuer',
  },
  supervisor: {
    ru: 'Ответственный руководитель',
    tr: 'Sorumlu Yönetici',
    en: 'Responsible Supervisor',
  },
  foreman: {
    ru: 'Производитель работ',
    tr: 'İş Yapan',
    en: 'Work Performer',
  },
  worker: {
    ru: 'Исполнитель работ',
    tr: 'İşçi',
    en: 'Team Member',
  },
}

export const PROCEDURE_DUTIES: Record<string, DutyTranslation> = {
  issuer: {
    ru: [
      'определить мероприятия по обеспечению безопасности работников и места производства работ',
      'определить состав бригады, назначить ответственного руководителя работ и ответственного исполнителя (производителя) работ',
      'определить место производства и объем работ, указывать в наряде-допуске используемое оборудование и средства механизации',
      'выдать ответственному руководителю работ два экземпляра наряда-допуска',
      'ознакомить ответственного руководителя работ с прилагаемой к наряду-допуску проектной, технологической документацией, схемой ограждения',
    ],
    tr: [
      'çalışanların güvenliğini ve iş yerinin güvenliğini sağlamak için gerekli önlemleri belirlemek',
      'ekip üyelerini belirlemek, sorumlu iş yöneticisini ve işlerin sorumlusunu atamak',
      'iş yerini ve işin kapsamını belirlemek, izin belgesinde kullanılacak ekipman ve mekanizasyon araçlarını belirtmek',
      'sorumlu iş yöneticisine iki nüsha izin belgesi vermek',
      'sorumlu iş yöneticisini izin belgesine ekli proje ve teknolojik belgelerle bilgilendirmek',
    ],
    en: [
      'determine measures to ensure the safety of workers and the work site',
      'determine the team composition, appoint a Responsible supervisor and a responsible work performer',
      'determine the place of production and the scope of work, indicate equipment and mechanization in the work permit',
      'issue two copies of the work permit to the Responsible supervisor',
      'familiarize the Responsible supervisor with the design and technological documentation attached to the permit',
    ],
  },
  supervisor: {
    ru: [
      'получить наряд-допуск на производство работ у лица, выдающего наряд-допуск',
      'ознакомиться под подпись с ППР/ТК, проектной, технологической документацией',
      'проверить укомплектованность членов бригады инструментом, материалами, средствами защиты',
      'дать указание ответственному исполнителю по подготовке и приведению в работоспособное состояние инструментов',
      'организовать выполнение технических мероприятий по подготовке рабочего места',
      'проводить целевой инструктаж членов бригады с росписью в наряде-допуске',
      'допустить бригаду к работе по наряду-допуску непосредственно на месте выполнения работ',
    ],
    tr: [
      'izin belgesini, izin belgesini veren kişiden almak',
      'PPR/TC, proje, teknolojik belgeler ile imza karşılığı tanışmak',
      'ekip üyelerinin aletler, malzemeler, koruyucu ekipmanlarla donatılmış olup olmadığını kontrol etmek',
      'sorumlu işi yapana aletlerin hazırlanması talimatını vermek',
      'çalışma alanının hazırlık teknik önlemlerinin organize edilmesi',
      'ekip üyelerine izin belgesi ile imza karşılı hedefe yönelik talimat vermek',
      'ekip üyelerinin iş yerine girişini, izin belgesi doğrultusunda sağlamak',
    ],
    en: [
      'obtain work permit from the person issuing work permit',
      'familiarize yourself with the PPR/TC, design, technological documentation with signature',
      'check the staffing of the team members with tools, materials, protective equipment',
      'give instructions to the responsible performer on preparation of tools',
      'organize the implementation of technical measures to prepare the workplace',
      'conduct targeted briefings for team members and their subscriptions in work permit',
      'allow the team to work according to the work permit directly at the work site',
    ],
  },
  foreman: {
    ru: [
      'проверить в присутствии ответственного руководителя работ подготовку рабочих мест',
      'опросить членов бригады об их самочувствии и проводить наблюдение за состоянием их здоровья',
      'указать каждому члену бригады его рабочее место',
      'не допускать отсутствия членов бригады на местах производства работ без разрешения',
      'вывести членов бригады с места производства работ на время перерывов',
      'возобновлять работу бригады после перерыва только после личного осмотра рабочего места',
      'по окончании работ обеспечить уборку материалов, инструмента, приспособлений',
    ],
    tr: [
      'sorumlu iş yöneticisinin huzurunda iş yerlerinin hazırlanmasını kontrol etmek',
      'ekip üyelerinin sağlık durumlarını sormak ve izlemek',
      'her bir ekip üyesine iş yerini belirtmek',
      'ekip üyelerinin izinsiz iş yerinde bulunmamalarını sağlamak',
      'ekip üyelerini molalar süresince iş yerinden çıkarmak',
      'moladan sonra ekibin işine devam etmesini, iş yerini kontrol ettikten sonra sağlamak',
      'işlerin bitiminde malzemelerin, aletlerin, ekipmanların temizlenmesini sağlamak',
    ],
    en: [
      'check the preparation of workplaces in the presence of the responsible supervisor',
      'survey team members about their well-being and monitor their health',
      'indicate workplace to each team member',
      'do not allow absence of team members at work sites without permission',
      'remove team members from the work site for breaks',
      'resume team work after break only after a personal inspection of the workplace',
      'upon work completion, ensure removal of materials, tools, devices',
    ],
  },
  worker: {
    ru: [
      'выполнять порученную работу',
      'осуществлять непрерывную визуальную связь с другими членами бригады',
      'уметь пользоваться СИЗ, инструментом и техническими средствами',
      'содержать в исправном состоянии СИЗ, инструмент и технические средства',
      'уметь оказывать первую помощь пострадавшим на производстве',
      'знать свои действия в случае аварийной ситуации',
      'неукоснительно выполнять распоряжения ответственного исполнителя работ',
    ],
    tr: [
      'kendilerine verilen işleri yapmak',
      'diğer ekip üyeleriyle sürekli görsel temas kurmak',
      "KKD'leri, aletleri ve teknik araçları kullanmayı bilmek",
      "KKD'leri, aletleri ve teknik araçları düzgün durumda tutmak",
      'iş yerinde yaralananlara ilk yardım yapmayı bilmek',
      'acil bir durum oluştuğunda yapması gerekenleri bilmek',
      'sorumlu işi yapanın talimatlarını eksiksiz yerine getirmek',
    ],
    en: [
      'carry out the work assigned to him',
      'maintain continuous visual communication with other team members',
      'be able to use personal protective equipment, tools and technical means',
      'maintain personal protective equipment, tools and technical equipment in good condition',
      'be able to provide first aid to victims at work',
      'know your actions in the event of an emergency',
      'strictly follow the orders of the responsible work performer',
    ],
  },
}

export const AUTO_QUALIFICATIONS: Record<string, DutyTranslation> = {
  issuer: {
    ru: [
      'Аттестация по промышленной безопасности',
      'Протокол РТН или ЕПТ РТН',
      'Проверка знаний по безопасным методам работ',
      'Допуски II, III группы для работ на высоте',
      'Допуски II, III группы для работ в ОЗП',
      'Аттестация по безопасной эксплуатации ПС',
    ],
    tr: [
      'Endüstriyel güvenlik sertifikası',
      'RTN veya EPT RTN protokolü',
      'Güvenli çalışma yöntemleri bilgi testi',
      'Yüksekte çalışma için II, III güvenlik grubu izinleri',
      'Kapalı alanlarda çalışma için II, III güvenlik grubu izinleri',
      'Kaldırma ekipmanları güvenli işletimi sertifikası',
    ],
    en: [
      'Industrial safety certification',
      'RTN or EPT RTN protocol',
      'Safe work methods knowledge test',
      'Permits II, III safety group for work at height',
      'Permits II, III safety group for work in confined spaces',
      'Certification in safe operation of lifting equipment',
    ],
  },
  supervisor: {
    ru: [
      'Аттестация по промышленной безопасности',
      'Протокол РТН или ЕПТ РТН',
      'Проверка знаний по безопасным методам работ',
      'Допуски II, III группы для работ на высоте',
      'Допуски II, III группы для работ в ОЗП',
      'Аттестация по безопасной эксплуатации ПС',
    ],
    tr: [
      'Endüstriyel güvenlik sertifikası',
      'RTN veya EPT RTN protokolü',
      'Güvenli çalışma yöntemleri bilgi testi',
      'Yüksekte çalışma için II, III güvenlik grubu izinleri',
      'Kapalı alanlarda çalışma için II, III güvenlik grubu izinleri',
      'Kaldırma ekipmanları güvenli işletimi sertifikası',
    ],
    en: [
      'Industrial safety certification',
      'RTN or EPT RTN protocol',
      'Safe work methods knowledge test',
      'Permits II, III safety group for work at height',
      'Permits II, III safety group for work in confined spaces',
      'Certification in safe operation of lifting equipment',
    ],
  },
  foreman: {
    ru: [
      'Аттестация по промышленной безопасности',
      'Протокол РТН или ЕПТ РТН',
      'Проверка знаний по безопасным методам работ',
      'Допуски II, III группы для работ на высоте',
      'Допуски II, III группы для работ в ОЗП',
      'Аттестация по безопасной эксплуатации ПС',
    ],
    tr: [
      'Endüstriyel güvenlik sertifikası',
      'RTN veya EPT RTN protokolü',
      'Güvenli çalışma yöntemleri bilgi testi',
      'Yüksekte çalışma için II, III güvenlik grubu izinleri',
      'Kapalı alanlarda çalışma için II, III güvenlik grubu izinleri',
      'Kaldırma ekipmanları güvenli işletimi sertifikası',
    ],
    en: [
      'Industrial safety certification',
      'RTN or EPT RTN protocol',
      'Safe work methods knowledge test',
      'Permits II, III safety group for work at height',
      'Permits II, III safety group for work in confined spaces',
      'Certification in safe operation of lifting equipment',
    ],
  },
  worker: {
    ru: [
      'Отсутствие медицинских противопоказаний',
      'Обучение по охране труда по должности',
      'Обучение по виду выполняемых работ',
      'Знание инструкций по охране труда',
      'Умение оказывать первую помощь',
      'Навыки использования СИЗ',
    ],
    tr: [
      'Tıbbi kontrendikasyon yok',
      'Pozisyona göre iş sağlığı ve güvenliği eğitimi',
      'Yapılan iş türüne göre eğitim',
      'İş sağlığı ve güvenliği talimatları bilgisi',
      'İlk yardım becerileri',
      'KKD kullanım becerileri',
    ],
    en: [
      'No medical contraindications',
      'Occupational safety training according to position',
      'Training according to type of work performed',
      'Knowledge of labor protection instructions',
      'First aid skills',
      'PPE usage skills',
    ],
  },
}

export const AUTO_ORDER_TYPES: Record<string, string[]> = {
  issuer: ['STE-PTW-10-01', 'STE-PTW-10-02', 'STE-PTW-10-03', 'STE-PTW-10-04', 'STE-PTW-10-05'],
  supervisor: ['STE-PTW-10-01', 'STE-PTW-10-02', 'STE-PTW-10-03', 'STE-PTW-10-04', 'STE-PTW-10-05'],
  foreman: ['STE-PTW-10-01', 'STE-PTW-10-02', 'STE-PTW-10-03', 'STE-PTW-10-04'],
  worker: ['STE-PTW-10-01'],
}

export const HIGH_RISK_WORKS: DutyTranslation = {
  ru: [
    'Земляные работы (глубиной более 30 см)',
    'Работы на высоте (от 1.8 м)',
    'Огневые работы (сварочные, газопламенные)',
    'Работы в замкнутых пространствах',
    'Электротехнические работы',
    'Газоопасные работы',
    'Работы с ионизирующим излучением',
    'Грузоподъемные работы',
    'Критические подъемы',
    'Работы в охранных зонах коммуникаций',
  ],
  tr: [
    "Toprak işleri (30 cm'den derin)",
    "Yüksekte çalışma (1.8 m'den)",
    'Ateşli işler (kaynak, gaz alevli)',
    'Kapalı alanlarda çalışma',
    'Elektrik işleri',
    'Gaz tehlikesi olan işler',
    'İyonlaştırıcı radyasyonla çalışma',
    'Yük kaldırma işleri',
    'Kritik kaldırma işlemleri',
    'İletişim hatları koruma bölgelerinde çalışma',
  ],
  en: [
    'Earthworks (deeper than 30 cm)',
    'Work at height (from 1.8 m)',
    'Hot work (welding, gas flame)',
    'Work in confined spaces',
    'Electrical work',
    'Gas hazardous work',
    'Work with ionizing radiation',
    'Lifting operations',
    'Critical lifting operations',
    'Work in communication protection zones',
  ],
}

export const PTW_RULES: RuleItem[] = [
  {
    icon: '⏰',
    title: {
      ru: 'Срок оформления',
      tr: 'Düzenleme Süresi',
      en: 'Issuance Time',
    },
    value: {
      ru: 'За 24 часа',
      tr: '24 saat önce',
      en: '24 hours before',
    },
    description: {
      ru: 'НД должен быть оформлен минимум за 24 часа до начала работ',
      tr: 'İİ, işlerin başlamasından en az 24 saat önce düzenlenmelidir',
      en: 'PTW must be issued at least 24 hours before work start',
    },
  },
  {
    icon: '📅',
    title: {
      ru: 'Срок действия',
      tr: 'Geçerlilik Süresi',
      en: 'Validity Period',
    },
    value: {
      ru: '7 дней',
      tr: '7 gün',
      en: '7 days',
    },
    description: {
      ru: 'НД выдается на срок не более 7 дней',
      tr: 'İİ en fazla 7 gün süreyle verilir',
      en: 'PTW is issued for a period not exceeding 7 days',
    },
  },
  {
    icon: '🔄',
    title: {
      ru: 'Продление',
      tr: 'Uzatma',
      en: 'Extension',
    },
    value: {
      ru: '+7 дней',
      tr: '+7 gün',
      en: '+7 days',
    },
    description: {
      ru: 'Допускается продление НД на 7 дней дополнительно',
      tr: "İİ'nin 7 gün daha uzatılmasına izin verilir",
      en: 'PTW can be extended for additional 7 days',
    },
  },
  {
    icon: '📝',
    title: {
      ru: 'Количество копий',
      tr: 'Kopya Sayısı',
      en: 'Number of Copies',
    },
    value: {
      ru: '2 экземпляра',
      tr: '2 nüsha',
      en: '2 copies',
    },
    description: {
      ru: 'НД оформляется не менее чем в двух экземплярах',
      tr: 'İİ en az iki nüsha olarak düzenlenir',
      en: 'PTW should be prepared in at least two copies',
    },
  },
  {
    icon: '👥',
    title: {
      ru: 'Размер бригады',
      tr: 'Ekip Büyüklüğü',
      en: 'Team Size',
    },
    value: {
      ru: 'до 20 человек',
      tr: '20 kişiye kadar',
      en: 'up to 20 people',
    },
    description: {
      ru: 'Количество членов бригады в одном НД не должно превышать 20 человек',
      tr: "Bir İİ'deki ekip üyelerinin sayısı 20 kişiyi geçmemelidir",
      en: 'The number of team members in one PTW should not exceed 20 people',
    },
  },
  {
    icon: '👨‍💼',
    title: {
      ru: 'Наряды на производителя',
      tr: 'Formen Başına İzin',
      en: 'Permits per Foreman',
    },
    value: {
      ru: '2 НД максимум',
      tr: 'Maksimum 2 İİ',
      en: '2 PTW max',
    },
    description: {
      ru: 'На одного производителя работ возможно открыть не более 2 НД',
      tr: 'Bir formene en fazla 2 İİ açılabilir',
      en: 'It is possible to open no more than 2 PTWs per responsible foreman',
    },
  },
]

export const ADDITIONAL_RULES: RuleItem[] = [
  {
    icon: '🌙',
    title: {
      ru: 'Ночные смены',
      tr: 'Gece Vardiyaları',
      en: 'Night Shifts',
    },
    value: {
      ru: 'Отдельный НД',
      tr: 'Ayrı İİ',
      en: 'Separate PTW',
    },
    description: {
      ru: 'НД на работу в ночную смену (20:00-06:00) оформляется отдельно',
      tr: 'Gece vardiyasında (20:00-06:00) çalışma için İİ ayrı olarak düzenlenir',
      en: 'PTW for work during night shift (20:00-06:00) must be issued separately',
    },
  },
  {
    icon: '👁️',
    title: {
      ru: 'Зона видимости',
      tr: 'Görüş Alanı',
      en: 'Visibility Zone',
    },
    value: {
      ru: 'Обязательно',
      tr: 'Zorunlu',
      en: 'Mandatory',
    },
    description: {
      ru: 'Рабочие места должны находиться в зоне видимости ответственного производителя',
      tr: 'İş yerleri sorumlu formenin görüş alanında olmalıdır',
      en: 'Work places must be within the visibility zone of responsible foreman',
    },
  },
  {
    icon: '⚠️',
    title: {
      ru: 'Совмещенные работы',
      tr: 'Birleştirilmiş İşler',
      en: 'Combined Works',
    },
    value: {
      ru: 'Журнал учета',
      tr: 'Kayıt Defteri',
      en: 'Logbook',
    },
    description: {
      ru: 'При совмещенных работах ведется специальный журнал учета',
      tr: 'Birleştirilmiş işlerde özel bir kayıt defteri tutulur',
      en: 'For combined works, a special logbook is maintained',
    },
  },
  {
    icon: '📋',
    title: {
      ru: 'Замена ответственных',
      tr: 'Sorumlu Değişikliği',
      en: 'Responsible Replacement',
    },
    value: {
      ru: 'Согласование',
      tr: 'Onay Gerekli',
      en: 'Approval Required',
    },
    description: {
      ru: 'Замена производителя или руководителя требует согласования',
      tr: 'Formen veya yönetici değişikliği onay gerektirir',
      en: 'Replacement of foreman or supervisor requires approval',
    },
  },
]

export const TIMELINE_RULES: TimelineItem[] = [
  {
    time: { ru: 'За 24 часа', tr: '24 saat önce', en: '24 hours before' },
    content: { ru: 'Оформление НД до начала работ', tr: 'İşler başlamadan önce İİ düzenleme', en: 'PTW issuance before work start' },
  },
  {
    time: { ru: '20:00', tr: '20:00', en: '20:00' },
    content: {
      ru: 'Начало ночной смены - требуется отдельный НД',
      tr: 'Gece vardiyası başlangıcı - ayrı İİ gerekli',
      en: 'Night shift start - separate PTW required',
    },
  },
  {
    time: { ru: '22:00', tr: '22:00', en: '22:00' },
    content: {
      ru: 'Предел продления дневной смены - требуется повторный допуск',
      tr: 'Gündüz vardiyası uzatma sınırı - yeniden kabul gerekli',
      en: 'Day shift extension limit - re-admission required',
    },
  },
  {
    time: { ru: '06:00', tr: '06:00', en: '06:00' },
    content: { ru: 'Окончание ночной смены', tr: 'Gece vardiyası sonu', en: 'Night shift end' },
  },
  {
    time: { ru: '7 дней', tr: '7 gün', en: '7 days' },
    content: { ru: 'Максимальный срок действия НД', tr: "İİ'nin maksimum geçerlilik süresi", en: 'Maximum PTW validity period' },
  },
  {
    time: { ru: '14 дней', tr: '14 gün', en: '14 days' },
    content: { ru: 'Максимальный срок с продлением', tr: 'Uzatma ile maksimum süre', en: 'Maximum period with extension' },
  },
]

export const PROCEDURE_DOCUMENTS: DocumentItem[] = [
  { code: 'STE-LS-10-17', name: { ru: 'Перечень работ повышенной опасности', tr: 'Yüksek Tehlike İçeren İşler Listesi', en: 'List of High-Risk Operations' } },
  { code: 'STE-FC-10-05', name: { ru: 'Схема открытия НД', tr: 'İş İzni Açma Şeması', en: 'PTW Opening Diagram' } },
  { code: 'STE-LOG-10-27', name: { ru: 'Журнал совместных и совмещенных работ', tr: 'Birleştirilmiş ve Ortak İşler Günlüğü', en: 'Combined Works Journal' } },
  {
    code: 'STE-PTW-10-01',
    name: { ru: 'НД на работы в местах действия опасных факторов', tr: 'Tehlikeli Faktörlü Yerlerde Çalışma İş İzni', en: 'PTW for Work in Hazardous Areas' },
  },
  { code: 'STE-PTW-10-02', name: { ru: 'НД на работы на высоте', tr: 'Yüksekte Çalışma İş İzni', en: 'PTW for Work at Height' } },
  { code: 'STE-PTW-10-03', name: { ru: 'НД на огневые работы', tr: 'Ateşli İşler İş İzni', en: 'PTW for Hot Work' } },
  { code: 'STE-PTW-10-04', name: { ru: 'НД на работы в ограниченном замкнутом пространстве', tr: 'Sınırlı Kapalı Alanda Çalışma İş İzni', en: 'PTW for Work in Confined Spaces' } },
  { code: 'STE-PTW-10-05', name: { ru: 'НД на земляные работы', tr: 'Toprak İşleri İş İzni', en: 'PTW for Earthworks' } },
  { code: 'STE-CL-10-15', name: { ru: 'Лист проверки готовности к испытаниям под давлением', tr: 'Basınçlı Testlere Hazırlık Kontrol Formu', en: 'Pressure Testing Readiness Check Sheet' } },
  { code: 'STE-CL-10-23', name: { ru: 'Лист проверки готовности к критическому подъему', tr: 'Kritik Kaldırma Hazırlık Kontrol Formu', en: 'Critical Lift Readiness Check Sheet' } },
  { code: 'STE-FR-10-39', name: { ru: 'Разрешение на снятие решетчатого настила', tr: 'Izgara Platform Kaldırma İzni', en: 'Grating Removal Permit' } },
]

export const PROCESS_FLOW: Translation[] = [
  { ru: 'Подача заявки', tr: 'Talep', en: 'Request' },
  { ru: 'Оформление НД', tr: 'Düzenleme', en: 'Issuance' },
  { ru: 'Подготовка', tr: 'Hazırlık', en: 'Preparation' },
  { ru: 'Инструктаж', tr: 'Talimat', en: 'Briefing' },
  { ru: 'Выполнение', tr: 'Gerçekleştirme', en: 'Execution' },
  { ru: 'Закрытие', tr: 'Kapatma', en: 'Closure' },
]
