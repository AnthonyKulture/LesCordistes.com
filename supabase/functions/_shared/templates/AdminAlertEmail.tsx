import * as React from 'npm:react@19.2.0';
import {
  Section,
  Text,
  Heading,
  Button,
} from 'npm:@react-email/components@0.0.34';
import { BaseLayout } from './BaseLayout.tsx';

interface AdminAlertEmailProps {
  title: string;
  message: string;
  link: string;
  linkText: string;
}

const brandBlue = '#0f172a';
const brandOrange = '#f97316';

export const AdminAlertEmail = ({ title, message, link, linkText }: AdminAlertEmailProps) => (
  <BaseLayout previewText={`LesCordistes - Alerte Admin : ${title}`}>
    <Section>
      <Heading style={{ fontSize: '24px', fontWeight: 'bold' }}>
        ⚙️ Alerte Admin : {title}
      </Heading>
      <Text style={{ fontSize: '16px', lineHeight: '24px' }}>
        {message}
      </Text>
      <Section style={{ padding: '24px 0' }}>
        <Button
          href={link}
          style={{
            backgroundColor: brandBlue,
            borderRadius: '6px',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 'bold',
            textDecoration: 'none',
            textAlign: 'center' as const,
            display: 'block',
            padding: '12px 24px',
          }}
        >
          {linkText}
        </Button>
      </Section>
    </Section>
  </BaseLayout>
);
