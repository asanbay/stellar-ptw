import type { FAQItem } from '@/lib/ptw-types'

export const INITIAL_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: {
      ru: 'Что такое наряд-допуск?',
      tr: 'İş izni nedir?',
      en: 'What is a work permit?',
    },
    answer: {
      ru: 'Наряд-допуск - это письменное распоряжение, определяющее место, содержание и условия производства работ, время их начала и окончания, состав бригады и лиц, ответственных за безопасное выполнение работ. Он является основным документом для организации безопасного производства работ повышенной опасности.',
      tr: 'İş izni, işin yerini, içeriğini ve koşullarını, başlangıç ve bitiş zamanını, ekip kompozisyonunu ve güvenli iş yürütmeden sorumlu kişileri belirleyen yazılı bir talimattır. Yüksek riskli işlerin güvenli bir şekilde organize edilmesi için temel belgedir.',
      en: 'A work permit is a written instruction that defines the location, content and conditions of work, start and end time, team composition, and persons responsible for safe work execution. It is the main document for organizing safe execution of high-risk work.',
    },
    category: 'Общие',
    order: 1,
  },
  {
    id: 'faq-2',
    question: {
      ru: 'Кто может выдавать наряд-допуск?',
      tr: 'İş iznini kim verebilir?',
      en: 'Who can issue a work permit?',
    },
    answer: {
      ru: 'Выдавать наряд-допуск имеют право лица из числа административно-технического персонала организации, прошедшие проверку знаний норм и правил работы в электроустановках и имеющие группу по электробезопасности не ниже IV в электроустановках напряжением выше 1000 В и не ниже III в электроустановках напряжением до 1000 В.',
      tr: 'İş iznini vermek için, organizasyonun idari-teknik personeli arasından, elektrik tesislerinde çalışma norm ve kuralları bilgisini kontrol etmiş ve 1000 V üzeri elektrik tesislerinde en az IV grup, 1000 V\'a kadar elektrik tesislerinde en az III grup elektrik güvenliği grubuna sahip kişiler yetkilidir.',
      en: 'Work permits may be issued by persons from the administrative and technical personnel of the organization who have passed the knowledge test of norms and rules for working in electrical installations and have an electrical safety group of at least IV in electrical installations with voltage above 1000 V and at least III in electrical installations with voltage up to 1000 V.',
    },
    category: 'Роли и обязанности',
    order: 2,
  },
  {
    id: 'faq-3',
    question: {
      ru: 'Каковы обязанности допускающего?',
      tr: 'İzin verenin görevleri nelerdir?',
      en: 'What are the responsibilities of the supervisor?',
    },
    answer: {
      ru: 'Допускающий обязан: проверить соответствие состава бригады составу, указанному в наряде-допуске; провести целевой инструктаж бригады; убедиться в выполнении технических мероприятий по подготовке рабочего места; проверить соответствие рабочего места требованиям безопасности; совместно с производителем работ определить границы рабочего места; оформить допуск в наряде-допуске.',
      tr: 'İzin veren şunları yapmakla yükümlüdür: ekip kompozisyonunun iş izninde belirtilen kompozisyonla uyumunu kontrol etmek; ekibe hedeflenen talimat vermek; çalışma yerinin hazırlanması için teknik önlemlerin uygulandığından emin olmak; çalışma yerinin güvenlik gereksinimlerine uygunluğunu kontrol etmek; iş yürütücüsü ile birlikte çalışma alanının sınırlarını belirlemek; iş izninde kabul işlemini düzenlemek.',
      en: 'The supervisor must: verify that the team composition matches the composition specified in the work permit; conduct a targeted briefing for the team; ensure that technical measures have been taken to prepare the workplace; verify that the workplace meets safety requirements; jointly with the foreman determine the boundaries of the workplace; formalize the admission in the work permit.',
    },
    category: 'Роли и обязанности',
    order: 3,
  },
  {
    id: 'faq-4',
    question: {
      ru: 'На какой срок выдается наряд-допуск?',
      tr: 'İş izni ne kadar süreyle verilir?',
      en: 'For what period is a work permit issued?',
    },
    answer: {
      ru: 'Наряд-допуск выдается на срок не более 15 календарных дней со дня начала работы. Наряд-допуск может быть продлен 1 раз на срок не более 15 календарных дней со дня продления. При перерывах в работе наряд-допуск остается действительным.',
      tr: 'İş izni, işin başlangıç tarihinden itibaren en fazla 15 takvim günü için verilir. İş izni, uzatma tarihinden itibaren en fazla 15 takvim günü olmak üzere 1 kez uzatılabilir. İşteki aralar sırasında iş izni geçerliliğini korur.',
      en: 'A work permit is issued for a period of no more than 15 calendar days from the start date of work. The work permit may be extended once for a period of no more than 15 calendar days from the date of extension. During work breaks, the work permit remains valid.',
    },
    category: 'Процесс',
    order: 4,
  },
  {
    id: 'faq-5',
    question: {
      ru: 'Какие виды инструктажа необходимо проводить?',
      tr: 'Hangi tür talimatlar verilmelidir?',
      en: 'What types of briefing must be conducted?',
    },
    answer: {
      ru: 'Перед началом работ необходимо провести целевой инструктаж, в ходе которого разъясняются: содержание и место работы; меры безопасности при подготовке рабочего места и в процессе работы; опасные производственные факторы; действия при возникновении аварийных ситуаций. Также проводится вводный инструктаж для новых работников и периодический инструктаж согласно графику.',
      tr: 'İş başlamadan önce hedeflenen talimat verilmelidir, bu sırada açıklanır: işin içeriği ve yeri; çalışma yerinin hazırlanması ve iş süreci sırasında güvenlik önlemleri; tehlikeli üretim faktörleri; acil durumlarda yapılacak eylemler. Ayrıca yeni çalışanlar için giriş talimatı ve plana göre periyodik talimat verilir.',
      en: 'Before work begins, a targeted briefing must be conducted, during which the following is explained: content and location of work; safety measures during workplace preparation and during work; hazardous production factors; actions in case of emergency situations. Introductory briefing is also conducted for new workers and periodic briefing according to schedule.',
    },
    category: 'Безопасность',
    order: 5,
  },
  {
    id: 'faq-6',
    question: {
      ru: 'Что делать в случае несчастного случая?',
      tr: 'Kaza durumunda ne yapılmalıdır?',
      en: 'What to do in case of an accident?',
    },
    answer: {
      ru: 'При несчастном случае необходимо: немедленно прекратить работы; оказать первую помощь пострадавшему; вызвать скорую медицинскую помощь; сохранить обстановку на месте происшествия (если это не угрожает жизни людей); немедленно сообщить о происшествии руководителю работ, выдавшему наряд-допуск и руководству организации; до начала расследования никому не разрешается продолжать работы на данном участке.',
      tr: 'Kaza durumunda şunlar yapılmalıdır: işleri derhal durdurmak; yaralıya ilk yardım yapmak; acil tıbbi yardım çağırmak; olay yerindeki durumu korumak (insan hayatını tehdit etmiyorsa); olayı hemen iş yürütücüsüne, iş iznini verene ve organizasyon yönetimine bildirmek; soruşturma başlayana kadar kimsenin bu bölgede çalışmasına izin verilmez.',
      en: 'In case of an accident: immediately stop work; provide first aid to the victim; call emergency medical assistance; preserve the scene of the incident (if it does not threaten people\'s lives); immediately report the incident to the work manager who issued the work permit and to the organization\'s management; until the investigation begins, no one is allowed to continue work in this area.',
    },
    category: 'Безопасность',
    order: 6,
  },
  {
    id: 'faq-7',
    question: {
      ru: 'Какие документы нужны для оформления наряда-допуска?',
      tr: 'İş izni düzenlemek için hangi belgeler gereklidir?',
      en: 'What documents are needed to issue a work permit?',
    },
    answer: {
      ru: 'Для оформления наряда-допуска необходимы: проект производства работ (ППР) или технологическая карта; перечень опасных и вредных производственных факторов; акт-допуск на производство строительно-монтажных работ (при необходимости); сертификаты и протоколы испытаний на средства защиты; удостоверения о проверке знаний персонала; медицинские справки о допуске к работам.',
      tr: 'İş izni düzenlemek için şunlar gereklidir: iş üretim projesi (PPR) veya teknolojik harita; tehlikeli ve zararlı üretim faktörlerinin listesi; inşaat-montaj işlerinin üretimi için kabul belgesi (gerekirse); koruma ekipmanları için sertifikalar ve test protokolleri; personelin bilgi kontrolü sertifikaları; işlere kabul için tıbbi belgeler.',
      en: 'To issue a work permit, the following are required: work production project (WPP) or technological map; list of hazardous and harmful production factors; acceptance certificate for construction and installation work (if necessary); certificates and test protocols for protective equipment; certificates of personnel knowledge verification; medical certificates for work admission.',
    },
    category: 'Документы',
    order: 7,
  },
  {
    id: 'faq-8',
    question: {
      ru: 'Можно ли изменять состав бригады после оформления наряда?',
      tr: 'İş izni düzenlendikten sonra ekip kompozisyonu değiştirilebilir mi?',
      en: 'Can the team composition be changed after the permit is issued?',
    },
    answer: {
      ru: 'Изменение состава бригады после оформления наряда-допуска допускается только по согласованию с выдавшим наряд. При замене производителя работ наряд-допуск должен быть переоформлен. Замена отдельных членов бригады может быть произведена с разрешения выдавшего наряд с отметкой в наряде-допуске. Все вновь введенные в состав бригады работники должны пройти целевой инструктаж.',
      tr: 'İş izni düzenlendikten sonra ekip kompozisyonunun değiştirilmesi, yalnızca izni veren kişinin onayıyla mümkündür. İş yürütücüsü değiştirildiğinde iş izni yeniden düzenlenmelidir. Bireysel ekip üyelerinin değiştirilmesi, izni verenin izniyle ve iş izninde not edilerek yapılabilir. Ekibe yeni katılan tüm çalışanlar hedeflenen talimat almalıdır.',
      en: 'Changing the team composition after the work permit is issued is allowed only with the consent of the person who issued the permit. When replacing the foreman, the work permit must be reissued. Replacement of individual team members can be made with the permission of the issuer with a note in the work permit. All workers newly added to the team must undergo targeted briefing.',
    },
    category: 'Процесс',
    order: 8,
  },
]
