import logoIcon from '@ahmcho/tailadmin-react/assets/logo/logo-icon.svg';
import logoIconMarkup from '@ahmcho/tailadmin-react/assets/logo/logo-icon.svg?raw';

export type BrandImages = {
    logo: string;
    logoDark: string;
    icon: string;
};

const ICON_SIZE = 32;
const ICON_GAP = 8;
const CHARACTER_WIDTH = 11;
const LIGHT_TEXT_COLOR = '#1D2939';
const DARK_TEXT_COLOR = '#FFFFFF';

const iconContent = logoIconMarkup
    .replace(/^[\s\S]*?<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '');

const escapeXml = (value: string): string =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

const wordmark = (name: string, textColor: string): string => {
    const textWidth = name.length * CHARACTER_WIDTH;
    const width = ICON_SIZE + ICON_GAP + textWidth;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${ICON_SIZE}" viewBox="0 0 ${width} ${ICON_SIZE}">${iconContent}<text x="${ICON_SIZE + ICON_GAP}" y="22" font-family="Outfit, Helvetica, Arial, sans-serif" font-size="20" font-weight="600" fill="${textColor}" textLength="${textWidth}" lengthAdjust="spacingAndGlyphs">${escapeXml(name)}</text></svg>`;

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export const brandImages = (name: string): BrandImages => ({
    logo: wordmark(name, LIGHT_TEXT_COLOR),
    logoDark: wordmark(name, DARK_TEXT_COLOR),
    icon: logoIcon,
});

export { logoIcon };
