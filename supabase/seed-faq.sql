-- Заполнение таблицы FAQ начальными данными
-- Запустите этот SQL в Supabase SQL Editor

-- Очистка таблицы (опционально)
TRUNCATE TABLE faq CASCADE;

-- Вставка FAQ данных (JSONB формат)
INSERT INTO faq (question, answer, category, order_index) VALUES

-- FAQ 1
('{"ru": "Что такое наряд-допуск?", "tr": "İş izni nedir?", "en": "What is a work permit?"}'::jsonb,
 '{"ru": "Наряд-допуск - это письменное распоряжение, определяющее место, содержание и условия производства работ, время их начала и окончания, состав бригады и лиц, ответственных за безопасное выполнение работ. Он является основным документом для организации безопасного производства работ повышенной опасности.", "tr": "İş izni, işin yerini, içeriğini ve koşullarını, başlangıç ve bitiş zamanını, ekip kompozisyonunu ve güvenli iş yürütmeden sorumlu kişileri belirleyen yazılı bir talimattır. Yüksek riskli işlerin güvenli bir şekilde organize edilmesi için temel belgedir.", "en": "A work permit is a written instruction that defines the location, content and conditions of work, start and end time, team composition, and persons responsible for safe work execution. It is the main document for organizing safe execution of high-risk work."}'::jsonb,
 'Общие',
 1),

-- FAQ 2
('{"ru": "Кто может выдавать наряд-допуск?", "tr": "İş iznini kim verebilir?", "en": "Who can issue a work permit?"}'::jsonb,
 '{"ru": "Выдавать наряд-допуск имеют право лица из числа административно-технического персонала организации, прошедшие проверку знаний норм и правил работы в электроустановках и имеющие группу по электробезопасности не ниже IV в электроустановках напряжением выше 1000 В и не ниже III в электроустановках напряжением до 1000 В.", "tr": "İş iznini vermek için, organizasyonun idari-teknik personeli arasından, elektrik tesislerinde çalışma norm ve kuralları bilgisini kontrol etmiş ve 1000 V üzeri elektrik tesislerinde en az IV grup, 1000 V''a kadar elektrik tesislerinde en az III grup elektrik güvenliği grubuna sahip kişiler yetkilidir.", "en": "Work permits may be issued by persons from the administrative and technical personnel of the organization who have passed the knowledge test of norms and rules for working in electrical installations and have an electrical safety group of at least IV in electrical installations with voltage above 1000 V and at least III in electrical installations with voltage up to 1000 V."}'::jsonb,
 'Роли и обязанности',
 2),

-- FAQ 3
('{"ru": "Каковы обязанности допускающего?", "tr": "İzin verenin görevleri nelerdir?", "en": "What are the responsibilities of the supervisor?"}'::jsonb,
 '{"ru": "Допускающий обязан: проверить соответствие состава бригады составу, указанному в наряде-допуске; провести целевой инструктаж бригады; убедиться в выполнении технических мероприятий по подготовке рабочего места; проверить соответствие рабочего места требованиям безопасности; совместно с производителем работ определить границы рабочего места; оформить допуск в наряде-допуске.", "tr": "İzin veren şunları yapmakla yükümlüdür: ekip kompozisyonunun iş izninde belirtilen kompozisyonla uyumunu kontrol etmek; ekibe hedeflenen talimat vermek; çalışma yerinin hazırlanması için teknik önlemlerin uygulandığından emin olmak; çalışma yerinin güvenlik gereksinimlerine uygunluğunu kontrol etmek; iş yürütücüsü ile birlikte çalışma alanının sınırlarını belirlemek; iş izninde kabul işlemini düzenlemek.", "en": "The supervisor must: verify that the team composition matches the composition specified in the work permit; conduct a targeted briefing for the team; ensure that technical measures have been taken to prepare the workplace; verify that the workplace meets safety requirements; jointly with the foreman determine the boundaries of the workplace; formalize the admission in the work permit."}'::jsonb,
 'Роли и обязанности',
 3),

-- FAQ 4
('{"ru": "Какой срок действия наряда-допуска?", "tr": "İş izninin geçerlilik süresi nedir?", "en": "What is the validity period of a work permit?"}'::jsonb,
 '{"ru": "Наряд-допуск выдается на срок не более 15 календарных дней со дня начала работы. Наряд-допуск может быть продлен 1 раз на срок не более 15 календарных дней со дня продления.", "tr": "İş izni, işin başlangıç tarihinden itibaren en fazla 15 takvim günü süreyle verilir. İş izni, uzatma tarihinden itibaren en fazla 15 takvim günü süreyle 1 kez uzatılabilir.", "en": "A work permit is issued for a period not exceeding 15 calendar days from the start date of the work. The work permit may be extended once for a period not exceeding 15 calendar days from the date of extension."}'::jsonb,
 'Общие',
 4),

-- FAQ 5
('{"ru": "Сколько человек может быть в бригаде по наряду-допуску?", "tr": "İş izni kapsamında ekipte kaç kişi olabilir?", "en": "How many people can be in a work permit team?"}'::jsonb,
 '{"ru": "Количество работников в бригаде определяется исходя из условий выполнения работы и должно быть не менее двух человек. Максимальное количество - 20 человек (свыше 20 требуется согласование с HSE).", "tr": "Ekipteki çalışan sayısı, işin yürütülme koşullarına göre belirlenir ve en az iki kişi olmalıdır. Maksimum sayı - 20 kişi (20''den fazla olması durumunda HSE ile koordinasyon gereklidir).", "en": "The number of workers in a team is determined based on the work execution conditions and must be at least two people. Maximum number - 20 people (more than 20 requires coordination with HSE)."}'::jsonb,
 'Общие',
 5),

-- FAQ 6
('{"ru": "Какие виды работ требуют оформления наряда-допуска?", "tr": "Hangi iş türleri iş izni gerektirir?", "en": "What types of work require a work permit?"}'::jsonb,
 '{"ru": "Наряд-допуск требуется для: работ на высоте (более 1.8м), огневых работ, работ в замкнутых пространствах, земляных работ, работ с опасными факторами (электричество, химикаты, радиация и т.д.).", "tr": "İş izni şunlar için gereklidir: yüksekte çalışma (1.8m üzeri), sıcak çalışma, kapalı alanlarda çalışma, toprak işleri, tehlikeli faktörlerle çalışma (elektrik, kimyasallar, radyasyon vb.).", "en": "Work permit is required for: work at height (more than 1.8m), hot work, work in confined spaces, earthwork, work with hazardous factors (electricity, chemicals, radiation, etc.)."}'::jsonb,
 'Типы работ',
 6);

-- Проверка данных
SELECT id, question->>'ru' as question_ru, category, order_index FROM faq ORDER BY order_index;
