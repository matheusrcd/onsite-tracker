export const colors = {
  orange: '#EC7000',
  orangeDark: '#C45D00',
  orangeSoft: '#FFE7CC',
  blue: '#003087',
  blueDark: '#001E5C',
  blueSoft: '#E1E8F5',
  white: '#FFFFFF',
  bg: '#F7F7FA',
  ink: '#0F1B2D',
  inkSoft: '#5B6678',
  line: '#E5E8EE',
  success: '#16A34A',
  danger: '#DC2626',
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
};

export const spacing = (n: number) => n * 8;

export const shadow = {
  card: {
    shadowColor: '#0B1B3A',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
};

export const font = {
  display: '700' as const,
  bold: '700' as const,
  semibold: '600' as const,
  medium: '500' as const,
  regular: '400' as const,
};
