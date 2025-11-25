import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { Language } from '@/lib/ptw-types'
import { PROCEDURE_DUTIES, HIGH_RISK_WORKS, PROCESS_FLOW, ROLE_LABELS } from '@/lib/ptw-constants'
import { PTW_WORKFLOW, WORKFLOW_PHASES } from '@/lib/ptw-workflow'

interface ProcessTabProps {
  language: Language
}

export function ProcessTab({ language }: ProcessTabProps) {
  const labels = {
    ru: {
      processTitle: 'Процесс оформления НД',
      workflowTitle: 'Схема открытия наряд-допуска',
      highRiskTitle: 'Опасные работы',
      procedureTitle: 'Процедура STE-PR-10-05-Rev2',
      issuerTitle: 'Обязанности выдающего НД',
      supervisorTitle: 'Обязанности ответственного руководителя',
      foremanTitle: 'Обязанности производителя работ',
      workerTitle: 'Обязанности исполнителей работ',
    },
    tr: {
      processTitle: 'İş İzni Düzenleme Süreci',
      workflowTitle: 'İş İzni Açma Şeması',
      highRiskTitle: 'Tehlikeli İşler',
      procedureTitle: 'STE-PR-10-05-Rev2 Prosedürü',
      issuerTitle: 'İzni Verenin Yükümlülükleri',
      supervisorTitle: 'Sorumlu Yöneticinin Yükümlülükleri',
      foremanTitle: 'İşi Yapanın Yükümlülükleri',
      workerTitle: 'İşçilerin Yükümlülükleri',
    },
    en: {
      processTitle: 'PTW Issuance Process',
      workflowTitle: 'PTW Opening Flowchart',
      highRiskTitle: 'High-Risk Works',
      procedureTitle: 'STE-PR-10-05-Rev2 Procedure',
      issuerTitle: 'PTW Issuer Obligations',
      supervisorTitle: 'Responsible Supervisor Obligations',
      foremanTitle: 'Work Performer Obligations',
      workerTitle: 'Team Members Obligations',
    },
  }

  const l = labels[language]

  const groupedWorkflow = PTW_WORKFLOW.reduce((acc, step) => {
    const phase = step.phase[language]
    if (!acc[phase]) {
      acc[phase] = []
    }
    acc[phase].push(step)
    return acc
  }, {} as Record<string, typeof PTW_WORKFLOW>)

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span>🔄</span>
          {l.workflowTitle}
        </h2>
        <div className="space-y-8">
          {Object.entries(groupedWorkflow).map(([phase, steps], phaseIndex) => (
            <div key={phaseIndex}>
              <div className="mb-4 flex items-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-primary px-3 py-1 bg-primary/10 rounded-full">
                  {phase}
                </h3>
                <div className="h-px flex-1 bg-gradient-to-l from-primary/50 to-transparent" />
              </div>
              <div className="space-y-3">
                {steps.map((step, stepIndex) => (
                  <div key={stepIndex} className="flex items-start gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center font-bold text-2xl flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                      {step.icon}
                    </div>
                    <div className="flex-1 bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="font-semibold text-sm text-primary mb-1">{step.actor[language]}</div>
                      <div className="text-sm leading-relaxed text-muted-foreground">{step.action[language]}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span>📋</span>
          {l.processTitle}
        </h2>
        <div className="space-y-3">
          {PROCESS_FLOW.map((step, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-sm">
                {index + 1}
              </div>
              <div className="pt-2">
                <p className="font-semibold text-sm">{step[language]}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <span className="text-lg">⚠️</span>
          {l.highRiskTitle}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {HIGH_RISK_WORKS[language].map((work, index) => (
            <div key={index} className="py-2 px-3 border rounded-md flex items-start gap-2 text-sm bg-destructive/5 hover:bg-destructive/10 transition-colors">
              <span className="font-bold text-destructive mt-0.5">⚠️</span>
              <span>{work}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-6">{l.procedureTitle}</h2>

        <div className="space-y-6">
          <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-l-[oklch(0.60_0.18_290)]">
            <h4 className="font-bold mb-3 text-[oklch(0.60_0.18_290)]">{l.issuerTitle}</h4>
            <div className="space-y-2">
              {PROCEDURE_DUTIES.issuer[language].map((duty, index) => (
                <div key={index} className="flex gap-2 text-sm">
                  <span className="text-primary font-bold">•</span>
                  <span className="leading-relaxed">{duty}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-l-[oklch(0.65_0.22_340)]">
            <h4 className="font-bold mb-3 text-[oklch(0.65_0.22_340)]">{l.supervisorTitle}</h4>
            <div className="space-y-2">
              {PROCEDURE_DUTIES.supervisor[language].map((duty, index) => (
                <div key={index} className="flex gap-2 text-sm">
                  <span className="text-primary font-bold">•</span>
                  <span className="leading-relaxed">{duty}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-l-[oklch(0.70_0.18_60)]">
            <h4 className="font-bold mb-3 text-[oklch(0.70_0.18_60)]">{l.foremanTitle}</h4>
            <div className="space-y-2">
              {PROCEDURE_DUTIES.foreman[language].map((duty, index) => (
                <div key={index} className="flex gap-2 text-sm">
                  <span className="text-primary font-bold">•</span>
                  <span className="leading-relaxed">{duty}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-l-[oklch(0.60_0.20_270)]">
            <h4 className="font-bold mb-3 text-[oklch(0.60_0.20_270)]">{l.workerTitle}</h4>
            <div className="space-y-2">
              {PROCEDURE_DUTIES.worker[language].map((duty, index) => (
                <div key={index} className="flex gap-2 text-sm">
                  <span className="text-primary font-bold">•</span>
                  <span className="leading-relaxed">{duty}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
