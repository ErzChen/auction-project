import { Dimensions } from 'react-native';

export const colors = {
  navy: '#0c2c4a',
  navyHover: '#123a5e',
  navyTextBody: '#3e5670',
  navyTextMuted: '#7286a5',
  navyTextSub: '#a6b4c6',
  navyTextDisabled: '#c3cdd9',

  whiteTextPrimary: '#faf8f4',
  whiteTextBody: '#d6d2c4',
  whiteTextMuted: '#9da9ba',
  whiteTextSub: '#6c7c90',

  bg: '#faf8f4',
  surface: '#e7e2d8',
  overlay: '#000000',
  overlayTranslucent: 'rgba(0, 0, 0, 0.3)',

  init: '#a8791e',
  initHover: '#8f6519',
  initActive: '#7a5615',
  initDisabled: '#d9cbaa',
  initFocus: 'rgba(168, 121, 30, 0.21)',

  urgent: '#8c3b32',
  urgentHover: '#78312a',
  urgentActive: '#642922',
  urgentDisabled: '#d9bdb8',
  urgentFocus: 'rgba(140, 59, 50, 0.21)',

  success: '#4a6b3e',
  successHover: '#3d5934',
  successActive: '#33482b',
  successDisabled: '#c4d0be',
  successFocus: 'rgba(74, 107, 62, 0.21)',
};

export const fonts = {
  regular: 'Ubuntu Mono',
  bold: 'Ubuntu Mono Bold',
};

export const fontSizes = {
  heading: 28,
  title: 24, 
  subtitle: 16,
  label: 13.6, 
  body: 12, 
};

export const radius = 6;

const { width, height} = Dimensions.get('window');
export const vw = (v: number) => (width * v) / 100;
export const vh = (v: number) => (height * v) / 100;
