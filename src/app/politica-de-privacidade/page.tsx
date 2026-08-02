import type { Metadata } from 'next'

import { LegalPage } from '@/app/termos-de-uso/page'

export const metadata: Metadata = { title: 'Política de Privacidade' }

export default function PrivacyPage() {
  return (
    <LegalPage title="Política de Privacidade">
      <p>
        O Meu Verdin utiliza dados de perfil fornecidos pelo Google para criar e
        proteger sua conta. Dados financeiros inseridos por você são usados
        exclusivamente para disponibilizar as funcionalidades do produto.
      </p>
      <p>
        Não vendemos dados pessoais. O acesso é protegido por autenticação,
        controles de sessão e isolamento dos dados por usuário. Comprovantes,
        quando enviados, ficam em armazenamento privado.
      </p>
      <p>
        Para solicitar informações sobre seus dados ou sua exclusão,
        disponibilize um canal de atendimento antes da publicação em produção.
      </p>
    </LegalPage>
  )
}
