import * as React from 'npm:react@19.2.0';
import {
  Section,
  Text,
  Heading,
  Hr,
  Row,
  Column,
  Link,
} from 'npm:@react-email/components@0.0.34';
import { BaseLayout } from './BaseLayout.tsx';

interface PaymentReceiptEmailProps {
  name: string;
  packName: string;
  amount: string;
  creditsAdded: number;
  date: string;
  transactionId: string;
}

const brandBlue = '#0f172a';
const brandOrange = '#f97316';

export const PaymentReceiptEmail = ({ 
  name, 
  packName, 
  amount, 
  creditsAdded, 
  date, 
  transactionId 
}: PaymentReceiptEmailProps) => (
  <BaseLayout previewText={`Reçu de paiement - Pack ${packName} - LesCordistes.com`}>
    <Section>
      <Heading style={{ fontSize: '24px', fontWeight: 'bold' }}>
        🧾 Reçu de votre commande
      </Heading>
      <Text style={{ fontSize: '16px', lineHeight: '24px' }}>
        Bonjour {name},
      </Text>
      <Text style={{ fontSize: '16px', lineHeight: '24px' }}>
        Merci pour votre achat sur LesCordistes.com. Votre solde de crédits a été mis à jour avec succès.
      </Text>

      <Section style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0', margin: '24px 0' }}>
        <Row style={{ marginBottom: '12px' }}>
          <Column style={{ fontWeight: 'bold', color: '#64748b' }}>Produit :</Column>
          <Column style={{ textAlign: 'right' as const }}>Pack {packName} ({creditsAdded} crédits)</Column>
        </Row>
        <Row style={{ marginBottom: '12px' }}>
          <Column style={{ fontWeight: 'bold', color: '#64748b' }}>Montant :</Column>
          <Column style={{ textAlign: 'right' as const, fontWeight: 'bold', fontSize: '18px', color: brandBlue }}>{amount}</Column>
        </Row>
        <Hr style={{ borderColor: '#cbd5e1', margin: '12px 0' }} />
        <Row style={{ marginBottom: '8px' }}>
          <Column style={{ fontSize: '12px', color: '#94a3b8' }}>Date :</Column>
          <Column style={{ textAlign: 'right' as const, fontSize: '12px', color: '#94a3b8' }}>{date}</Column>
        </Row>
        <Row>
          <Column style={{ fontSize: '12px', color: '#94a3b8' }}>Transaction ID :</Column>
          <Column style={{ textAlign: 'right' as const, fontSize: '12px', color: '#94a3b8' }}>{transactionId}</Column>
        </Row>
      </Section>

      <Text style={{ fontSize: '14px', color: '#666' }}>
        Vous pouvez retrouver l'historique complet de vos transactions et vos factures dans votre <Link href="https://lescordistes.com/dashboard/credits" style={{ color: brandBlue }}>espace crédits</Link>.
      </Text>
    </Section>
  </BaseLayout>
);
