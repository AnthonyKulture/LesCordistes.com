import * as React from 'npm:react@18.3.1';
import { Section, Text, Heading, Button, Hr, Row, Column, Link } from 'npm:@react-email/components@0.0.34';
import { BaseLayout } from './BaseLayout.tsx';

interface PaymentReceiptEmailProps {
  name: string;
  packName: string;
  amount: string;
  creditsAdded: number;
  date: string;
  transactionId: string;
}

const brandBlue = '#243355';
const brandBlueLight = '#5B8DDB';
const slate700 = '#334155';
const slate500 = '#64748b';
const slate400 = '#94a3b8';
const slate200 = '#e2e8f0';

export const PaymentReceiptEmail = ({ name, packName, amount, creditsAdded, date, transactionId }: PaymentReceiptEmailProps) => (
  <BaseLayout previewText={`Reçu de paiement — Pack ${packName} · ${amount}`}>

    {/* Success badge */}
    <Section style={{
      backgroundColor: '#f0fdf4',
      borderLeft: '4px solid #16a34a',
      borderRadius: '0 6px 6px 0',
      padding: '14px 18px',
      margin: '0 0 28px',
    }}>
      <Text style={{ fontSize: '13px', fontWeight: '700', color: '#15803d', margin: '0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Paiement confirmé
      </Text>
    </Section>

    <Heading style={{ fontSize: '22px', fontWeight: '700', color: brandBlue, margin: '0 0 8px', lineHeight: '30px' }}>
      Votre achat a bien été enregistré
    </Heading>
    <Text style={{ fontSize: '15px', color: slate500, margin: '0 0 24px', lineHeight: '22px' }}>
      Bonjour {name},
    </Text>

    <Text style={{ fontSize: '15px', color: slate700, lineHeight: '24px', margin: '0 0 28px' }}>
      Merci pour votre achat. Vos crédits ont été ajoutés à votre compte et sont immédiatement disponibles pour débloquer des leads.
    </Text>

    {/* Receipt */}
    <Section style={{ border: `1px solid ${slate200}`, borderRadius: '8px', overflow: 'hidden', margin: '0 0 28px' }}>
      <Section style={{ backgroundColor: '#f8fafc', padding: '14px 20px', borderBottom: `1px solid ${slate200}` }}>
        <Text style={{ fontSize: '13px', fontWeight: '600', color: brandBlue, margin: '0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Récapitulatif de commande
        </Text>
      </Section>
      <Section style={{ padding: '20px' }}>
        <Row style={{ marginBottom: '14px' }}>
          <Column>
            <Text style={{ fontSize: '14px', color: slate500, margin: '0' }}>Produit</Text>
          </Column>
          <Column style={{ textAlign: 'right' as const }}>
            <Text style={{ fontSize: '14px', color: slate700, fontWeight: '600', margin: '0' }}>Pack {packName}</Text>
          </Column>
        </Row>
        <Row style={{ marginBottom: '14px' }}>
          <Column>
            <Text style={{ fontSize: '14px', color: slate500, margin: '0' }}>Crédits ajoutés</Text>
          </Column>
          <Column style={{ textAlign: 'right' as const }}>
            <Text style={{ fontSize: '14px', color: slate700, fontWeight: '600', margin: '0' }}>{creditsAdded} crédits</Text>
          </Column>
        </Row>
        <Hr style={{ borderColor: slate200, margin: '14px 0' }} />
        <Row style={{ marginBottom: '14px' }}>
          <Column>
            <Text style={{ fontSize: '15px', fontWeight: '700', color: brandBlue, margin: '0' }}>Total payé</Text>
          </Column>
          <Column style={{ textAlign: 'right' as const }}>
            <Text style={{ fontSize: '18px', fontWeight: '700', color: brandBlue, margin: '0' }}>{amount}</Text>
          </Column>
        </Row>
        <Hr style={{ borderColor: slate200, margin: '14px 0' }} />
        <Row style={{ marginBottom: '8px' }}>
          <Column>
            <Text style={{ fontSize: '12px', color: slate400, margin: '0' }}>Date</Text>
          </Column>
          <Column style={{ textAlign: 'right' as const }}>
            <Text style={{ fontSize: '12px', color: slate400, margin: '0' }}>{date}</Text>
          </Column>
        </Row>
        <Row>
          <Column>
            <Text style={{ fontSize: '12px', color: slate400, margin: '0' }}>Réf. transaction</Text>
          </Column>
          <Column style={{ textAlign: 'right' as const }}>
            <Text style={{ fontSize: '12px', color: slate400, margin: '0', wordBreak: 'break-all' as const }}>{transactionId}</Text>
          </Column>
        </Row>
      </Section>
    </Section>

    <Button
      href="https://lescordistes.com/jobs"
      style={{
        backgroundColor: brandBlue,
        borderRadius: '6px',
        color: '#ffffff',
        fontSize: '15px',
        fontWeight: '600',
        textDecoration: 'none',
        textAlign: 'center' as const,
        display: 'block',
        padding: '14px 24px',
      }}
    >
      Voir les missions disponibles
    </Button>

    <Hr style={{ borderColor: slate200, margin: '28px 0' }} />

    <Text style={{ fontSize: '13px', color: slate500, margin: '0', lineHeight: '20px' }}>
      Retrouvez l'historique de vos achats et vos factures dans votre{' '}
      <Link href="https://lescordistes.com/dashboard/credits" style={{ color: brandBlueLight, textDecoration: 'none' }}>
        espace crédits
      </Link>.
    </Text>

  </BaseLayout>
);
