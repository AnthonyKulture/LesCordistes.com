import * as React from 'npm:react@18.3.1';
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Font,
  Link,
} from 'npm:@react-email/components@0.0.34';

interface BaseLayoutProps {
  previewText: string;
  children: React.ReactNode;
}

const brandBlue = '#243355';
const brandBlueLight = '#5B8DDB';
const slate600 = '#475569';
const slate400 = '#94a3b8';
const slate200 = '#e2e8f0';

export const BaseLayout = ({ previewText, children }: BaseLayoutProps) => (
  <Html lang="fr">
    <Head>
      <Font
        fontFamily="Inter"
        fallbackFontFamily="Arial"
        fontWeight={400}
        fontStyle="normal"
      />
    </Head>
    <Preview>{previewText}</Preview>
    <Body style={{ backgroundColor: '#f1f5f9', margin: '0', padding: '0', fontFamily: 'Inter, Arial, sans-serif' }}>

      {/* Header */}
      <Section style={{ backgroundColor: brandBlue, padding: '28px 40px' }}>
        <Img
          src="https://lescordistes.com/lescordistes.com-white-logo.png"
          alt="LesCordistes.com"
          height="36"
          style={{ display: 'block' }}
        />
      </Section>

      {/* Body */}
      <Container style={{
        backgroundColor: '#ffffff',
        maxWidth: '600px',
        margin: '0 auto',
        padding: '40px 40px 48px',
      }}>
        {children}
      </Container>

      {/* Footer */}
      <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 40px 40px' }}>
        <Hr style={{ borderColor: slate200, margin: '0 0 20px' }} />
        <Text style={{ fontSize: '12px', color: slate400, textAlign: 'center', margin: '0 0 8px', lineHeight: '18px' }}>
          © 2026 LesCordistes.com — Le réseau n°1 des travaux en hauteur
        </Text>
        <Text style={{ fontSize: '12px', color: slate400, textAlign: 'center', margin: '0', lineHeight: '18px' }}>
          <Link href="https://lescordistes.com" style={{ color: brandBlueLight, textDecoration: 'none' }}>
            Visiter le site
          </Link>
          {'  ·  '}
          <Link href="https://lescordistes.com/dashboard" style={{ color: brandBlueLight, textDecoration: 'none' }}>
            Mon espace
          </Link>
          {'  ·  '}
          <Link href="mailto:anthony@lescordistes.com" style={{ color: brandBlueLight, textDecoration: 'none' }}>
            Nous contacter
          </Link>
        </Text>
      </Container>

    </Body>
  </Html>
);
