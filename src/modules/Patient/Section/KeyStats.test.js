import {
    FALLBACK_VALUES,
    formatCompactCount,
    formatStatValue,
    resolveKeyStats
} from './KeyStats';

jest.mock('../../../services/userService', () => ({
    getPublicKeyStats: jest.fn()
}));

describe('KeyStats formatting and fallback', () => {
    test('formats count values with compact K+ and M+ suffixes', () => {
        expect(formatCompactCount(50000)).toEqual({ value: '50', suffix: 'K+' });
        expect(formatCompactCount(1250000)).toEqual({ value: '1.3', suffix: 'M+' });
        expect(formatCompactCount(0)).toEqual({ value: '0', suffix: '' });
    });

    test('keeps percentage formatting separate from count formatting', () => {
        expect(formatStatValue(98, 3)).toEqual({ value: '98', suffix: '%' });
        expect(formatStatValue(0, 3)).toEqual({ value: '0', suffix: '%' });
    });

    test('uses demo values for errors but preserves successful zeros', () => {
        expect(resolveKeyStats({ errCode: 1 })).toEqual([...FALLBACK_VALUES]);
        expect(resolveKeyStats({
            errCode: 0,
            data: { patients: 0, doctors: 0, clinics: 0, satisfactionRate: 0 }
        })).toEqual([0, 0, 0, 0]);
    });
});
