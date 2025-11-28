-- Заполнение таблицы FAQ начальными данными
-- Запустите этот SQL в Supabase SQL Editor

-- Очистка таблицы (опционально)
TRUNCATE TABLE faq CASCADE;

-- Вставка FAQ данных
INSERT INTO faq (id, question_ru, question_tr, question_en, answer_ru, answer_tr, answer_en, category, order_index) VALUES

-- FAQ 1
('faq-1',
 'Что такое наряд-допуск?',
 'İş izni nedir?',
 'What is a work permit?',
 'Наряд-допуск - это письменное распоряжение, определяющее место, содержание и условия производства работ, время их начала и окончания, состав бригады и лиц, ответственных за безопасное выполнение работ. Он является основным документом для организации безопасного производства работ повышенной опасности.',
 'İş izni, işin yerini, içeriğini ve koşullarını, başlangıç ve bitiş zamanını, ekip kompozisyonunu ve güvenli iş yürütmeden sorumlu kişileri belirleyen yazılı bir talimattır. Yüksek riskli işlerin güvenli bir şekilde organize edilmesi için temel belgedir.',
 'A work permit is a written instruction that defines the location, content and conditions of work, start and end time, team composition, and persons responsible for safe work execution. It is the main document for organizing safe execution of high-risk work.',
 'Общие',
 1),

-- FAQ 2
('faq-2',
 'Кто может выдавать наряд-допуск?',
 'İş iznini kim verebilir?',
 'Who can issue a work permit?',
 'Выдавать наряд-допуск имеют право лица из числа административно-технического персонала организации, прошедшие проверку знаний норм и правил работы в электроустановках и имеющие группу по электробезопасности не ниже IV в электроустановках напряжением выше 1000 В и не ниже III в электроустановках напряжением до 1000 В.',
 'İş iznini vermek için, organizasyonun idari-teknik personeli arasından, elektrik tesislerinde çalışma norm ve kuralları bilgisini kontrol etmiş ve 1000 V üzeri elektrik tesislerinde en az IV grup, 1000 V''a kadar elektrik tesislerinde en az III grup elektrik güvenliği grubuna sahip kişiler yetkilidir.',
 'Work permits may be issued by persons from the administrative and technical personnel of the organization who have passed the knowledge test of norms and rules for working in electrical installations and have an electrical safety group of at least IV in electrical installations with voltage above 1000 V and at least III in electrical installations with voltage up to 1000 V.',
 'Роли и обязанности',
 2),

-- FAQ 3
('faq-3',
 'Каковы обязанности допускающего?',
 'İzin verenin görevleri nelerdir?',
 'What are the responsibilities of the supervisor?',
 'Допускающий обязан: проверить соответствие состава бригады составу, указанному в наряде-допуске; провести целевой инструктаж бригады; убедиться в выполнении технических мероприятий по подготовке рабочего места; проверить соответствие рабочего места требованиям безопасности; совместно с производителем работ определить границы рабочего места; оформить допуск в наряде-допуске.',
 'İzin veren şunları yapmakla yükümlüdür: ekip kompozisyonunun iş izninde belirtilen kompozisyonla uyumunu kontrol etmek; ekibe hedeflenen talimat vermek; çalışma yerinin hazırlanması için teknik önlemlerin uygulandığından emin olmak; çalışma yerinin güvenlik gereksinimlerine uygunluğunu kontrol etmek; iş yürütücüsü ile birlikte çalışma alanının sınırlarını belirlemek; iş izninde kabul işlemini düzenlemek.',
 'The supervisor must: verify that the team composition matches the composition specified in the work permit; conduct a targeted briefing for the team; ensure that technical measures have been taken to prepare the workplace; verify that the workplace meets safety requirements; jointly with the foreman determine the boundaries of the workplace; formalize the admission in the work permit.',
 'Роли и обязанности',
 3),

-- FAQ 4
('faq-4',
 'Какой срок действия наряда-допуска?',
 'İş izninin geçerlilik süresi nedir?',
 'What is the validity period of a work permit?',
 'Наряд-допуск выдается на срок не более 15 календарных дней со дня начала работы. Наряд-допуск может быть продлен 1 раз на срок не более 15 календарных дней со дня продления.',
 'İş izni, işin başlangıç tarihinden itibaren en fazla 15 takvim günü süreyle verilir. İş izni, uzatma tarihinden itibaren en fazla 15 takvim günü süreyle 1 kez uzatılabilir.',
 'A work permit is issued for a period not exceeding 15 calendar days from the start date of the work. The work permit may be extended once for a period not exceeding 15 calendar days from the date of extension.',
 'Общие',
 4),

-- FAQ 5
('faq-5',
 'Сколько человек может быть в бригаде по наряду-допуску?',
 'İş izni kapsamında ekipte kaç kişi olabilir?',
 'How many people can be in a work permit team?',
 'Количество работников в бригаде определяется исходя из условий выполнения работы и должно быть не менее двух человек. Максимальное количество - 20 человек (свыше 20 требуется согласование с HSE).',
 'Ekipteki çalışan sayısı, işin yürütülme koşullarına göre belirlenir ve en az iki kişi olmalıdır. Maksimum sayı - 20 kişi (20''den fazla olması durumunda HSE ile koordinasyon gereklidir).',
 'The number of workers in a team is determined based on the work execution conditions and must be at least two people. Maximum number - 20 people (more than 20 requires coordination with HSE).',
 'Общие',
 5),

-- FAQ 6
('faq-6',
 'Какие виды работ требуют оформления наряда-допуска?',
 'Hangi iş türleri iş izni gerektiri?',
 'What types of work require a work permit?',
 'Наряд-допуск требуется для: работ на высоте (более 1.8м), огневых работ, работ в замкнутых пространствах, земляных работ, работ с опасными факторами (электричество, химикаты, радиация и т.д.).',
 'İş izni şunlar için gereklidir: yüksekte çalışma (1.8m üzeri), sıcak çalışma, kapalı alanlarda çalışma, toprak işleri, tehlikeli faktörlerle çalışma (elektrik, kimyasallar, radyasyon vb.).',
 'Work permit is required for: work at height (more than 1.8m), hot work, work in confined spaces, earthwork, work with hazardous factors (electricity, chemicals, radiation, etc.).',
 'Типы работ',
 6);

-- Проверка данных
SELECT id, question_ru, category, order_index FROM faq ORDER BY order_index;
