import * as React from 'npm:react@19.2.0';
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
  Heading,
} from 'npm:@react-email/components@0.0.34';

interface BaseLayoutProps {
  previewText: string;
  children: React.ReactNode;
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const header = {
  padding: '32px',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
  padding: '0 32px',
};

const brandBlue = '#0f172a'; // Slate-900 
const brandOrange = '#f97316'; // Orange-500

export const BaseLayout = ({ previewText, children }: BaseLayoutProps) => (
  <Html>
    <Head>
      <Font
        fontFamily="Inter"
        fallbackFontFamily="Arial"
        fontWeight={400}
        fontStyle="normal"
      />
    </Head>
    <Preview>{previewText}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={{ fontSize: '24px', fontWeight: 'bold', color: brandBlue, margin: '0' }}>
            LesCordistes<span style={{ color: brandOrange }}>.com</span>
          </Text>
        </Section>
        <Section style={{ padding: '0 32px' }}>
          {children}
        </Section>
        <Hr style={{ borderColor: '#e6ebf1', margin: '20px 0' }} />
        <Section style={footer}>
          <Text>
            © 2026 LesCordistes.com - Le réseau n°1 des travaux en hauteur.
          </Text>
          <Text>
            <Link href="https://lescordistes.com" style={{ color: brandBlue, textDecoration: 'underline' }}>
              Visiter le site
            </Link>
            {' • '}
            <Link href="https://lescordistes.com/dashboard" style={{ color: brandBlue, textDecoration: 'underline' }}>
              Mon compte
            </Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);
