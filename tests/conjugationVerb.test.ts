import { conjugationVerb } from 'legacy/conjugationVerb';
// @ts-ignore
import { verb } from './testCases.json';

describe('verb', () => {
    verb.forEach(({ init: { word, details, add }, expected}) => {
        test(`verb ${word}`, () => {
            const actual = conjugationVerb(word, add);

            if (actual === null) {
                expect(actual).toBe(expected);
            } else {
                expect(actual).toMatchObject(expected);
            }
        });
    });
});
